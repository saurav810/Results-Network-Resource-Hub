import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { FilterPanel } from './components/FilterPanel';
import { ResourceList } from './components/ResourceList';
import { SearchBar } from './components/SearchBar';
import type { Resource, Filters } from './types';

// The URL for your live Google Sheet data
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSTxUNASxygD_MAh9zIzdYeRqISiBKM0NXD7tuB6GNix6VNjeHbeQLmiHCVXfw0icCUrKy7VMQnSoNp/pub?output=csv';

// Helper function to parse CSV data
const parseCSV = (csvText: string): Resource[] => {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const resources: Resource[] = [];

    for (let i = 1; i < lines.length; i++) {
        // A simple regex to handle commas inside quoted fields
        const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const resource: Resource = {};
        headers.forEach((header, index) => {
            resource[header] = (values[index] || '').replace(/"/g, '').trim();
        });
        resources.push(resource);
    }
    return resources;
};

// Headers that should be available for filtering
const FILTERABLE_HEADERS = [
    'Topic Area (New)', 
    'Resource Type (New)', 
    'Local Standards of Excellence Tags'
];

const App: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<Filters>({});
    
    // Ref for the main container to measure its height
    const appRef = useRef<HTMLDivElement>(null);

    // This effect will measure the app's height and send it to the parent page
    useEffect(() => {
        const targetNode = appRef.current;
        if (!targetNode) return;

        const resizeObserver = new ResizeObserver(() => {
            const newHeight = targetNode.scrollHeight;
            // Send a message to the parent window with the app's height
            window.parent.postMessage({
                type: 'resize-iframe',
                height: newHeight,
            }, '*'); // Use a specific origin in production for security
        });

        resizeObserver.observe(targetNode);

        // Initial height check
        const initialHeight = targetNode.scrollHeight;
         window.parent.postMessage({
            type: 'resize-iframe',
            height: initialHeight,
        }, '*');


        return () => resizeObserver.disconnect();
    }, [status, resources]); // Rerun when data changes

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(GOOGLE_SHEET_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const csvText = await response.text();
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

    const filterOptions = useMemo(() => {
        const options: Record<string, string[]> = {};
        FILTERABLE_HEADERS.forEach(header => {
            const values = new Set<string>();
            resources.forEach(resource => {
                const resourceValue = resource[header];
                if (resourceValue) {
                    // Split comma-separated values into individual tags
                    resourceValue.split(',').forEach(val => {
                        const trimmedVal = val.trim();
                        if (trimmedVal) {
                            values.add(trimmedVal);
                        }
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

            return {
                ...prevFilters,
                [header]: newValues
            };
        });
    };

    const filteredResources = useMemo(() => {
        return resources.filter(resource => {
            // Text search filter (searches Title, Description, Author, Affiliation)
            const query = searchQuery.toLowerCase();
            const searchMatch = query === '' ||
                (resource['Resource Title'] || '').toLowerCase().includes(query) ||
                (resource['Description'] || '').toLowerCase().includes(query) ||
                (resource['Author/Creator(new)'] || '').toLowerCase().includes(query) ||
                (resource['Affiliation(new)'] || '').toLowerCase().includes(query);

            if (!searchMatch) return false;

            // Dropdown filters
            return Object.entries(filters).every(([header, selectedValues]) => {
                if (selectedValues.length === 0) return true;
                const resourceValue = resource[header];
                if (!resourceValue) return false;

                // Check if any of the resource's tags for this header match any selected filter
                const resourceTags = resourceValue.split(',').map(tag => tag.trim());
                return selectedValues.some(selectedValue => resourceTags.includes(selectedValue));
            });
        });
    }, [resources, searchQuery, filters]);

    return (
        <div ref={appRef} className="bg-slate-50 min-h-screen font-sans">
            <Header />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    <aside className="lg:col-span-1">
                        <FilterPanel
                            options={filterOptions}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                        />
                    </aside>
                    <div className="lg:col-span-3 space-y-6">
                        <SearchBar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                        />
                        {status === 'loading' && <p className="text-center text-slate-500">Loading resources...</p>}
                        {status === 'error' && <p className="text-center text-red-500">Failed to load resources. Please try again later.</p>}
                        {status === 'success' && <ResourceList resources={filteredResources} />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;