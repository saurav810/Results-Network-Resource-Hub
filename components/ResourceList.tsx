import React, { useState } from 'react';
import type { Resource } from '../types';
import { DocumentIcon } from './icons/DocumentIcon';

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
    const author = resource['Author or Creator'];
    const agencies = resource['Relevant Agencies'];

    const showImage = imageUrl && !imageError;

    return (
        <button
            onClick={onClick}
            className="group w-full text-left bg-white rounded-lg shadow hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0053b4] transition-all duration-300 flex flex-col h-full overflow-hidden"
            type="button"
        >
            <div className="relative w-full aspect-video bg-slate-100">
                {showImage ? (
                    <img 
                        src={imageUrl} 
                        alt={`Thumbnail for ${title}`} 
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full bg-[#aae4fa]/50 flex items-center justify-center">
                        <DocumentIcon />
                    </div>
                )}
            </div>
            
            <div className="p-5 flex flex-col flex-grow w-full">
                <h3 className="text-md font-bold font-display text-[#051632] group-hover:text-[#0053b4] transition-colors break-words mb-2">
                    {title}
                </h3>
                
                {summary && (
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                        {summary}
                    </p>
                )}
            
                {(author || agencies) && (
                    <div className="mt-auto pt-4 border-t border-slate-100 space-y-2 text-sm w-full">
                        {author && (
                             <div>
                                <span className="font-bold text-slate-600">Author: </span>
                                <span className="text-slate-700">{author}</span>
                            </div>
                        )}
                        {agencies && (
                            <div>
                                <span className="font-bold text-slate-600">Agencies: </span>
                                <span className="text-slate-700">{agencies}</span>
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