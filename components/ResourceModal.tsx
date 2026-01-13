import React, { useEffect, useRef } from 'react';
import Button from './Button';
import Tooltip from './Tooltip';
import type { Resource } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { getJurisdictionsFeaturedLabels } from '../utils/labelMappings';

interface ResourceModalProps {
    resource: Resource;
    onClose: () => void;
}

export const ResourceModal: React.FC<ResourceModalProps> = ({ resource, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    // New data mapping
    const title = resource['Title'] || 'Untitled Resource';
    const summary = resource['Summary'];
    const fullDescription = resource['Full Description'];
    const author = resource['Author or Creator'];
    const agencies = resource['Relevant Agencies'];
    const jurisdictions = resource['Jurisdictions Featured'];
    const url = resource['APP URL'];
    const imageUrl = resource['Thumbnail URL'];

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                ref={modalRef}
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col relative animate-in zoom-in-95 duration-200"
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-[#0053b4]"
                    aria-label="Close modal"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>

                {imageUrl && (
                    <div className="w-full h-48 sm:h-64 bg-slate-100 shrink-0 relative">
                        <img 
                            src={imageUrl} 
                            alt="" 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                    </div>
                )}

                <div className="p-6 sm:p-8 space-y-6">
                    <div>
                        <h2 id="modal-title" className="text-2xl sm:text-3xl font-bold font-display text-[#051632] leading-tight">
                            {title}
                        </h2>
                        
                        {(author || agencies || jurisdictions) && (
                            <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-2 text-sm text-slate-700">
                                {author && (
                                    <div className="flex flex-col sm:flex-row sm:gap-2">
                                        <span className="font-bold text-slate-900 min-w-[140px]">Author or creator:</span>
                                        <span>{author}</span>
                                    </div>
                                )}
                                {agencies && (
                                    <div className="flex flex-col sm:flex-row sm:gap-2">
                                        <span className="font-bold text-slate-900 min-w-[140px]">Relevant agencies:</span>
                                        <span>{agencies}</span>
                                    </div>
                                )}
                                {jurisdictions && (
                                    <div className="flex flex-col sm:flex-row sm:gap-2">
                                        <div className="min-w-[140px]">
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold text-slate-900 flex items-center gap-2">
                                                    <span>Jurisdictions featured</span>
                                                    <Tooltip content={"Examples in this resource reference specific cities, counties, or local jurisdictions; insights may be applicable in other contexts."}>
                                                        <button
                                                            type="button"
                                                            className="info-button text-slate-400 hover:text-slate-600 focus:outline-none"
                                                            aria-label="More information about jurisdictions"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4" aria-hidden="true" focusable="false">
                                                                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                                                <path d="M12 8v.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                <path d="M11 12h1v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            <span className="sr-only">More information about jurisdictions</span>
                                                        </button>
                                                    </Tooltip>
                                                    <span>:</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-slate-700 flex items-center gap-2">
                                            <span>{getJurisdictionsFeaturedLabels(jurisdictions)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="prose prose-slate max-w-none">
                        {summary && (
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-[#051632] mb-2">Summary</h3>
                                <p className="modal-summary">
                                    {summary}
                                </p>
                            </div>
                        )}
                        
                        {fullDescription && (
                            <div>
                                <h3 className="text-lg font-semibold text-[#051632] mb-2">Full Description</h3>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {fullDescription}
                                </p>
                            </div>
                        )}
                        
                        {!summary && !fullDescription && (
                            <p className="text-slate-500 italic">No description available.</p>
                        )}
                    </div>

                    {url && (
                        <div className="pt-6 mt-2 border-t border-slate-100 flex justify-end">
                            <Button as="a" href={url} variant="primary" target="_blank" rel="noopener noreferrer">
                                Open Resource
                                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 -mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};