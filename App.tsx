import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { FilterPanel } from './components/FilterPanel';
import { ResourceList } from './components/ResourceList';
import { SearchBar } from './components/SearchBar';
import type { Resource, Filters } from './types';

const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSTxUNASxygD_MAh9zIzdYeRqISiBKM0NXD7tuB6GNix6VNjeHbeQLmiHCVXfw0icCUrKy7VMQnSoNp/pub?output=csv';

const parseCSV = (csvText: string): Resource[] => {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const resources: Resource[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (values.length < headers.length) continue;
        const resource: Resource = {};
        headers.forEach((header, index) => {
            resource[header] = (values[index] || '').replace(/"/g, '').trim();
        });
        resources.push(resource);
    }
    return resources;
};

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
    
    useEffect(() => {
        const fetchData = async () => {
            setStatus('loading');
            try {
                const response = await fetch(GOOGLE_SHEET_URL);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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

    const filteredResources = useMemo(() => {
        return resources.filter(resource => {
            const query = searchQuery.toLowerCase();
            const searchMatch = query === '' ||
                (resource['Resource Title'] || '').toLowerCase().includes(query) ||
                (resource['Description'] || '').toLowerCase().includes(query) ||
                (resource['Author/Creator(new)'] || '').toLowerCase().includes(query) ||
                (resource['Affiliation(new)'] || '').toLowerCase().includes(query);

            if (!searchMatch) return false;

            return Object.entries(filters).every(([header, selectedValues]) => {
                // FIX: Cast `selectedValues` to `string[]` as its type is inferred as `unknown`.
                if ((selectedValues as string[]).length === 0) return true;
                const resourceValue = resource[header];
                if (!resourceValue) return false;
                const resourceTags = resourceValue.split(',').map(tag => tag.trim());
                return (selectedValues as string[]).some(selectedValue => resourceTags.includes(selectedValue));
            });
        });
    }, [resources, searchQuery, filters]);

    return (
        <div className="bg-slate-50 h-full font-sans flex flex-col">
            <Header />
            <main className="flex-grow overflow-y-auto container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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