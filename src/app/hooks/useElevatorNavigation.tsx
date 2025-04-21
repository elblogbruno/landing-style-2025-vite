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

interface UseElevatorNavigationProps {
  currentSection: SectionKey;
  sections: SectionKey[];
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

/**
 * A shared hook for elevator navigation logic that can be used by both
 * desktop and mobile components
 */
export function useElevatorNavigation({
  currentSection,
  sections,
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

  // Keep currentSectionRef updated
  useEffect(() => {
    currentSectionRef.current = currentSection;
    setCurrentFloor(floorMap[currentSection] || 0);
    
    // When section changes by scrolling (not by button click),
    // we need to make sure doors are open
    if (!isTransitioning && doorsState !== 'open') {
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
    console.log("Transition complete, opening doors");
    setDoorsState('opening');
    
    // Doors should be fully open after animation finishes
    if (doorTimerRef.current) {
      clearTimeout(doorTimerRef.current);
    }
    
    doorTimerRef.current = setTimeout(() => {
      console.log("Doors fully opened, transition complete");
      setDoorsState('open');
      setIsTransitioning(false);
      setTransitionStatus('inactive');
      document.body.style.overflow = ''; // Restore scrolling
      document.body.classList.remove('elevator-transition-active');
      
      // Force update current floor based on the current section
      setCurrentFloor(floorMap[currentSectionRef.current] || 0);
      
      // Notify parent that transition is complete
      if (onTransitionChange) {
        onTransitionChange(false);
      }
      
      // Clear target section
      targetSectionRef.current = null;
      
      doorTimerRef.current = null;
    }, 1600); // Time for doors to fully open - match the animation duration
  }, [onTransitionChange]);

  // Handle section change with door animation and synchronized scroll
  const handleFloorClick = useCallback((floor: SectionKey) => {
    // Prevent navigation if already on current floor or transitioning
    if (floor === currentSectionRef.current || isTransitioning) {
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
    
    // Start transition sequence - FIRST close doors
    console.log("Closing doors before transition");
    setDoorsState('closing');
    setIsTransitioning(true);
    setTransitionStatus('preparing');
    
    // Notify parent component about transition
    if (onTransitionChange) {
      onTransitionChange(true);
    }
    
    // Calculate distance and direction for visual effects
    const currentFloorIndex = sections.indexOf(currentSectionRef.current);
    const targetFloorIndex = sections.indexOf(floor);
    const floorDistance = Math.abs(targetFloorIndex - currentFloorIndex);
    const direction = targetFloorIndex > currentFloorIndex ? 'down' : 'up';
    
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
      console.log("Doors closed, starting scroll transition");
      setDoorsState('closed'); 
      setTransitionStatus('scrolling');
      
      // Calculate floors in transition (for visual effects)
      let intermediateFloors: SectionKey[] = [];
      
      // If going through multiple floors, determine the intermediate floors
      if (floorDistance > 1) {
        // Going down or up through floors
        if (direction === 'down') {
          for (let i = currentFloorIndex + 1; i < targetFloorIndex; i++) {
            intermediateFloors.push(sections[i]);
          }
        } else {
          for (let i = currentFloorIndex - 1; i > targetFloorIndex; i--) {
            intermediateFloors.push(sections[i]);
          }
        }
      }
      
      // Create a sequence of floor highlights instead of highlighting all at once
      floorsInTransitionRef.current = []; // Start with empty array
      
      // Function to sequentially highlight floors with realistic timing
      const highlightFloorsSequentially = () => {
        if (intermediateFloors.length > 0) {
          // Add floors one by one with delays
          const highlightNextFloor = (index: number) => {
            if (index < intermediateFloors.length) {
              // Update the floors in transition array
              floorsInTransitionRef.current = [...floorsInTransitionRef.current, intermediateFloors[index]];
              
              // Force a re-render by updating a state
              setCurrentFloor(prev => {
                // This is just to trigger a re-render, the actual value doesn't change
                setTimeout(() => setCurrentFloor(prev), 0);
                return prev;
              });
              
              // Calculate dynamic delay based on distance between floors
              // This creates a more realistic effect where the elevator slows down between floors
              const baseDelay = 300; // ms
              const accelDelay = Math.max(150, 300 - (index * 30)); // Elevator accelerates as it moves
              
              // Schedule the next floor highlight
              setTimeout(() => highlightNextFloor(index + 1), accelDelay);
            } else {
              // Finally add the target floor after a slightly longer delay
              setTimeout(() => {
                floorsInTransitionRef.current = [...floorsInTransitionRef.current, floor];
                // Force another re-render
                setCurrentFloor(prev => {
                  setTimeout(() => setCurrentFloor(prev), 0);
                  return prev;
                });
              }, 250);
            }
          };
          
          // Start the sequence with the first floor after a small initial delay
          setTimeout(() => highlightNextFloor(0), 200);
        } else {
          // If there are no intermediate floors, just highlight the target
          // with a small delay to simulate movement
          setTimeout(() => {
            floorsInTransitionRef.current = [floor];
            // Force a re-render
            setCurrentFloor(prev => {
              setTimeout(() => setCurrentFloor(prev), 0);
              return prev;
            });
          }, 300);
        }
      };
      
      // Start the sequential highlighting
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
        
        // Custom smooth scrolling with natural easing
        smoothScrollTo(targetY, 1200, () => {
          // Schedule transition status update for a more natural timing
          setTimeout(() => {
            console.log("Scroll completed, arriving at destination");
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
    }, 1600); // Time for doors to fully close - match the animation duration
  }, [completeTransition, currentSectionRef, isTransitioning, onTransitionChange, sections]);

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
    completeTransition
  };
}