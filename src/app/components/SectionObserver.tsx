"use client";

import { useEffect, useRef, FC, useState, useCallback, memo } from 'react';
import { SectionKey } from './avatar/types';

// Implementación optimizada de throttle
function throttle<T extends (...args: unknown[]) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      func(...args);
    }
  };
}
 
interface SectionObserverProps {
  sections: string[];
  currentSection: SectionKey;
  onSectionChange: (section: SectionKey) => void;
  performanceMode?: boolean;
}

const SectionObserver: FC<SectionObserverProps> = memo(({ 
  sections, 
  currentSection, 
  onSectionChange,
  performanceMode = false
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionsRef = useRef(sections);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSectionRef = useRef<SectionKey | null>(null);
  const lastIntersection = useRef<Record<string, number>>({});
  const currentSectionRef = useRef<SectionKey>(currentSection);
  
  // Actualizar la referencia de la sección actual
  useEffect(() => {
    currentSectionRef.current = currentSection;
  }, [currentSection]);

  // Actualiza la referencia cuando cambien las secciones
  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  // Handler optimizado para eventos de scroll
  const handleScroll = useCallback(throttle(() => {
    // Marcar como scrolling
    setIsScrolling(true);
      
    // Limpiar cualquier timeout existente
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Configurar un nuevo timeout para detectar fin de scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      
      // Procesar cualquier cambio de sección pendiente
      if (pendingSectionRef.current && pendingSectionRef.current !== currentSectionRef.current) {
        onSectionChange(pendingSectionRef.current);
        pendingSectionRef.current = null;
      }
    }, 150);
    
  }, performanceMode ? 250 : 100), [onSectionChange, performanceMode]);

  // Método para determinar la sección visible
  const updateVisibleSection = useCallback(throttle(() => {
    // En modo de rendimiento alto, usar un algoritmo más simple
    if (performanceMode) {
      const viewportCenter = window.scrollY + (window.innerHeight / 2);
      
      // Encontrar sección visible con algoritmo simplificado
      for (const sectionId of sectionsRef.current) {
        const element = document.getElementById(sectionId);
        if (!element) continue;
        
        const top = element.offsetTop;
        const bottom = top + element.clientHeight;
        
        // Si el centro de la pantalla está dentro de la sección
        if (viewportCenter >= top && viewportCenter <= bottom) {
          if (sectionId !== currentSectionRef.current) {
            if (isScrolling) {
              pendingSectionRef.current = sectionId as SectionKey;
            } else {
              onSectionChange(sectionId as SectionKey);
            }
          }
          break;
        }
      }
      return;
    }
    
    // Para dispositivos más potentes, usar algoritmo más preciso
    const viewportHeight = window.innerHeight;
    const viewportCenter = window.scrollY + viewportHeight / 2;
    
    // Calcular qué sección está más cerca del centro de la pantalla
    let closestSection = null;
    let closestDistance = Infinity;
    
    sectionsRef.current.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) {
        const rect = element.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        const absoluteBottom = rect.bottom + window.scrollY;
        const sectionCenter = (absoluteTop + absoluteBottom) / 2;
        
        const distance = Math.abs(viewportCenter - sectionCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestSection = sectionId;
        }
      }
    });
    
    // Si encontramos una sección cercana y es diferente de la actual
    if (closestSection && closestSection !== currentSectionRef.current) {
      // Si estamos desplazándonos, almacenar para procesar después
      if (isScrolling) {
        pendingSectionRef.current = closestSection as SectionKey;
      } else {
        onSectionChange(closestSection as SectionKey);
      }
    }
  }, performanceMode ? 300 : 150), [onSectionChange, isScrolling, performanceMode]);

  // Configurar observer de scroll
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', updateVisibleSection, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', updateVisibleSection);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll, updateVisibleSection]);

  // Observador de intersección solo para dispositivos de mayor rendimiento
  useEffect(() => {
    // En modo de alto rendimiento, no usar IntersectionObserver
    if (performanceMode) {
      return;
    }
    
    // Limpiar el observador anterior
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Configuración optimizada para el observador de intersección
    const options = {
      rootMargin: '-15% 0px -15% 0px',
      threshold: [0.15, 0.5] // Menos umbrales para mejorar rendimiento
    };

    observerRef.current = new IntersectionObserver((entries) => {
      // Actualizar solo las entradas que han cambiado
      let needsUpdate = false;
      
      entries.forEach(entry => {
        const id = entry.target.id;
        if (id && lastIntersection.current[id] !== entry.intersectionRatio) {
          lastIntersection.current[id] = entry.intersectionRatio;
          needsUpdate = true;
        }
      });
      
      // Solo procesar si alguna ratio ha cambiado
      if (needsUpdate) {
        // Encontrar la sección con mayor visibilidad
        let maxRatio = 0;
        let maxSection = null;
        
        Object.entries(lastIntersection.current).forEach(([section, ratio]) => {
          if (ratio > maxRatio && sectionsRef.current.includes(section)) {
            maxRatio = ratio;
            maxSection = section;
          }
        });
        
        // Actualizar sección si tenemos una con suficiente visibilidad
        if (maxSection && maxRatio > 0.15 && maxSection !== currentSectionRef.current) {
          if (isScrolling) {
            pendingSectionRef.current = maxSection as SectionKey;
          } else {
            onSectionChange(maxSection as SectionKey);
          }
        }
      }
    }, options);

    // Observar solo elementos visibles inicialmente para reducir sobrecarga
    requestAnimationFrame(() => {
      sectionsRef.current.forEach((section) => {
        const element = document.getElementById(section);
        if (element) {
          observerRef.current?.observe(element);
          
          // Inicializar con un valor por defecto si aún no existe
          if (!(section in lastIntersection.current)) {
            lastIntersection.current[section] = 0;
          }
        }
      });
    });

    // Cleanup al desmontar
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isScrolling, onSectionChange, performanceMode]);

  return null;
});

SectionObserver.displayName = 'SectionObserver';
export default SectionObserver;
