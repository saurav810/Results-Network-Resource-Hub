import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { FilterPanel } from './components/FilterPanel';
import { ResourceList } from './components/ResourceList';
import AppliedFilterChips from './components/AppliedFilterChips';
import { SearchBar } from './components/SearchBar';
import SortDropdown from './components/SortDropdown';
import ViewToggle from './components/ViewToggle';
import { ResourceModal } from './components/ResourceModal';
import EmptyState from './components/EmptyState';
import { Pagination } from './components/Pagination';
import type { Resource, Filters, SortOrder } from './types';

const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vThPGJvxt6shzHp6641v5MkGfvAWDFnqThVGx1vyZHYLtxfi8mbZKNzR5WMdiFe9rqdxYspnMPCQSZe/pub?gid=888196531&single=true&output=csv';

const ITEMS_PER_PAGE = 12;

// Clean, robust CSV parser for handling Google Sheets CSV output
const parseCSV = (text: string): Resource[] => {
    // Normalize line endings to \n
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = "";
    let inQuote = false;
    
    for (let i = 0; i < cleanText.length; i++) {
        const char = cleanText[i];
        const nextChar = cleanText[i+1];
        
        if (inQuote) {
            // Check for escaped quote ("")
            if (char === '"' && nextChar === '"') { 
                currentCell += '"'; 
                i++; // Skip next char
            } else if (char === '"') { 
                inQuote = false; 
            } else { 
                currentCell += char; 
            }
        } else {
            if (char === '"') { 
                inQuote = true; 
            } else if (char === ',') { 
                currentRow.push(currentCell.trim()); 
                currentCell = ""; 
            } else if (char === '\n') {
                currentRow.push(currentCell.trim()); 
                rows.push(currentRow); 
                currentRow = []; 
                currentCell = "";
            } else {
                currentCell += char;
            }
        }
    }
    
    // Push the very last cell/row if exists
    if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
    }

    if (rows.length < 2) {
        console.warn("Parsed CSV has fewer than 2 rows (headers + data).");
        return [];
    }

    const headers = rows[0].map(h => h.trim());
    
    // Safeguard: Check if Published column exists
    const hasPublishedColumn = headers.includes('Published');
    if (!hasPublishedColumn) {
        console.warn("⚠️ Published column missing in CSV; no resources will display. Please add 'Published' column (Column Q) to the Google Sheet.");
    }
    
    const resources: Resource[] = [];

    for (let i = 1; i < rows.length; i++) {
        const values = rows[i];
        // Skip empty rows
        if (values.length === 1 && !values[0]) continue;
        
        const resource: Resource = {};
        let hasData = false;
        
        headers.forEach((header, index) => {
            const val = values[index] || '';
            if (val) hasData = true;
            resource[header] = val;
        });

        // New inclusion rules:
        // 1. Must have data in the row
        // 2. Must have a non-empty Title
        // 3. Must have Published = TRUE (Column Q checked)
        const title = (resource['Title'] || '').trim();
        const published = isCheckboxTrue(resource['Published']);
        
        if (hasData && title && published) {
            resources.push(resource);
        }
    }

    console.log(`Successfully parsed ${resources.length} published resources.`);
    return resources;
};

const FILTERABLE_HEADERS = [
    'Topic Area', 
    'Type of Resource', 
    'Policy Stage',
    // Use the new column name 'Practice Area' as the canonical filter header.
    // Fallback to 'Field of Practice' (older sheet name) is handled when reading values.
    'Practice Area'
];

/**
 * Resolve a resource field value accounting for temporary column renames.
 * For 'Practice Area', prefer 'Practice Area' and fall back to 'Field of Practice' if missing.
 * This fallback is temporary and should be removed once the sheet migration completes.
 */
const resolveField = (resource: Resource, header: string) => {
    if (header === 'Practice Area') {
        return resource['Practice Area'] || resource['Field of Practice'] || '';
    }
    return resource[header] || '';
};

/**
 * Normalize a string value by trimming whitespace and converting to lowercase.
 * Safely handles null/undefined values.
 */
