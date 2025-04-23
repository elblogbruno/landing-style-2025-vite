import { useState, useRef, useCallback, useEffect } from 'react';
import { track } from '../utils/umami-analytics';
import { SectionKey } from '../components/avatar/types';

// Floor mapping shared between desktop and mobile
export const floorMap: Record<string, number> = {
  hero: 6,
  about: 5,
  experience: 4,
  projects: 3,
  talks: 2,
  news: 1,
  awards: 0,
  education: -1,
  contact: -2
};

const DEBUG_ELEVATOR = false;

interface UseElevatorNavigationProps {
  currentSection: SectionKey; 
  onTransitionChange?: (isTransitioning: boolean) => void;
  isButtonTriggered?: boolean;
}

interface UseElevatorNavigationReturn {
  isTransitioning: boolean;
  currentFloor: number;
  doorsState: 'closed' | 'opening' | 'closing' | 'open';
  transitionStatus: 'inactive' | 'preparing' | 'scrolling' | 'arriving';
  targetSection: SectionKey | null;
  floorsInTransition: SectionKey[];
  handleFloorClick: (floor: SectionKey) => void;
  getCurrentFloorNumber: (floor?: string) => number;
  completeTransition: () => void;
}

// Elevator-like easing scroll animation
const smoothScrollTo = (
  targetY: number,
  duration: number = 1000,
  callback?: () => void
) => {
  const startY = window.scrollY;
  const difference = targetY - startY;
  const startTime = performance.now();

  const step = () => {
    const progress = (performance.now() - startTime) / duration;
    const amount = easeInOutCubic(Math.min(progress, 1));
    
    window.scrollTo({
      top: startY + difference * amount,
      behavior: 'auto' // We're handling the animation ourselves
    });
    
    if (progress < 1) {
      requestAnimationFrame(step);
    } else if (callback) {
      callback();
    }
  };
  
  // Start animation
  requestAnimationFrame(step);
};

// Cubic easing for more natural elevator movement
function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Utility function for debugging
const elevatorLog = (message: string, important = false) => {
  if (DEBUG_ELEVATOR) {
    const style = important 
      ? 'background:#a83232;color:white;padding:3px;border-radius:2px;'
      : 'background:#0f3a65;color:#ffffcc;padding:2px;';
    console.log(`%c [ELEVATOR HOOK] ${message}`, style);
  }
};

/**
 * A shared hook for elevator navigation logic that can be used by both
 * desktop and mobile components
 */
