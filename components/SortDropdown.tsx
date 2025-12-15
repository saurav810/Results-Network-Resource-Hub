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
                className="appearance-none w-full sm:w-auto form-control form-select-icon pl-4 pr-10 text-slate-800"
            >
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDownIcon />
            </div>
        </div>
    );
};

export default SortDropdown;