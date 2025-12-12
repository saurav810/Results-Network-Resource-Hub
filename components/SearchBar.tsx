import React from 'react';
import { SearchIcon } from './icons/SearchIcon';

interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange, placeholder = 'Search resources...' }) => {
    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="text-gray-400" />
            </div>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0053b4] focus:border-transparent transition-colors"
            />
        </div>
    );
};
