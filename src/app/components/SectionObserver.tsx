"use client";

import { useEffect, useRef, FC, useState, useCallback, memo } from 'react';
import { useInView } from 'react-intersection-observer';
import { SectionKey } from './avatar/types';

// Implementación optimizada de throttle
function throttle<T extends (...args: unknown[]) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    const now = Date.now();
    const remainingTime = wait - (now - lastTime);
    
    if (remainingTime <= 0) {
      lastTime = now;
      func(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastTime = Date.now();
        timeoutId = null;
        func(...args);
      }, remainingTime);
    }
  };
}
 
interface SectionObserverProps {
  sections: SectionKey[];
  currentSection: SectionKey;
  onSectionChange: (section: SectionKey) => void;
  performanceMode?: boolean;
  disabled?: boolean; // New prop to disable observation during elevator transitions
}

const SectionObserver: FC<SectionObserverProps> = memo(({ 
  sections, 
  currentSection, 
  onSectionChange,
  performanceMode = false,
  disabled = false // Default to enabled
}) => {
  const sectionsRef = useRef(sections);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSectionRef = useRef<SectionKey | null>(null);
  const currentSectionRef = useRef<SectionKey>(currentSection);
  const initialScrollRef = useRef(true);
  const isDisabledRef = useRef(disabled);
  const lastManualChangeTimeRef = useRef<number>(0);
  
  // Update the disabled ref when the prop changes
  useEffect(() => {
    isDisabledRef.current = disabled;
    
    // When disabled (elevator transition), mark the time to enforce a cooldown period
    if (disabled) {
      lastManualChangeTimeRef.current = Date.now();
    }
  }, [disabled]);
  
  // Sync our ref when currentSection changes (from button clicks)
  useEffect(() => {
    if (currentSection !== currentSectionRef.current) {
      currentSectionRef.current = currentSection;
      // Mark the time of this manual change to prevent immediate scroll observer overrides
      lastManualChangeTimeRef.current = Date.now();
    }
  }, [currentSection]);
  
  // Map to store the InView state for each section
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, number>>({});
  
  // Actualizar la referencia de la sección actual
  useEffect(() => {
    currentSectionRef.current = currentSection;
  }, [currentSection]);

  // Actualiza la referencia cuando cambien las secciones
  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  // Handler optimizado para eventos de scroll
  const throttledScrollHandler = throttle(() => {
    // Skip processing if observation is disabled (during elevator transitions)
    if (isDisabledRef.current) {
      return;
    }
    
    // Skip during manual change cooldown period (1 second)
    const timeSinceLastManualChange = Date.now() - lastManualChangeTimeRef.current;
    if (timeSinceLastManualChange < 1000) {
      return;
    }
    
    // Si es el primer scroll, no bloquear la experiencia inicial
    if (initialScrollRef.current) {
      initialScrollRef.current = false;
      return;
    }
    
    // Si estamos en transición por botones, no cambiar la sección
    // This is a crucial check to prevent section changes during elevator transitions
    if (disabled) {
      return;
    }

    // Marcar como scrolling
    setIsScrolling(true);
      
    // Limpiar cualquier timeout existente
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Configurar un nuevo timeout para detectar fin de scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      // If disabled during timeout, don't process
      if (isDisabledRef.current) {
        return;
      }
      
      setIsScrolling(false);
      
      // Procesar cualquier cambio de sección pendiente
      if (pendingSectionRef.current && pendingSectionRef.current !== currentSectionRef.current) {
        onSectionChange(pendingSectionRef.current);
        pendingSectionRef.current = null;
      }
    }, 150);
  }, performanceMode ? 250 : 100);

  const handleScroll = useCallback(() => {
    throttledScrollHandler();
  }, [throttledScrollHandler]);

  // Create stable callbacks for each section
  const visibilityCallbacks = useRef<Record<string, (ratio: number) => void>>({});
  
  // Create or get stable callback for a section
  const getVisibilityCallback = useCallback((sectionId: SectionKey) => {
    if (!visibilityCallbacks.current[sectionId]) {
      visibilityCallbacks.current[sectionId] = (ratio: number) => {
        // Only update visibility if not disabled
        if (!isDisabledRef.current) {
          setSectionVisibility(prev => ({
            ...prev,
            [sectionId]: ratio
          }));
        }
      };
    }
    return visibilityCallbacks.current[sectionId];
  }, []);

  // Update the most visible section when visibility changes
  useEffect(() => {
    // Skip section updates if observation is disabled
    if (isDisabledRef.current) {
      return;
    }
    
    if (!isScrolling && Object.keys(sectionVisibility).length > 0) {
      // Find the most visible section
      let maxRatio = 0;
      let maxSection: SectionKey | null = null;
      
      Object.entries(sectionVisibility).forEach(([section, ratio]) => {
        if (ratio > maxRatio && sectionsRef.current.includes(section as SectionKey)) {
          maxRatio = ratio;
          maxSection = section as SectionKey;
        }
      });
      
      // Update section if we have one with sufficient visibility
      if (maxSection && maxRatio > 0.15 && maxSection !== currentSectionRef.current) {
        // Solo actualizar la referencia visual sin cambiar el hash de la URL
        // Esto evita los saltos automáticos durante el desplazamiento normal
        onSectionChange(maxSection);
        
        // Eliminamos cualquier código que manipule la URL o history
        // Esto es lo que estaba causando los saltos al navegar
      }
    }
  }, [sectionVisibility, isScrolling, onSectionChange]);

  // Set up scroll listeners
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  // Create observer components for each section
  const sectionObservers = sections.map((sectionId) => (
    <SectionObserverItem 
      key={sectionId}
      sectionId={sectionId}
      threshold={performanceMode ? [0, 0.5] : [0, 0.15, 0.3, 0.5, 0.7, 0.85, 1]}
      onVisibilityChange={getVisibilityCallback(sectionId)}
      disabled={disabled}
    />
  ));

  return <>{sectionObservers}</>;
});

