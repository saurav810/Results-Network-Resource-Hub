import React from 'react';

interface IconProps {
    className?: string;
}

// FIX: Create the ChevronUpIcon component. The file was previously not a valid module.
export const ChevronUpIcon: React.FC<IconProps> = ({ className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-500 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
);
