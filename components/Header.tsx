import React from 'react';
import Button from './Button';
import TourLauncher from './TourLauncher';

export const Header: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
    const formUrl = "https://form.asana.com/?k=B9Pw3VavSScvtiT4T8lvkQ&d=35759376315418";

    return (
        <header className="bg-[#0054B6]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
                <div className="flex flex-col gap-3">
                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                            <h1 className="basis-full sm:basis-auto text-xl sm:text-2xl lg:text-3xl font-medium font-display text-white">
                                Resources
                            </h1>
                            <TourLauncher isLoading={isLoading} />
                        </div>
                        <p className="mt-2 text-base text-blue-100 max-w-3xl">
                            Find frameworks, case studies, and tools to support effective policy-making.
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <Button
                                as="a"
                                href={formUrl}
                                variant="neutral"
                                className="text-[1.075rem] px-3 py-2 shadow-none"
                                target="_blank"
                                rel="noopener noreferrer"
                                data-tour="submit"
                            >
                                Share a resource
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
