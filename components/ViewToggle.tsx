import React from 'react';

interface ViewToggleProps {
    viewMode: 'featured' | 'all';
    onViewChange: (mode: 'featured' | 'all') => void;
    hasFeatured: boolean;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewChange, hasFeatured }) => {
    // If there are no featured resources, don't show the toggle
    if (!hasFeatured) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 font-medium">View:</span>
            <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                    type="button"
                    onClick={() => onViewChange('featured')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-md border transition-colors ${
                        viewMode === 'featured'
                            ? 'bg-[#0053b4] text-white border-[#0053b4]'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                >
                    Featured
                </button>
                <button
                    type="button"
                    onClick={() => onViewChange('all')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-md border border-l-0 transition-colors ${
                        viewMode === 'all'
                            ? 'bg-[#0053b4] text-white border-[#0053b4]'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                >
                    All resources
                </button>
            </div>
        </div>
    );
};

export default ViewToggle;
