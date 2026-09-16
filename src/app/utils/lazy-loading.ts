import {
  lazy,
  type ComponentType,
  type LazyExoticComponent,
} from 'react';

export interface PreloadableComponent<Props = Record<string, never>>
  extends LazyExoticComponent<ComponentType<Props>> {
  preload: () => Promise<unknown> | void;
}

export function throttle<Args extends unknown[], Result>(
  func: (...args: Args) => Result,
  limit: number
): (...args: Args) => void {
  let lastCall = 0;
  return (...args: Args) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func(...args);
    }
  };
}

export function lazyWithPreload<Props>(
  factory: () => Promise<{ default: ComponentType<Props> }>,
  delay = 0,
  priority = 'low'
): PreloadableComponent<Props> {
  const Component = lazy(() => new Promise((resolve) => {
    const timer = setTimeout(() => {
      if (priority === 'low' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(() => resolve(factory()));
      } else {
        resolve(factory());
      }
      clearTimeout(timer);
    }, delay);
  })) as PreloadableComponent<Props>;

  Component.preload = () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => factory());
    } else {
      setTimeout(factory, 1000);
    }
  };

  return Component;
}
