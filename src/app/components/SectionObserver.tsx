"use client";

import { useEffect, useRef, FC, useState } from 'react';
import { SectionKey } from './avatar/types';

// Implementación propia de throttle para eliminar la dependencia de lodash
function throttle<T extends (...args: unknown[]) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let previous = 0;

  return function(this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - previous);
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  };
}
 
interface SectionObserverProps {
  sections: string[];
  currentSection: SectionKey;
  onSectionChange: (section: SectionKey) => void;
  performanceMode: boolean;
}

const SectionObserver: FC<SectionObserverProps> = ({ 
  sections, 
  currentSection, 
  onSectionChange
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionsRef = useRef(sections);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSectionRef = useRef<SectionKey | null>(null);
  const lastIntersection = useRef<Record<string, number>>({});

  // Actualiza la referencia cuando cambien las secciones
  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  // Controlar los eventos de desplazamiento
  useEffect(() => {
    const handleScrollStart = throttle(() => {
      setIsScrolling(true);
      
      // Limpiar cualquier timeout existente
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Configurar un nuevo timeout
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        
        // Procesar cualquier cambio de sección pendiente
        if (pendingSectionRef.current && pendingSectionRef.current !== currentSection) {
          onSectionChange(pendingSectionRef.current);
          pendingSectionRef.current = null;
        }
      }, 150); // Tiempo de espera después de que se detiene el desplazamiento
    }, 100);
    
    window.addEventListener('scroll', handleScrollStart);
    
    return () => {
      window.removeEventListener('scroll', handleScrollStart);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentSection, onSectionChange]);

  // Método alternativo de detección de secciones basado en posición de desplazamiento
  useEffect(() => {
    const handleScroll = throttle(() => {
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
      if (closestSection && closestSection !== currentSection) {
        // Si estamos desplazándonos, almacenar para procesar después
        if (isScrolling) {
          pendingSectionRef.current = closestSection as SectionKey;
        } else {
          onSectionChange(closestSection as SectionKey);
        }
      }
    }, 100);
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentSection, onSectionChange, isScrolling, sections]);

  // Observador de intersección modificado para mayor fiabilidad
  useEffect(() => {
    // Limpiar el observador anterior
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Configuración optimizada para el observador de intersección
    const options = {
      rootMargin: '-15% 0px -15% 0px', // Margen reducido para mejor precisión
      threshold: [0.1, 0.2, 0.3, 0.4, 0.5] // Múltiples umbrales para detección más precisa
    };

    observerRef.current = new IntersectionObserver((entries) => {
      // Guardar ratios de intersección actualizados
      entries.forEach(entry => {
        const id = entry.target.id;
        if (id) {
          lastIntersection.current[id] = entry.intersectionRatio;
        }
      });
      
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
      if (maxSection && maxRatio > 0.1 && maxSection !== currentSection) {
        if (isScrolling) {
          pendingSectionRef.current = maxSection as SectionKey;
        } else {
          onSectionChange(maxSection as SectionKey);
        }
      }
    }, options);

    // Observar todas las secciones en el DOM
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

    // Cleanup al desmontar
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [onSectionChange, currentSection, isScrolling]);

  // Log para depuración en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Current section:', currentSection);
      console.log('Intersection ratios:', lastIntersection.current);
    }
  }, [currentSection]);

  return null;
};

export default SectionObserver;
