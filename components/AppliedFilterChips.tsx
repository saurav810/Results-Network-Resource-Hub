import React from 'react';

interface AppliedFilterChipsProps {
  filters: Record<string, string[]>;
  onRemove: (header: string, value: string) => void;
  onClearAll?: () => void;
}

const CATEGORY_ORDER = [
  'Topic Area',
  'Type of Resource',
  'Policy Stage',
  'Practice Area'
];

export const AppliedFilterChips: React.FC<AppliedFilterChipsProps> = ({ filters, onRemove, onClearAll }) => {
  const headers = Object.keys(filters);
  if (headers.length === 0) return null;

  const preferredShort: Record<string, string> = {
    'Topic Area': 'Topic',
    'Type of Resource': 'Type',
    'Policy Stage': 'Policy Stage',
    'Practice Area': 'Practice Area'
  };

  const labelCounts: Record<string, number> = {};
  const effectiveLabel: Record<string, string> = {};

  headers.forEach(h => {
    const short = preferredShort[h] || h;
    labelCounts[short] = (labelCounts[short] || 0) + 1;
    effectiveLabel[h] = short;
  });

  Object.entries(effectiveLabel).forEach(([h, lbl]) => {
    if (labelCounts[lbl] > 1) {
      effectiveLabel[h] = h;
    }
  });

  const orderedHeaders: string[] = [];
  CATEGORY_ORDER.forEach(h => { if (headers.includes(h)) orderedHeaders.push(h); });
  const extra = headers.filter(h => !CATEGORY_ORDER.includes(h)).sort();
  orderedHeaders.push(...extra);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex flex-wrap gap-2 items-center">
        {orderedHeaders.map(header => (
          (filters[header] || []).map(value => (
            <div key={`${header}:${value}`} className="inline-flex items-center bg-white border border-slate-200 text-slate-700 rounded-full px-3 py-1 text-sm">
              <span className="mr-2 font-medium">{effectiveLabel[header]}: <span className="font-normal">{value}</span></span>
              <button
                type="button"
                aria-label={`Remove filter: ${effectiveLabel[header]} ${value}`}
                onClick={() => onRemove(header, value)}
                className="inline-flex items-center justify-center w-6 h-6 rounded-full text-slate-500 hover:bg-slate-100 focus:outline-none focus-visible:ring-[var(--focus-ring-color)]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        ))}
      </div>

      <div>
        {onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-sm text-slate-600 underline hover:no-underline hover:text-slate-800 focus:outline-none focus-visible:ring-[var(--focus-ring-color)]"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
};

export default AppliedFilterChips;
