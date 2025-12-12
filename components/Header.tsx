import React from 'react';

export const Header: React.FC = () => {
    const formUrl = "https://form.asana.com/?k=B9Pw3VavSScvtiT4T8lvkQ&d=35759376315418";

    return (
        <header className="bg-[#0054B6]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium font-display text-white">
                    Resources
                </h1>
                <p className="mt-4 text-lg text-blue-100 max-w-3xl">
                    Find frameworks, case studies, and tools to support effective policy-making, all in one place.
                </p>
                <div className="mt-8">
                    <a
                        href={formUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-white text-[#003B71] font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#003B71] focus:ring-white"
                    >
                        Share a resource
                    </a>
                </div>
            </div>
        </header>
    );
};
