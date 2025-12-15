import React, { useState, useEffect, useRef } from 'react';
import type { Filters } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ResetIcon } from './icons/ResetIcon';
import Button from './Button';
import Tooltip from './Tooltip';

interface FilterPanelProps {
    options: Record<string, string[]>;
    filters: Filters;
    onFilterChange: (header: string, value: string) => void;
    onClearFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ options, filters, onFilterChange, onClearFilters }) => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownsRef.current && !dropdownsRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const displayNameMap: Record<string, string> = {
        'Topic Area': 'Topic Area',
        'Type of Resource': 'Resource Type',
        'Policy Stage': 'Policy Stage',
        'Field of Practice': 'Field of Practice'
    };

    const cleanHeader = (header: string) => header;

    const hasActiveFilters = Object.values(filters).some(v => (v as string[]).length > 0);

    return (
        <div className="bg-white rounded-lg shadow p-5 sticky top-8" ref={dropdownsRef}>
            <h2 className="text-xl font-bold font-display text-[#051632] mb-4 pb-4 border-b border-slate-200">Filter Resources</h2>
            <div className="space-y-4">
                {Object.entries(options).map(([header, values]) => {
                    if ((values as string[]).length === 0) return null;
                    const selectedCount = (filters[header] || []).length;
                    const isOpen = openDropdown === header;

                    return (
                        <div key={header} className="relative">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setOpenDropdown(isOpen ? null : header)}
                                    aria-haspopup="listbox"
                                    aria-expanded={isOpen}
                                    className="form-toggle"
                                >
                                    <div>
                                        <span className="font-semibold text-slate-800">{displayNameMap[header] || cleanHeader(header)}</span>
                                        {selectedCount > 0 && (
                                            <span className="ml-2 bg-[#0053b4] text-white text-xs font-bold px-2 py-1 rounded-full">{selectedCount}</span>
                                        )}
                                    </div>
                                    <ChevronDownIcon className={`transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
                                </button>

                                {/* Add info tooltips for specific filter headers */}
                                {(header === 'Field of Practice' || header === 'Policy Stage') && (
                                    <div>
                                        {/* Tooltip portal wrapper */}
                                        {header === 'Field of Practice' ? (
                                            <Tooltip content={'The area of government practice—based on Results for America’s Standards—that this resource supports for using data and evidence.'}>
                                                <button
                                                    type="button"
                                                    className="info-button text-slate-400 hover:text-slate-600 focus:outline-none"
                                                    aria-label={`More information about ${displayNameMap[header] || cleanHeader(header)}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4" aria-hidden="true" focusable="false">
                                                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                                        <path d="M12 8v.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M11 12h1v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    <span className="sr-only">More information</span>
                                                </button>
                                            </Tooltip>
                                        ) : (
                                            <Tooltip content={'Where this resource is most useful in the policy process (e.g., exploring options, designing, implementing, or evaluating).'}>
                                                <button
                                                    type="button"
                                                    className="info-button text-slate-400 hover:text-slate-600 focus:outline-none"
                                                    aria-label={`More information about ${displayNameMap[header] || cleanHeader(header)}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4" aria-hidden="true" focusable="false">
                                                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                                        <path d="M12 8v.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M11 12h1v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    <span className="sr-only">More information</span>
                                                </button>
                                            </Tooltip>
                                        )}
                                    </div>
                                )}
                            </div>
                            {isOpen && (
                                <div role="listbox" className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg border border-slate-200 max-h-60 overflow-y-auto">
                                    <div className="p-2 space-y-1">
                                        {(values as string[]).map(value => (
                                            <label key={value} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-[#aae4fa]/30">
                                                <input
                                                        type="checkbox"
                                                        checked={(filters[header] || []).includes(value)}
                                                        onChange={() => onFilterChange(header, value)}
                                                        className="form-checkbox"
                                                    />
                                                <span className="text-slate-700">{value}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {hasActiveFilters && (
                <div className="mt-6 pt-4 border-t border-slate-200">
                    <Button as="button" variant="secondary" className="w-full flex items-center justify-center gap-2 text-sm font-semibold" onClick={onClearFilters}>
                        <ResetIcon className="h-4 w-4" />
                        Clear All Filters
                    </Button>
                </div>
            )}
        </div>
    );
};