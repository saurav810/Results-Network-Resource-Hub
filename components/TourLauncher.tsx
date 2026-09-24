import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';

const STORAGE_KEY = 'resource-hub:tour:v1';
let dismissedThisSession = false;

function shouldOfferTour() {
    if (dismissedThisSession || new URLSearchParams(window.location.search).get('tour') !== 'true') return false;
    try {
        return !window.localStorage.getItem(STORAGE_KEY);
    } catch {
        return true;
    }
}

export default function TourLauncher({ isLoading }: { isLoading: boolean }) {
    const [offer, setOffer] = useState(shouldOfferTour);
    const [requested, setRequested] = useState(false);
    const [Tour, setTour] = useState<ComponentType<{ onEnd: () => void }> | null>(null);
    const [error, setError] = useState(false);
    const launcherRef = useRef<HTMLDivElement>(null);
    const restoreFocus = useRef(false);

    const finish = useCallback(() => {
        dismissedThisSession = true;
        try {
            window.localStorage.setItem(STORAGE_KEY, 'dismissed-or-completed');
        } catch {
            // Storage may be unavailable in private browsing or a sandboxed iframe.
        }
        setOffer(false);
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
    }, [requested, offer, Tour]);

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
        setOffer(false);
        setRequested(true);
    };

    return (
        <div ref={launcherRef} className="tour-launcher">
            <button type="button" className="tour-text-link" data-tour="start" onClick={start} disabled={requested}>
                Quick tour of the Resource Hub
            </button>
            {offer && !requested && (
                <section className="tour-offer" aria-labelledby="tour-offer-title">
                    <h2 id="tour-offer-title" className="text-base font-semibold">New to the Resource Hub?</h2>
                    <p>Take a short tour to find useful resources and share your own.</p>
                    <div className="tour-actions">
                        <button type="button" className="tour-button tour-primary" onClick={start}>Start tour</button>
                        <button type="button" className="tour-button" onClick={finish}>Not now</button>
                    </div>
                </section>
            )}
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