export function useElevatorNavigation({
  currentSection, 
  onTransitionChange,
  isButtonTriggered = false
}: UseElevatorNavigationProps): UseElevatorNavigationReturn {
  // Core states
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentFloor, setCurrentFloor] = useState(floorMap[currentSection] || 0);
  const [doorsState, setDoorsState] = useState<'closed' | 'opening' | 'closing' | 'open'>('open');
  const [transitionStatus, setTransitionStatus] = useState<'inactive' | 'preparing' | 'scrolling' | 'arriving'>('inactive');

  // Refs for tracking internal state
  const currentSectionRef = useRef<SectionKey>(currentSection);
  const targetSectionRef = useRef<SectionKey | null>(null);
  const floorsInTransitionRef = useRef<SectionKey[]>([]);
  const elementCache = useRef<Record<string, HTMLElement | null>>({});
  const doorTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Referencia para rastrear si la navegación fue iniciada por botón
  const isButtonNavigationRef = useRef(isButtonTriggered);

  // Actualizar la referencia cuando cambia isButtonTriggered
  useEffect(() => {
    isButtonNavigationRef.current = isButtonTriggered;
    
    // Si es navegación por botón, realizar acciones adicionales
    if (isButtonTriggered && !isTransitioning) {
      elevatorLog("Navegación iniciada por botón detectada", true);
      
      // Emitir evento para notificar que se iniciará una transición por botón
      const buttonNavEvent = new CustomEvent('elevator-button-navigation', {
        detail: {
          isButtonTriggered: true,
          currentSection
        }
      });
      window.dispatchEvent(buttonNavEvent);
    }
  }, [isButtonTriggered, isTransitioning, currentSection]);

  // Keep currentSectionRef updated
  useEffect(() => {
    currentSectionRef.current = currentSection;
    setCurrentFloor(floorMap[currentSection] || 0);
    
    // When section changes by scrolling (not by button click),
    // we need to make sure doors are open
    if (!isTransitioning && doorsState !== 'open' && !isButtonNavigationRef.current) {
      elevatorLog("Cambio de sección por scroll, abriendo puertas", true);
      setDoorsState('opening');
      
      // Reset doors to open state after animation completes
      if (doorTimerRef.current) {
        clearTimeout(doorTimerRef.current);
      }
      
      doorTimerRef.current = setTimeout(() => {
        setDoorsState('open');
        doorTimerRef.current = null;
      }, 800);
    }
  }, [currentSection, isTransitioning, doorsState]);

  // Function to get current floor number based on section
  const getCurrentFloorNumber = useCallback((floor?: string) => {
    if (floor) {
      return floorMap[floor] || 0;
    }
    return floorMap[currentSectionRef.current] || 0;
  }, []);

  // Function to complete the transition process
  const completeTransition = useCallback(() => {
    // Final phase: Clean up and restore normal state
    elevatorLog("Transition complete, opening doors", true);
    
    // Simplificar el proceso: primero actualizar estado interno, luego emitir un único evento
    setDoorsState('opening');
    setTransitionStatus('arriving');
    
    // Enviar un único evento fuerte y claro para abrir las puertas
    const forceDoorEvent = new CustomEvent('elevator-force-door-action', { 
      detail: { 
        action: 'force-open',
        source: 'transition-complete',
        floor: currentSectionRef.current
      } 
    });
    window.dispatchEvent(forceDoorEvent);
    
    // Limpiar timers existentes
    if (doorTimerRef.current) {
      clearTimeout(doorTimerRef.current);
    }
    
    // Programar la finalización de la transición
    doorTimerRef.current = setTimeout(() => {
      elevatorLog("Doors fully opened, transition complete", true);
      
      // Actualizar estados finales
      setDoorsState('open');
      setIsTransitioning(false);
      setTransitionStatus('inactive');
      
      // Restaurar scroll
      document.body.style.overflow = '';
      document.body.classList.remove('elevator-transition-active');
      
      // Resetear referencias
      isButtonNavigationRef.current = false;
      
      // Actualizar el piso actual
      setCurrentFloor(floorMap[currentSectionRef.current] || 0);
      
      // Notificar al componente padre
      if (onTransitionChange) {
        onTransitionChange(false);
      }
      
      // Limpiar sección objetivo
      targetSectionRef.current = null;
      doorTimerRef.current = null;
    }, 1800); // Tiempo extendido para asegurar que la animación se complete
  }, [onTransitionChange, currentSectionRef]);

  // Handle section change with door animation and synchronized scroll
  const handleFloorClick = useCallback((floor: SectionKey) => {
    // Log para debugging
    elevatorLog(`handleFloorClick called with floor: ${floor}`, true);
    
    // Prevent navigation if already on current floor or transitioning
    if (floor === currentSectionRef.current || isTransitioning) {
      elevatorLog(`Navigation prevented: ${floor === currentSectionRef.current ? 'already on this floor' : 'transition in progress'}`);
      // Provide visual feedback if trying to navigate to current floor
      if (floor === currentSectionRef.current) {
        const button = document.querySelector(`button[aria-label="Ir al piso ${floor}"], button[title="Go to ${floor.charAt(0).toUpperCase() + floor.slice(1)}"]`);
        if (button) {
          button.classList.add('elevator-current-floor-blink');
          setTimeout(() => {
            button.classList.remove('elevator-current-floor-blink');
          }, 500);
        }
      }
      return;
    }
    
    // Track user interaction
    track({
      category: 'Elevator',
      action: 'FloorSelected',
      label: floor
    });

    // Store target section
    targetSectionRef.current = floor;
    
    // SIMPLIFICACIÓN: Un único evento fuerte para forzar el cierre de puertas
    const forceDoorEvent = new CustomEvent('elevator-force-door-action', { 
      detail: { 
        action: 'force-close',
        source: 'floor-navigation',
        floor: floor,
        important: true
      } 
    });
    window.dispatchEvent(forceDoorEvent);
    
    // Actualizar estados internos
    setDoorsState('closing');
    setIsTransitioning(true);
    setTransitionStatus('preparing');
    
    // Notificar al componente padre
    if (onTransitionChange) {
      onTransitionChange(true);
    }
    
     
    
    // Fallback a los valores numéricos de piso si los índices no están disponibles
    const currentFloorNumber = floorMap[currentSectionRef.current] || 0;
    const targetFloorNumber = floorMap[floor] || 0;
    
    // Determinar la dirección basada en los números de piso (más confiable)
    const direction = targetFloorNumber > currentFloorNumber ? 'down' : 'up';
    
    // Calcular la distancia absoluta entre pisos para efectos visuales
    const floorDistance = Math.abs(targetFloorNumber - currentFloorNumber);
    
    // Block normal scrolling during transition
    document.body.style.overflow = 'hidden';
    document.body.classList.add('elevator-transition-active');
    
    // Cache the target element for improved performance
    if (!elementCache.current[floor]) {
      elementCache.current[floor] = document.getElementById(floor);
    }

    // Wait for doors to close fully before initiating scrolling
    setTimeout(() => {
      // Update door state to fully closed
      elevatorLog("Doors closed, starting scroll transition", true);
      
      // Verificar que las puertas se hayan actualizado correctamente
      if (doorsState !== 'closed') {
        elevatorLog(`Forzando actualización de estado de puertas a 'closed'`, true);
        setDoorsState('closed');
      }
      
      // Emitir otro evento para confirmar que las puertas están cerradas
      const doorClosedEvent = new CustomEvent('elevator-doors-closed');
      window.dispatchEvent(doorClosedEvent);
      
      setDoorsState('closed'); 
      setTransitionStatus('scrolling');
      
      // Reiniciar el array de pisos en transición
      floorsInTransitionRef.current = [];
      
      // Crear un array con todos los pisos intermedios usando números de piso en lugar de índices
      const getAllIntermediateFloors = (): SectionKey[] => {
        const result: SectionKey[] = [];
        
        // Determinar el rango de pisos a recorrer
        const startFloor = currentFloorNumber;
        const endFloor = targetFloorNumber;
        
        // Crear una lista ordenada de todos los pisos por recorrer (incluido el destino)
        if (direction === 'down') { // Bajando (números de piso decrecientes)
          for (let i = startFloor - 1; i >= endFloor; i--) {
            // Encontrar la sección que corresponde a este número de piso
            // Usar el comodín ',' para indicar claramente que no usamos la primera parte
            const floorSection = Object.entries(floorMap).find(([, value]) => value === i)?.[0] as SectionKey;
            if (floorSection) {
              result.push(floorSection);
            }
          }
        } else { // Subiendo (números de piso crecientes)
          for (let i = startFloor + 1; i <= endFloor; i++) {
            // Encontrar la sección que corresponde a este número de piso
            // Eliminar el guion bajo ',' para evitar la advertencia de ESLint
            const floorSection = Object.entries(floorMap).find(([, value]) => value === i)?.[0] as SectionKey;
            if (floorSection) {
              result.push(floorSection);
            }
          }
        }
        
        return result;
      };
      
      // Obtener todos los pisos intermedios ordenados correctamente
      const intermediateFloors = getAllIntermediateFloors();
      elevatorLog(`Pisos intermedios calculados: ${JSON.stringify(intermediateFloors)}`, true);
      
      // Función mejorada para iluminar los pisos de manera secuencial
      const highlightFloorsSequentially = () => {
        // Limpiar el estado actual - importante para evitar iluminaciones aleatorias
        floorsInTransitionRef.current = [];
        
        // Siempre empezamos con el piso actual
        floorsInTransitionRef.current = [currentSectionRef.current];
        
        // Debug para verificar que los pisos intermedios son correctos
        elevatorLog(`Iniciando secuencia de iluminación. Pisos intermedios: ${JSON.stringify(intermediateFloors)}`, true);
        
        // Forzar re-renderizado inicial
        setCurrentFloor(prev => {
          setTimeout(() => setCurrentFloor(prev), 0);
          return prev;
        });
        
        // Si no hay pisos intermedios, simplemente iluminar el destino después de un breve retraso
        if (intermediateFloors.length === 0) {
          setTimeout(() => {
            floorsInTransitionRef.current = [currentSectionRef.current, floor];
            elevatorLog(`No hay pisos intermedios, iluminando solo destino: ${floor}`, true);
            // Forzar un re-renderizado
            setCurrentFloor(prev => {
              setTimeout(() => setCurrentFloor(prev), 0);
              return prev;
            });
          }, 300);
          return;
        }
        
        // Función para iluminar el siguiente piso y acumularlos
        const highlightNextFloor = (index: number) => {
          if (index < intermediateFloors.length) {
            const nextFloor = intermediateFloors[index];
            
            // Protección contra valores undefined o nulos
            if (!nextFloor) {
              elevatorLog(`ERROR: Piso intermedio inválido en índice ${index}`, true);
              return;
            }
            
            // IMPORTANTE: Crear un nuevo array en cada paso para evitar mutaciones no deseadas
            // Incluimos siempre el piso actual como punto de partida
            const updatedFloors = [currentSectionRef.current, ...intermediateFloors.slice(0, index + 1)];
            floorsInTransitionRef.current = updatedFloors;
            
            // Debug
            elevatorLog(`Iluminando piso ${nextFloor} (índice ${index}). Array actual: ${JSON.stringify(updatedFloors)}`, false);
            
            // Emitir un evento para el efecto de sonido del piso
            const floorPassEvent = new CustomEvent('elevator-floor-pass', { 
              detail: { 
                floor: nextFloor,
                index: index,
                total: intermediateFloors.length
              } 
            });
            window.dispatchEvent(floorPassEvent);
            
            // Forzar un re-renderizado
            setCurrentFloor(prev => {
              setTimeout(() => setCurrentFloor(prev), 0);
              return prev;
            });
            
            // Calcular un retraso dinámico basado en la distancia total
            // Esto crea un efecto más realista donde el ascensor acelera y luego desacelera
            let delay: number;
            
            if (floorDistance <= 2) {
              // Para distancias cortas, usar un delay constante
              delay = 400;
            } else {
              // Para distancias largas, acelerar en el medio y desacelerar al final
              const normalizedPosition = index / (intermediateFloors.length - 1); // 0 a 1
              
              if (normalizedPosition < 0.3) {
                // Fase de aceleración: retrasos decrecientes
                delay = 400 - (normalizedPosition * 200);
              } else if (normalizedPosition > 0.7) {
                // Fase de desaceleración: retrasos crecientes
                delay = 300 + ((normalizedPosition - 0.7) * 400);
              } else {
                // Velocidad máxima en el medio del recorrido
                delay = 200;
              }
            }
            
            // Programar el resaltado del siguiente piso
            setTimeout(() => highlightNextFloor(index + 1), delay);
          } else {
            // Asegurarnos de que el último estado incluya el piso de destino
            const finalFloors = [...floorsInTransitionRef.current];
            
            // Verificar si ya incluye el piso destino para evitar duplicados
            if (!finalFloors.includes(floor)) {
              finalFloors.push(floor);
              floorsInTransitionRef.current = finalFloors;
              
              // Forzar un último re-renderizado
              setCurrentFloor(prev => {
                setTimeout(() => setCurrentFloor(prev), 0);
                return prev;
              });
              
              elevatorLog(`Secuencia de iluminación completada. Estado final: ${JSON.stringify(finalFloors)}`, true);
            }
          }
        };
        
        // Iniciar la secuencia después de un pequeño retraso inicial para permitir que las puertas se cierren completamente
        setTimeout(() => highlightNextFloor(0), 300);
      };

      // Iniciar la secuencia de iluminación
      highlightFloorsSequentially();

      // Emit events for door status and movement
      const movingEvent = new CustomEvent('elevator-moving', { 
        detail: { direction, fromFloor: currentSectionRef.current, toFloor: floor } 
      });
      window.dispatchEvent(movingEvent);
      
      // Find the section element directly and scroll to it
      const targetSection = elementCache.current[floor];
      if (targetSection) {
        // Update the application's current section state
        // This is critical to keep everything in sync
        const event = new CustomEvent('section-change', { 
          detail: { section: floor } 
        });
        window.dispatchEvent(event);
        
        // Scroll to section with offset (smoother animation)
        const yOffset = -50;
        const targetY = targetSection.getBoundingClientRect().top + window.scrollY + yOffset;
        
        // Ajustar la duración del scroll para simular un movimiento más natural como un ascensor
        // Aceleración inicial, velocidad constante en el medio y desaceleración al final
        const baseDuration = 800; // Duración base para distancias cortas
        const maxDuration = 3000; // Duración máxima para distancias largas
        const accelerationFactor = 1.5; // Factor de aceleración/desaceleración
        const scrollDuration = Math.min(
          maxDuration,
          baseDuration + Math.pow(floorDistance, accelerationFactor) * 100
        );
        
        // Custom smooth scrolling with natural easing
        smoothScrollTo(targetY, scrollDuration, () => {
          // Schedule transition status update for a more natural timing
          setTimeout(() => {
            elevatorLog("Scroll completed, arriving at destination", true);
            setTransitionStatus('arriving');
            
            // Emit arrived event
            const arrivedEvent = new CustomEvent('elevator-arrived', { 
              detail: { floor } 
            });
            window.dispatchEvent(arrivedEvent);
            
            // Complete the transition after arrival delay
            setTimeout(() => {
              completeTransition();
            }, 600);
          }, 400);
        });
      } else {
        console.error(`Could not find target element with ID: ${floor}`);
        completeTransition(); // Clean up if there was an error
      }
    }, 1800); // Tiempo extendido para asegurar el cierre completo
  }, [completeTransition, currentSectionRef, isTransitioning, doorsState, onTransitionChange]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (doorTimerRef.current) {
        clearTimeout(doorTimerRef.current);
      }
    };
  }, []);

  return {
    isTransitioning,
    currentFloor,
    doorsState,
    transitionStatus,
    targetSection: targetSectionRef.current,
    floorsInTransition: floorsInTransitionRef.current,
    handleFloorClick,
    getCurrentFloorNumber,
    completeTransition, 
  };
}