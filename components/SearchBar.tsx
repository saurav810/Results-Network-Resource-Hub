import React, { useRef } from 'react';
import { SearchIcon } from './icons/SearchIcon';

interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange, placeholder = 'Search for resources' }) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleClear = () => {
        onSearchChange('');
        // keep focus in the input after clearing
        inputRef.current?.focus();
    };

    const showClear = searchQuery.trim().length > 0;

    return (
        <div>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="text-gray-400" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={placeholder}
                    className={`form-control pl-10 ${showClear ? 'pr-12' : 'pr-4'}`}
                />

                {showClear && (
                    <button
                        type="button"
                        aria-label="Clear search"
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-700 focus:outline-none"
                    >
                        <span aria-hidden className="text-lg leading-none">✕</span>
                    </button>
                )}
            </div>
            <p className="mt-2 text-sm text-slate-500">Search by topic, keyword, or jurisdiction (e.g., "Los Angeles").</p>
        </div>
    );
};