const normalizeString = (value: any): string => {
    if (value === null || value === undefined) return '';
    return String(value).trim().toLowerCase();
};

/**
 * Check if a resource is marked as "Member submitted" in the Source column.
 */
const isMemberSubmitted = (resource: Resource): boolean => {
    return normalizeString(resource['Source']) === 'member submitted';
};

/**
 * Check if a checkbox value should be considered true.
 * Accepts: true, "true", "TRUE", "yes", "1" (case-insensitive).
 */
const isCheckboxTrue = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    const normalized = normalizeString(value);
    return normalized === 'true' || normalized === 'yes' || normalized === '1';
};

/**
 * Check if a resource is marked as "Published" (Column Q).
 * A resource must be published to appear anywhere in the app.
 */
const isPublished = (resource: Resource): boolean => {
    return isCheckboxTrue(resource['Published']);
};

/**
 * Determine if a resource is "featured".
 * A resource is featured if:
 * - Source is "Member submitted" OR
 * - Featured checkbox is true
 */
const isFeatured = (resource: Resource): boolean => {
    return isMemberSubmitted(resource) || isCheckboxTrue(resource['Featured']);
};

const App: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [searchQuery, setSearchQuery] = useState('');
    // Debounced search query to avoid running expensive filtering on every keystroke
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
    const [filters, setFilters] = useState<Filters>({});
    const [sortOrder, setSortOrder] = useState<SortOrder>('title-asc');
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'featured' | 'all'>('all');
    
    const fetchResources = useCallback(async () => {
        setStatus('loading');
        try {
            const response = await fetch(GOOGLE_SHEET_URL);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const csvText = await response.text();

            // Safety check: sometimes Google returns HTML login pages instead of CSV
            if (csvText.trim().startsWith('<!DOCTYPE html') || csvText.trim().startsWith('<html')) {
                console.error("Received HTML instead of CSV. Check Google Sheet permissions.");
                setStatus('error');
                return;
            }

            const parsedResources = parseCSV(csvText);
            setResources(parsedResources);
            setStatus('success');
        } catch (error) {
            console.error("Failed to fetch or parse resources:", error);
            setStatus('error');
        }
    }, []);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    // Scroll to top when page changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    // Reset to page 1 when filters search or sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, searchQuery, sortOrder]);

    // Debounce searchQuery -> debouncedSearchQuery (200ms)
    // If the user clears the input entirely, update debounced immediately so results update without delay.
    useEffect(() => {
        if (searchQuery.trim() === '') {
            // clear immediately when input emptied
            setDebouncedSearchQuery('');
            return;
        }
        const id = setTimeout(() => setDebouncedSearchQuery(searchQuery), 200);
        return () => clearTimeout(id);
    }, [searchQuery]);

    const filterOptions = useMemo(() => {
        const options: Record<string, string[]> = {};
        FILTERABLE_HEADERS.forEach(header => {
            const values = new Set<string>();
            resources.forEach(resource => {
                // Read the potentially renamed field using resolveField (Practice Area -> fallback Field of Practice)
                const resourceValue = resolveField(resource, header);
                if (resourceValue) {
                    resourceValue.split(',').forEach(val => {
                        const trimmedVal = val.trim();
                        if (trimmedVal) values.add(trimmedVal);
                    });
                }
            });
            options[header] = Array.from(values).sort();
        });
        return options;
    }, [resources]);

    // Compute featured resources (up to 12)
    const featuredResources = useMemo(() => {
        const featuredBase = resources.filter(resource => isFeatured(resource));
        return featuredBase.slice(0, 12);
    }, [resources]);

    // Set initial viewMode based on whether we have featured resources
    useEffect(() => {
        if (status === 'success' && featuredResources.length > 0) {
            setViewMode('featured');
        } else {
            setViewMode('all');
        }
    }, [status, featuredResources.length]);
    
    const handleFilterChange = (header: string, value: string) => {
        setFilters(prevFilters => {
            const currentValues = prevFilters[header] || [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            
            if (newValues.length === 0) {
                const { [header]: _, ...rest } = prevFilters;
                return rest;
            }
            return { ...prevFilters, [header]: newValues };
        });
    };

    const handleClearFilters = () => {
        setFilters({});
    };

    const handleRemoveFilterValue = (header: string, value: string) => {
        setFilters(prev => {
            const current = prev[header] || [];
            const next = current.filter(v => v !== value);
            if (next.length === 0) {
                const { [header]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [header]: next };
        });
    };

    const processedResources = useMemo(() => {
        // Start with the appropriate base dataset based on viewMode
        let baseResources = resources;
        if (viewMode === 'featured') {
            // When in featured view, start from all featured resources (not yet capped)
            baseResources = resources.filter(resource => isFeatured(resource));
        }

        // Searchable fields (documentation):
        // - Title
        // - Summary (short description)
        // - Full Description (long description)
        // - Author or Creator
        // - Relevant Agencies
        // - Jurisdictions Featured
        // Use debounced search query and normalize by trimming + lowercasing
        const normalizedQuery = debouncedSearchQuery.trim().toLowerCase();
        const filtered = baseResources.filter(resource => {
            const query = normalizedQuery;
            const searchMatch = query === '' ||
                (resource['Title'] || '').toLowerCase().includes(query) ||
                (resource['Summary'] || '').toLowerCase().includes(query) ||
                (resource['Full Description'] || '').toLowerCase().includes(query) ||
                (resource['Author or Creator'] || '').toLowerCase().includes(query) ||
                (resource['Relevant Agencies'] || '').toLowerCase().includes(query) ||
                // Optional small enhancement: include Jurisdictions Featured in searchable text
                (resource['Jurisdictions Featured'] || '').toLowerCase().includes(query);

            if (!searchMatch) return false;

            return Object.entries(filters).every(([header, selectedValues]) => {
                if ((selectedValues as string[]).length === 0) return true;
                // Use resolveField to read Practice Area with a fallback to Field of Practice
                const resourceValue = resolveField(resource, header);
                if (!resourceValue) return false;
                const resourceTags = resourceValue.split(',').map(tag => tag.trim());
                return (selectedValues as string[]).some(selectedValue => resourceTags.includes(selectedValue));
            });
        });

        const sorted = [...filtered];
        sorted.sort((a, b) => {
            switch (sortOrder) {
                case 'title-asc':
                    return (a['Title'] || '').localeCompare(b['Title'] || '');
                case 'title-desc':
                    return (b['Title'] || '').localeCompare(a['Title'] || '');
                default:
                    return 0;
            }
        });
        return sorted;

    }, [resources, debouncedSearchQuery, filters, sortOrder, viewMode]);

    // Displayed resources (single source of truth for count and rendered cards)
    const displayedResources = processedResources;

    // Pagination Logic
    const totalPages = Math.ceil(displayedResources.length / ITEMS_PER_PAGE);
    const currentResources = displayedResources.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Compute simple query/filter flags and loading/error state once (page/container responsibility)
    // hasSearch reflects the immediate input value so UI controls (e.g., Clear search) follow what the user types.
    const hasSearch = searchQuery.trim().length > 0;
    const hasFilters = Object.keys(filters).length > 0;
    const hasAnyQueryOrFilter = hasSearch || hasFilters;
    const isLoading = status === 'loading';
    const isError = status === 'error';

    // Single decision block for empty-state selection
    let emptyState: React.ReactNode = null;
    if (!isLoading) {
        if (isError) {
            emptyState = (
                <EmptyState
                    variant="error"
                    title={`We couldn’t load resources`}
                    description={`Please try again. If the problem continues, let us know.`}
                    primaryAction={{ label: 'Retry', onClick: () => fetchResources() }}
                />
            );
        } else if (status === 'success' && resources.length === 0) {
            // True empty catalog
            emptyState = (
                <EmptyState
                    variant="empty-catalog"
                    title={`No resources available yet`}
                    description={`We’re adding resources and tools to support local leaders.`}
                    primaryAction={{ label: 'Refresh', onClick: () => fetchResources() }}
                />
            );
        } else if (status === 'success' && displayedResources.length === 0 && hasAnyQueryOrFilter) {
            // No results due to search/filters
            emptyState = (
                <EmptyState
                    variant="no-results"
                    title={`No resources match your filters`}
                    description={`Try removing a filter or using a broader search term.`}
                    primaryAction={{ label: 'Clear all filters', onClick: handleClearFilters }}
                    secondaryAction={hasSearch ? { label: 'Clear search', onClick: () => { setSearchQuery(''); setDebouncedSearchQuery(''); } } : undefined}
                />
            );
        }
    }

    return (
        <div className="bg-slate-50 min-h-full font-sans flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    <aside className="lg:col-span-1">
                        <FilterPanel
                            options={filterOptions}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                        />
                    </aside>
                    <div className="lg:col-span-3 space-y-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-4 flex-nowrap">
                                <div className="flex-1 min-w-0">
                                    <SearchBar
                                        searchQuery={searchQuery}
                                        onSearchChange={setSearchQuery}
                                        showHelper={false}
                                    />
                                </div>
                                <div className="flex-none flex items-center gap-3">
                                    <ViewToggle
                                        viewMode={viewMode}
                                        onViewChange={setViewMode}
                                        hasFeatured={featuredResources.length > 0}
                                    />
                                    <SortDropdown
                                        sortOrder={sortOrder}
                                        onSortChange={setSortOrder}
                                    />
                                </div>
                            </div>
                            <div>
                                <p className="mt-1 text-sm text-slate-500">Search by topic, keyword, or jurisdiction (e.g., "Philadelphia").</p>
                            </div>
                        </div>
                        {isLoading && <p className="text-center text-slate-500">Loading resources...</p>}
                        {!isLoading && emptyState ? (
                            <div>
                                <AppliedFilterChips filters={filters} onRemove={handleRemoveFilterValue} onClearAll={handleClearFilters} />
                                <div className="mt-4">{emptyState}</div>
                            </div>
                        ) : (
                            !isLoading && (
                                <>
                                    {viewMode === 'featured' && featuredResources.length > 0 && !hasAnyQueryOrFilter && (
                                        <div className="space-y-4">
                                            <div>
                                                <h2 className="text-2xl font-bold font-display text-[#051632]">Featured resources</h2>
                                                <p className="text-sm text-slate-600 mt-1">Highlighted resources, including member-submitted and timely picks.</p>
                                            </div>
                                            <ResourceList 
                                                resources={featuredResources} 
                                                onResourceClick={setSelectedResource}
                                            />
                                            <div className="flex justify-center pt-4">
                                                <button
                                                    onClick={() => setViewMode('all')}
                                                    className="text-[#0053b4] hover:text-[#003d85] font-medium text-sm underline focus:outline-none focus:ring-2 focus:ring-[#0053b4] focus:ring-offset-2 rounded px-2 py-1"
                                                >
                                                    See all resources
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {(viewMode === 'all' || hasAnyQueryOrFilter) && (
                                        <>
                                            <AppliedFilterChips filters={filters} onRemove={handleRemoveFilterValue} onClearAll={handleClearFilters} />
                                            <p className="text-sm text-slate-500 mb-2">
                                                {hasAnyQueryOrFilter ? (
                                                    <>Showing {displayedResources.length} matching resource{displayedResources.length !== 1 ? 's' : ''}</>
                                                ) : (
                                                    <>Showing {displayedResources.length} resource{displayedResources.length !== 1 ? 's' : ''}</>
                                                )}
                                            </p>
                                            <ResourceList 
                                                resources={currentResources} 
                                                onResourceClick={setSelectedResource}
                                            />
                                            {totalPages > 1 && (
                                                <div className="mt-8">
                                                    <Pagination
                                                        currentPage={currentPage}
                                                        totalPages={totalPages}
                                                        onPageChange={setCurrentPage}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )
                        )}
                    </div>
                </div>
            </main>
            {selectedResource && (
                <ResourceModal 
                    resource={selectedResource} 
                    onClose={() => setSelectedResource(null)} 
                />
            )}
        </div>
    );
};

export default App;