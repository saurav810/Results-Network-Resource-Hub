import React from 'react';
import type { Resource } from '../types';
import { DocumentIcon } from './icons/DocumentIcon';

interface ResourceCardProps {
    resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
    const url = resource['URL'] || '#';
    const title = resource['Resource Title'] || 'Untitled Resource';
    const author = resource['Author/Creator(new)'] || '';
    const affiliation = resource['Affiliation(new)'] || '';

    return (
        <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group bg-white rounded-lg shadow hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0053b4] transition-all duration-300 p-5 flex flex-col h-full"
        >
            <div className='flex items-start space-x-4'>
                <div className="flex-shrink-0 w-10 h-10 bg-[#aae4fa]/50 rounded-lg flex items-center justify-center">
                    <DocumentIcon />
                </div>
                <h3 className="flex-1 text-md font-bold text-[#051632] group-hover:text-[#0053b4] transition-colors break-words">
                    {title}
                </h3>
            </div>
            
            {(author || affiliation) && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-sm">
                    {author && (
                         <div>
                            <span className="font-bold text-slate-600">Author: </span>
                            <span className="text-slate-700">{author}</span>
                        </div>
                    )}
                    {affiliation && (
                        <div>
                            <span className="font-bold text-slate-600">Affiliation: </span>
                            <span className="text-slate-700">{affiliation}</span>
                        </div>
                    )}
                </div>
            )}
        </a>
    );
};

interface ResourceListProps {
    resources: Resource[];
}

export const ResourceList: React.FC<ResourceListProps> = ({ resources }) => {
    if (resources.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center bg-white rounded-lg shadow-inner p-12">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-slate-700">No Results Found</h3>
                <p className="text-slate-500 mt-1">Try adjusting your filters to find resources.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
                <ResourceCard key={`${resource['Resource Title']}-${index}`} resource={resource} />
            ))}
        </div>
    );
};