interface SectionObserverItemProps {
  sectionId: SectionKey;
  threshold: number | number[];
  onVisibilityChange: (ratio: number) => void;
  disabled?: boolean; // New prop to disable observation during elevator transitions
}

const SectionObserverItem: FC<SectionObserverItemProps> = memo(({ 
  sectionId, 
  threshold,
  onVisibilityChange,
  disabled = false // Default to enabled
}) => {
  // Track if we've already set up this section to avoid redundant updates
  const hasSetupRef = useRef(false);
  const prevRatioRef = useRef<number | null>(null);
  const isDisabledRef = useRef(disabled);
  
  // Update the disabled ref when the prop changes
  useEffect(() => {
    isDisabledRef.current = disabled;
  }, [disabled]);
  
  // Use the react-intersection-observer hook
  const { ref, entry } = useInView({
    threshold,
    triggerOnce: false,
    // Skip update if not in browser environment
    skip: typeof window === 'undefined'
  });

  // Update the parent component when intersection changes
  useEffect(() => {
    if (entry) {
      const currentRatio = entry.intersectionRatio;
      
      // Only trigger callback if ratio has actually changed and not disabled
      if (prevRatioRef.current !== currentRatio && !isDisabledRef.current) {
        prevRatioRef.current = currentRatio;
        onVisibilityChange(currentRatio);
      }
    }
  }, [entry, onVisibilityChange]);

  // Set the ref on the target section - only once
  useEffect(() => {
    if (!hasSetupRef.current && typeof window !== 'undefined') {
      const section = document.getElementById(sectionId);
      if (section && ref) {
        ref(section);
        hasSetupRef.current = true;
      }
    }
    // We only want to run this once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null; // This component doesn't render anything
});

SectionObserverItem.displayName = 'SectionObserverItem';
SectionObserver.displayName = 'SectionObserver';
export default SectionObserver;
