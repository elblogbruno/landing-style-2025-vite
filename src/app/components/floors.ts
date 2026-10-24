import type { ReactNode } from 'react';

type FloorComponent = (props: { theme: 'light' | 'dark' }) => ReactNode;

// A floor's text is prerendered with the page; only its code is deferred.
//
// The build prerender awaits loadAllFloors() before renderToString, so every floor ships in
// the HTML once, in the page's language. In the browser each floor sits in a Suspense
// boundary (DeferredFloor): while its chunk has not arrived it suspends, and during hydration
// React keeps the server HTML of a suspended boundary as it is, hydrating it in place once the
// chunk loads. The chunk is still requested only when the floor nears the viewport or a direct
// navigation needs it, as before; what changed is that the words no longer wait for it.
export type Floor = {
  id: string;
  load: () => Promise<{ default: FloorComponent }>;
  Component?: FloorComponent;
  error?: unknown;
  loading?: Promise<void>;
  ready: Promise<void>;
  settle: () => void;
};

const floors = new Map<string, Floor>();

const arm = (floor: Floor) => {
  floor.ready = new Promise<void>(resolve => { floor.settle = resolve; });
};

export function defineFloor(id: string, load: Floor['load']): Floor {
  const floor = { id, load } as Floor;
  arm(floor);
  floors.set(id, floor);
  return floor;
}

export function loadFloor(floor: Floor) {
  floor.loading ??= floor.load().then(module => {
    floor.Component = module.default;
    floor.settle();
  }, error => {
    floor.loading = undefined;
    floor.error = error;
    floor.settle();
    throw error;
  });
  return floor.loading;
}

export function retryFloor(floor: Floor) {
  floor.error = undefined;
  arm(floor);
  return loadFloor(floor);
}

export const loadAllFloors = () => Promise.all([...floors.values()].map(loadFloor));

// Load the floors up to a direct navigation destination before measuring it. Their HTML is
// already laid out from the prerender, so this only makes them interactive in time.
export async function prepareFloorsThrough(id: string) {
  const sections = [...document.querySelectorAll<HTMLElement>('main > section')];
  const target = document.getElementById(id === 'news' ? 'talks' : id)?.closest('main > section');
  const index = sections.indexOf(target as HTMLElement);
  if (index < 0) return;
  await Promise.all(sections.slice(0, index + 1).map(section => {
    const floor = floors.get(section.id);
    return floor ? loadFloor(floor) : undefined;
  }));
  await document.fonts.ready;
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
}
