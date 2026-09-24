import { useEffect, useState } from 'react';
import { EVENTS, Joyride, type Step, type TooltipRenderProps } from 'react-joyride';

const target = (name: string, fallback: string) => () =>
    document.querySelector<HTMLElement>(`[data-tour="${name}"]`) ??
    document.querySelector<HTMLElement>(`[data-tour="${fallback}"]`);

const steps: Step[] = [
    {
        target: target('search', 'start'),
        title: 'Find something useful',
        content: 'Welcome! Find frameworks, case studies, and tools to support your work. Search by keyword, topic, or jurisdiction.',
    },
    {
        target: target('topics', 'filters'),
        title: 'Explore your issue area',
        content: 'Use the Topic Area filter to find resources about the issues you are working on.',
    },
    {
        target: target('resource-type', 'filters'),
        title: 'Narrow your choices',
        content: 'Choose a Resource Type, such as a tool or a case study, to narrow your choices. If you’d like, you can also use the Policy Stage and Practice Area filters.',
    },
    {
        target: target('resource-card', 'search'),
        title: 'Explore a resource',
        content: 'Each resource card gives you a brief overview. For a longer description and access to the resource, select the card, then select the “Open Resource” button in the pop-up window.',
    },
    {
        target: target('member-submitted', 'search'),
        title: 'Discover member contributions',
        content: 'Our members help build this collection by sharing resources. Choose “Member submitted” to explore their contributions alongside other featured resources.',
    },
    {
        target: target('submit', 'start'),
        title: 'Share what works',
        content: 'Do you have a resource to share with the community? “Share a resource” opens a submission form in a new tab where you can submit your resource to be featured in the Hub.',
    },
];

function TourTooltip({ backProps, index, isLastStep, primaryProps, size, skipProps, step, tooltipProps }: TooltipRenderProps) {
    return (
        <section {...tooltipProps} className="resource-tour" aria-labelledby="tour-title" aria-describedby="tour-description">
            <p className="tour-progress" aria-live="polite" aria-atomic="true">Step {index + 1} of {size}</p>
            <h2 id="tour-title">{step.title}</h2>
            <p id="tour-description">{step.content}</p>
            <div className="tour-actions">
                <button type="button" className="tour-button" {...skipProps}>Skip tour</button>
                {index > 0 && <button type="button" className="tour-button" {...backProps}>Back</button>}
                <button type="button" className="tour-button tour-primary" {...primaryProps}>{isLastStep ? 'Finish' : 'Next'}</button>
            </div>
        </section>
    );
}

export default function ResourceTour({ onEnd }: { onEnd: () => void }) {
    const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReducedMotion(media.matches);
        media.addEventListener('change', update);
        // Capture Escape before Joyride can advance to another step.
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopImmediatePropagation();
                onEnd();
            }
        };
        document.addEventListener('keydown', onKeyDown, true);
        return () => {
            media.removeEventListener('change', update);
            document.removeEventListener('keydown', onKeyDown, true);
        };
    }, [onEnd]);

    return (
        <Joyride
            run
            continuous
            steps={steps}
            tooltipComponent={TourTooltip}
            floatingOptions={{ shiftOptions: { padding: 16, crossAxis: true } }}
            styles={{ floater: { transition: reducedMotion ? 'none' : 'opacity 0.3s' } }}
            locale={{ back: 'Back', next: 'Next', last: 'Finish', skip: 'Skip tour' }}
            options={{
                skipBeacon: true,
                blockTargetInteraction: true,
                dismissKeyAction: false,
                overlayClickAction: false,
                closeButtonAction: 'skip',
                scrollDuration: reducedMotion ? 0 : 250,
                scrollOffset: 24,
                width: 'min(360px, calc(100vw - 32px))',
                primaryColor: '#0054B6',
                textColor: '#051632',
                spotlightRadius: 8,
                zIndex: 100000,
            }}
            onEvent={(event) => {
                if (event.type === EVENTS.TOUR_END || event.type === EVENTS.ERROR) onEnd();
            }}
        />
    );
}
