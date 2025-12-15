import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { FilterPanel } from './components/FilterPanel';
import { ResourceList } from './components/ResourceList';
import AppliedFilterChips from './components/AppliedFilterChips';
import { SearchBar } from './components/SearchBar';
import SortDropdown from './components/SortDropdown';
import { ResourceModal } from './components/ResourceModal';
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

        if (hasData) {
            resources.push(resource);
        }
    }

    console.log(`Successfully parsed ${resources.length} resources.`);
    return resources;
};

const FILTERABLE_HEADERS = [
    'Topic Area', 
    'Type of Resource', 
    'Policy Stage',
    'Field of Practice'
];

const App: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<Filters>({});
    const [sortOrder, setSortOrder] = useState<SortOrder>('default');
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    useEffect(() => {
        const fetchData = async () => {
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
        };
        fetchData();
    }, []);

    // Scroll to top when page changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    // Reset to page 1 when filters search or sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, searchQuery, sortOrder]);

    const filterOptions = useMemo(() => {
        const options: Record<string, string[]> = {};
        FILTERABLE_HEADERS.forEach(header => {
            const values = new Set<string>();
            resources.forEach(resource => {
                const resourceValue = resource[header];
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
        const filtered = resources.filter(resource => {
            const query = searchQuery.toLowerCase();
            const searchMatch = query === '' ||
                (resource['Title'] || '').toLowerCase().includes(query) ||
                (resource['Summary'] || '').toLowerCase().includes(query) ||
                (resource['Full Description'] || '').toLowerCase().includes(query) ||
                (resource['Author or Creator'] || '').toLowerCase().includes(query) ||
                (resource['Relevant Agencies'] || '').toLowerCase().includes(query);

            if (!searchMatch) return false;

            return Object.entries(filters).every(([header, selectedValues]) => {
                if ((selectedValues as string[]).length === 0) return true;
                const resourceValue = resource[header];
                if (!resourceValue) return false;
                const resourceTags = resourceValue.split(',').map(tag => tag.trim());
                return (selectedValues as string[]).some(selectedValue => resourceTags.includes(selectedValue));
            });
        });

        if (sortOrder === 'default') {
            return filtered;
        }

        const sorted = [...filtered];
        sorted.sort((a, b) => {
            switch (sortOrder) {
                case 'title-asc':
                    return (a['Title'] || '').localeCompare(b['Title'] || '');
                case 'title-desc':
                    return (b['Title'] || '').localeCompare(a['Title'] || '');
                case 'author-asc':
                    return (a['Author or Creator'] || '').localeCompare(b['Author or Creator'] || '');
                case 'author-desc':
                    return (b['Author or Creator'] || '').localeCompare(a['Author or Creator'] || '');
                default:
                    return 0;
            }
        });
        return sorted;

    }, [resources, searchQuery, filters, sortOrder]);

    // Pagination Logic
    const totalPages = Math.ceil(processedResources.length / ITEMS_PER_PAGE);
    const currentResources = processedResources.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

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
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <div className="flex-grow w-full">
                                <SearchBar
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                />
                            </div>
                            <div className="w-full sm:w-auto">
                                <SortDropdown
                                    sortOrder={sortOrder}
                                    onSortChange={setSortOrder}
                                />
                            </div>
                        </div>
                        {status === 'loading' && <p className="text-center text-slate-500">Loading resources...</p>}
                        {status === 'error' && <p className="text-center text-red-500">Failed to load resources. Please try again later.</p>}
                        {status === 'success' && (
                            <>
                                <AppliedFilterChips filters={filters} onRemove={handleRemoveFilterValue} onClearAll={handleClearFilters} />
                                <p className="text-sm text-slate-500 mb-2">
                                    Showing {processedResources.length} resource{processedResources.length !== 1 ? 's' : ''}
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