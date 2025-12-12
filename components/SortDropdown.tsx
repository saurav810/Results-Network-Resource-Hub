import React from 'react';
import type { SortOrder } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface SortDropdownProps {
    sortOrder: SortOrder;
    onSortChange: (order: SortOrder) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ sortOrder, onSortChange }) => {
    return (
        <div className="relative">
            <label htmlFor="sort-order" className="sr-only">Sort resources</label>
            <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => onSortChange(e.target.value as SortOrder)}
                className="appearance-none w-full sm:w-auto pl-4 pr-10 py-3 bg-white border border-slate-300 rounded-lg shadow-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0053b4] focus:border-transparent transition-colors"
            >
                <option value="default">Default Order</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="author-asc">Author (A-Z)</option>
                <option value="author-desc">Author (Z-A)</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDownIcon />
            </div>
        </div>
    );
};

export default SortDropdown;