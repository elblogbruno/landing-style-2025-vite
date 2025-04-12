import React, { lazy, LazyExoticComponent, ComponentType } from 'react';

// Definición de tipo personalizado para componentes con precarga
export interface PreloadableComponent<T = any> extends LazyExoticComponent<ComponentType<T>> {
  preload: () => Promise<any> | void;
}

// Función para throttle que limita la frecuencia de ejecución
export function throttle<T extends (...args: any[]) => any>(
  func: T, 
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func(...args);
    }
  };
}

// Sistema optimizado de carga diferida para componentes
// Utiliza un sistema de prioridades para cargar primero lo más importante
export function lazyWithPreload<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>, 
  delay = 0, 
  priority = 'low'
): PreloadableComponent<React.ComponentProps<T>> {
  // Componente con carga diferida
  const Component = lazy(() => {
    return new Promise(resolve => {
      const timer = setTimeout(() => {
        // Carga con diferentes prioridades usando requestIdleCallback si está disponible
        if (priority === 'low' && 'requestIdleCallback' in window) {
          // Cargar en tiempo de inactividad para componentes de baja prioridad
          window.requestIdleCallback(() => resolve(factory()));
        } else if (priority === 'medium') {
          // Usar setTimeout para componentes de prioridad media
          resolve(factory());
        } else {
          // Cargar inmediatamente componentes de alta prioridad
          resolve(factory());
        }
        clearTimeout(timer);
      }, delay);
    });
  }) as PreloadableComponent;

  // Método para precargar el componente cuando sea conveniente
  Component.preload = () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => factory());
    } else {
      setTimeout(factory, 1000);
    }
  };

  return Component;
}
