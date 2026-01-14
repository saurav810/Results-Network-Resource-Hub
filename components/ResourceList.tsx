import React, { useState } from 'react';
import type { Resource } from '../types';
import { DocumentIcon } from './icons/DocumentIcon';
import { getJurisdictionsFeaturedLabels } from '../utils/labelMappings';

interface ResourceCardProps {
    resource: Resource;
    onClick: () => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onClick }) => {
    const [imageError, setImageError] = useState(false);
    
    // New data mapping
    const imageUrl = resource['Thumbnail URL'];
    const title = resource['Title'] || 'Untitled Resource';
    const summary = resource['Summary'];
    const agencies = resource['Relevant Agencies'];
    const jurisdictions = resource['Jurisdictions Featured'];
    // Practice Area (prefer new column name, fall back to previous 'Field of Practice')
    const practiceArea = resource['Practice Area'] || resource['Field of Practice'];
    
    // Check if resource is member-submitted
    const source = resource['Source'] || '';
    const isMemberSubmitted = source.trim().toLowerCase() === 'member submitted';

    const showImage = imageUrl && !imageError;

    return (
        <button
            onClick={onClick}
            className="group w-full text-left bg-white rounded-lg shadow-md hover:shadow-lg focus:shadow-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0053b4] transition-all duration-300 flex flex-col h-full overflow-hidden relative"
            type="button"
        >
            {isMemberSubmitted && (
                <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1 rounded-full text-xs font-semibold border border-slate-200 shadow-sm">
                    Member submitted
                </div>
            )}
            <div className="relative w-full h-40 bg-slate-100 overflow-hidden rounded-t-lg">
                {showImage ? (
                    <img 
                        src={imageUrl} 
                        alt={`Thumbnail for ${title}`} 
                        className="block w-full h-full object-cover"
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full bg-[#aae4fa]/50 flex items-center justify-center">
                        <DocumentIcon />
                    </div>
                )}
            </div>
            
            <div className="p-4 flex flex-col flex-grow w-full">
                <h3 className="text-base font-bold font-display text-[#051632] group-hover:text-[#0053b4] transition-colors break-words mb-2 leading-snug">
                    {title}
                </h3>
                
                {summary && (
                    <p className="card-summary line-clamp-3">
                        {summary}
                    </p>
                )}
            
                {(agencies || jurisdictions || practiceArea) && (
                    <div className="mt-auto pt-3 border-t border-slate-200 space-y-1.5 text-sm w-full">
                        {agencies && (
                            <div>
                                <span className="font-bold text-slate-600">Relevant agencies: </span>
                                <span className="text-slate-700">{agencies}</span>
                            </div>
                        )}
                        {practiceArea && (
                            <div>
                                <span className="font-bold text-slate-600">Practice Area: </span>
                                <span className="text-slate-700">{practiceArea}</span>
                            </div>
                        )}
                        {jurisdictions && (
                            <div>
                                <span className="font-bold text-slate-600">Jurisdictions featured: </span>
                                <span className="text-slate-700">{getJurisdictionsFeaturedLabels(jurisdictions)}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </button>
    );
};

interface ResourceListProps {
    resources: Resource[];
    onResourceClick: (resource: Resource) => void;
}

export const ResourceList: React.FC<ResourceListProps> = ({ resources, onResourceClick }) => {
    if (resources.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center bg-white rounded-lg shadow-inner p-12">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-semibold font-display text-slate-700">No Results Found</h3>
                <p className="text-slate-500 mt-1">Try adjusting your filters to find resources.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
                <ResourceCard 
                    key={`${resource['Title']}-${index}`} 
                    resource={resource} 
                    onClick={() => onResourceClick(resource)}
                />
            ))}
        </div>
    );
};