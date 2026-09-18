import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';

type FloorComponent = (props: { theme: 'light' | 'dark' }) => ReactNode;
const mountedFloors = new Map<string, () => Promise<void>>();

// Materialize preceding floors before measuring a direct navigation destination.
export async function prepareFloorsThrough(id: string) {
  const floors = [...document.querySelectorAll<HTMLElement>('main > section')];
  const target = document.getElementById(id === 'news' ? 'talks' : id)?.closest('main > section');
  const index = floors.indexOf(target as HTMLElement);
  if (index < 0) return;
  await Promise.all(floors.slice(0, index + 1).map(floor => mountedFloors.get(floor.id)?.()));
  await document.fonts.ready;
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
}

export default function DeferredFloor({ id, load, theme, children }: {
  id: string;
  load: () => Promise<{ default: FloorComponent }>;
  theme: 'light' | 'dark';
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const [Component, setComponent] = useState<FloorComponent | null>(null);
  const [failed, setFailed] = useState(false);
  const pending = useRef<Promise<void> | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const activate = useCallback(() => {
    if (!pending.current) {
      pending.current = load().then(module => {
        flushSync(() => { setComponent(() => module.default); setFailed(false); });
      }).catch(error => {
        pending.current = null;
        setFailed(true);
        throw error;
      });
    }
    return pending.current;
  }, [load]);

  useEffect(() => {
    mountedFloors.set(id, activate);
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        void activate().then(() => observer.disconnect()).catch(() => {});
      }
    }, { rootMargin: '600px' });
    if (host.current) observer.observe(host.current);
    return () => { observer.disconnect(); mountedFloors.delete(id); };
  }, [id, activate]);

  return <div ref={host} data-deferred-floor={id} data-ready={!!Component}
    style={Component ? undefined : { minHeight: '100vh' }}>
    {Component ? <><Component theme={theme} />{children}</> : failed ?
      <button type="button" onClick={() => void activate().catch(() => {})}>
        {t('common.retry', 'Reintentar / Retry')}
      </button> : <div role="status" className="p-8 text-center">
        {t('common.loading', 'Cargando… / Loading…')}
      </div>}
  </div>;
}
