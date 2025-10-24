import React, { useState, useEffect, useRef } from 'react';
import type { Filters } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface FilterPanelProps {
    options: Record<string, string[]>;
    filters: Filters;
    onFilterChange: (header: string, value: string) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ options, filters, onFilterChange }) => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // FIX: Corrected a typo from `dropdowns-ref.current` to `dropdownsRef.current`.
            if (dropdownsRef.current && !dropdownsRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const cleanHeader = (header: string) => header.replace(/\s*\((new)\)/i, '').trim();

    return (
        <div className="bg-white rounded-lg shadow p-5 sticky top-8" ref={dropdownsRef}>
            <h2 className="text-xl font-bold text-[#051632] mb-4 pb-4 border-b border-slate-200">Filter Resources</h2>
            <div className="space-y-4">
                {Object.entries(options).map(([header, values]) => {
                    if (values.length === 0) return null;
                    const selectedCount = filters[header]?.length || 0;
                    const isOpen = openDropdown === header;

                    return (
                        <div key={header} className="relative">
                            <button
                                onClick={() => setOpenDropdown(isOpen ? null : header)}
                                aria-haspopup="listbox"
                                aria-expanded={isOpen}
                                className="w-full flex justify-between items-center text-left p-3 bg-slate-50 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0053b4] transition-colors"
                            >
                                <div>
                                    <span className="font-semibold text-slate-800">{cleanHeader(header)}</span>
                                    {selectedCount > 0 && (
                                        <span className="ml-2 bg-[#0053b4] text-white text-xs font-bold px-2 py-1 rounded-full">{selectedCount}</span>
                                    )}
                                </div>
                                <ChevronDownIcon className={`transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
                            </button>
                            {isOpen && (
                                <div role="listbox" className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg border border-slate-200 max-h-60 overflow-y-auto">
                                    <div className="p-2 space-y-1">
                                        {(values as string[]).map(value => (
                                            <label key={value} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-[#aae4fa]/30">
                                                <input
                                                    type="checkbox"
                                                    checked={(filters[header] || []).includes(value)}
                                                    onChange={() => onFilterChange(header, value)}
                                                    className="h-4 w-4 rounded border-gray-300 text-[#0053b4] focus:ring-[#0053b4]/50"
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
        </div>
    );
};
