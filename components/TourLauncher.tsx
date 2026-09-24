import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';

const STORAGE_KEY = 'resource-hub:tour:v1';
// This resets on a full page load, but prevents a dismissed tour reopening on remount.
let dismissedThisPage = false;

function shouldStartTour() {
    return !dismissedThisPage && new URLSearchParams(window.location.search).get('tour') === 'true';
}

export default function TourLauncher({ isLoading }: { isLoading: boolean }) {
    // The URL is an explicit request; saved completion never suppresses it.
    const [requested, setRequested] = useState(shouldStartTour);
    const [Tour, setTour] = useState<ComponentType<{ onEnd: () => void }> | null>(null);
    const [error, setError] = useState(false);
    const launcherRef = useRef<HTMLDivElement>(null);
    const restoreFocus = useRef(false);

    const finish = useCallback(() => {
        dismissedThisPage = true;
        try {
            window.localStorage.setItem(STORAGE_KEY, 'dismissed-or-completed');
        } catch {
            // Storage may be unavailable in private browsing or a sandboxed iframe.
        }
        setRequested(false);
        setTour(null);
        restoreFocus.current = true;
    }, []);

    useEffect(() => {
        if (requested || !restoreFocus.current) return;
        // Restore after the tour unmounts and the launcher is enabled again.
        const frame = requestAnimationFrame(() => {
            launcherRef.current?.querySelector<HTMLButtonElement>('[data-tour="start"]')?.focus();
            restoreFocus.current = false;
        });
        return () => cancelAnimationFrame(frame);
    }, [requested, Tour]);

    useEffect(() => {
        if (!requested || isLoading) return;
        let cancelled = false;
        import('./ResourceTour').then(module => {
            if (!cancelled) setTour(() => module.default);
        }).catch(() => {
            if (!cancelled) {
                setRequested(false);
                setError(true);
            }
        });
        return () => { cancelled = true; };
    }, [requested, isLoading]);

    useEffect(() => {
        if (!requested || Tour) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') finish();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [requested, Tour, finish]);

    const start = () => {
        setError(false);
        setRequested(true);
    };

    return (
        <div ref={launcherRef} className="tour-launcher">
            <button type="button" className="tour-text-link" data-tour="start" onClick={start} disabled={requested}>
                Quick tour of the Resource Hub
            </button>
            {requested && !Tour && (
                <div className="tour-offer">
                    <p role="status">{isLoading ? 'Waiting for resources. You can skip the tour at any time.' : 'Loading the tour…'}</p>
                    <button type="button" className="tour-button" onClick={finish}>Skip tour</button>
                </div>
            )}
            {error && <p role="status">The tour could not load. Please select the tour link again.</p>}
            {requested && Tour && <Tour onEnd={finish} />}
        </div>
    );
}
