import { Component as ReactComponent, Suspense, memo, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { loadFloor, retryFloor, type Floor } from './floors';

// The Suspense boundary around one floor; see floors.ts for how prerender and hydration meet.
function FloorContent({ floor, theme, children, onReady }: {
  floor: Floor;
  theme: 'light' | 'dark';
  children?: ReactNode;
  onReady: () => void;
}) {
  useEffect(onReady, [onReady]);
  if (floor.error) throw floor.error;
  const Loaded = floor.Component;
  if (!Loaded) throw floor.ready;
  return <><Loaded theme={theme} />{children}</>;
}

class FloorErrorBoundary extends ReactComponent<{ fallback: (reset: () => void) => ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  reset = () => this.setState({ failed: false });
  render() { return this.state.failed ? this.props.fallback(this.reset) : this.props.children; }
}

// Everything inside a floor's Suspense boundary. Memoized so that re-renders of the page (on
// mount, on scroll, on a theme change) never reach a boundary that is still dehydrated: React
// cannot apply an update to one, and would discard its server HTML to render it on the client.
const FloorBoundary = memo(function FloorBoundary({ floor, theme, children, onReady }: {
  floor: Floor;
  theme: 'light' | 'dark';
  children?: ReactNode;
  onReady: () => void;
}) {
  const { t } = useTranslation();
  const retry = (reset: () => void) => {
    void retryFloor(floor).catch(() => {});
    reset();
  };
  return <FloorErrorBoundary fallback={reset =>
    <button type="button" onClick={() => retry(reset)}>{t('common.retry', 'Reintentar / Retry')}</button>}>
    <Suspense fallback={<div role="status" className="p-8 text-center" style={{ minHeight: '100vh' }}>
      {t('common.loading', 'Cargando… / Loading…')}
    </div>}>
      <FloorContent floor={floor} theme={theme} onReady={onReady}>{children}</FloorContent>
    </Suspense>
  </FloorErrorBoundary>;
});

export default function DeferredFloor({ floor, theme, children }: {
  floor: Floor;
  theme: 'light' | 'dark';
  children?: ReactNode;
}) {
  const host = useRef<HTMLDivElement>(null);
  // Until the floor has hydrated, its boundary keeps the props it was prerendered with; after
  // that it follows the page again (for instance the dark theme applied on mount).
  const prerendered = useRef({ theme, children });
  const [hydrated, setHydrated] = useState(false);
  const current = hydrated ? { theme, children } : prerendered.current;
  const missed = useRef<Event | null>(null);
  // data-ready means "this floor's code has loaded and hydrated", which the browser checks
  // rely on. It is set from an effect, so the prerendered HTML never claims it.
  const onReady = useCallback(() => {
    host.current?.setAttribute('data-ready', 'true');
    setHydrated(true);
    // Replay an activation React had to drop (see the listener below) now that it can run.
    const event = missed.current;
    missed.current = null;
    const target = event?.target;
    if (!(target instanceof HTMLElement) || !target.isConnected) return;
    requestAnimationFrame(() => {
      if (event instanceof KeyboardEvent) target.dispatchEvent(new KeyboardEvent('keydown', { key: event.key, code: event.code, bubbles: true, cancelable: true }));
      else target.click();
    });
  }, []);

  // The prerendered floor can be clicked or focused before its code arrives, and React 18
  // drops a click or key press that reaches a boundary it cannot hydrate yet - it even stops
  // the event's propagation from #root. So this listens on the document, ahead of React: any
  // intent loads the floor at once, and an activation of something that needs React (not a
  // link or a native control, which work without it) is replayed once the floor hydrates.
  useEffect(() => {
    const intent = (event: Event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (floor.Component || !target || !host.current?.contains(target)) return;
      void loadFloor(floor).catch(() => {});
      const activation = event.type === 'click' || (event instanceof KeyboardEvent && (event.key === 'Enter' || event.key === ' '));
      if (activation && !target.closest('a[href], input, select, textarea, label, summary, button[type="submit"]')) missed.current = event;
    };
    const types = ['pointerdown', 'focusin', 'keydown', 'click'];
    types.forEach(type => document.addEventListener(type, intent, true));
    return () => types.forEach(type => document.removeEventListener(type, intent, true));
  }, [floor]);

  useEffect(() => {
    if (floor.Component) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        void loadFloor(floor).catch(() => {});
      }
    }, { rootMargin: '600px' });
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, [floor]);

  return <div ref={host} data-deferred-floor={floor.id}>
    <FloorBoundary floor={floor} theme={current.theme} onReady={onReady}>{current.children}</FloorBoundary>
  </div>;
}
