import React from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5; // Max number of page buttons to show

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Logic to show pages around current page with ellipses
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    return (
        <nav className="flex items-center justify-center space-x-2" aria-label="Pagination">
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-md border ${
                    currentPage === 1
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50 hover:text-[#0053b4]'
                } transition-colors focus:outline-none focus:ring-2 focus:ring-[#0053b4]`}
                aria-label="Previous page"
            >
                <ChevronLeftIcon className="h-5 w-5" />
            </button>

            <div className="hidden sm:flex space-x-2">
                {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                        {typeof page === 'number' ? (
                            <button
                                onClick={() => onPageChange(page)}
                                className={`px-4 py-2 text-sm font-medium rounded-md border ${
                                    currentPage === page
                                        ? 'bg-[#0053b4] text-white border-[#0053b4]'
                                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50 hover:text-[#0053b4]'
                                } transition-colors focus:outline-none focus:ring-2 focus:ring-[#0053b4]`}
                                aria-current={currentPage === page ? 'page' : undefined}
                            >
                                {page}
                            </button>
                        ) : (
                            <span className="px-2 py-2 text-slate-400">...</span>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Mobile simplified view */}
            <div className="flex sm:hidden items-center px-2 text-sm text-slate-600">
                Page {currentPage} of {totalPages}
            </div>

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md border ${
                    currentPage === totalPages
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50 hover:text-[#0053b4]'
                } transition-colors focus:outline-none focus:ring-2 focus:ring-[#0053b4]`}
                aria-label="Next page"
            >
                <ChevronRightIcon className="h-5 w-5" />
            </button>
        </nav>
    );
};