import React, { useState, useEffect, useRef } from 'react';
import { track } from '../../utils/umami-analytics';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionKey } from '../avatar/types';
import { useTranslation } from 'react-i18next';
import { useElevatorNavigation } from '../../hooks/useElevatorNavigation';
import { getFloorAltitude } from '../../utils/elevator-altitude';
import './mobile-elevator.css';
 
interface MobileElevatorWidgetProps {
  currentSection: SectionKey;
  theme: "dark" | "light";
  floors: string[];
  highlightOnMount?: boolean;
  onTransitionChange?: (isTransitioning: boolean) => void; 
}

const MobileElevatorWidget: React.FC<MobileElevatorWidgetProps> = ({
  currentSection,
  theme,
  floors,
  highlightOnMount = false,
  onTransitionChange, 
}) => {
  const { t } = useTranslation();
  
  // Use the shared elevator navigation hook
  const {
    isTransitioning,
    currentFloor,
    doorsState,
    transitionStatus,
    targetSection, 
    handleFloorClick,
    getCurrentFloorNumber
  } = useElevatorNavigation({
    currentSection, 
    onTransitionChange
  });

  // State management
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [dingSound, setDingSound] = useState<HTMLAudioElement | null>(null);
  const [movingSound, setMovingSound] = useState<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isHighlighted, setIsHighlighted] = useState(highlightOnMount);
  const [showDoors, setShowDoors] = useState(false);
  const [isCityView, setIsCityView] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  // const [doorAnimation, setDoorAnimation] = useState<'opening' | 'closing' | null>(null);
  
  // Refs
  const widgetRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);
  const isScrolling = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Haptic feedback utility (vibrate API with fallback)
  const triggerHaptic = (pattern: number | number[] = 15) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Safe fallback if permission is not granted
      }
    }
  };
  
  // Hide while scrolling in either direction, then restore after a short pause.
  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;
    setIsReading(false);
    const onScroll = () => {
      if (isExpanded || isTransitioning) return;
      clearTimeout(idleTimer);
      setIsReading(true);
      if (typeof document !== 'undefined') {
        document.body.classList.add('mobile-reading');
      }
      idleTimer = setTimeout(() => {
        setIsReading(false);
        if (typeof document !== 'undefined') {
          document.body.classList.remove('mobile-reading');
        }
      }, 700);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('scroll', onScroll);
      if (typeof document !== 'undefined') {
        document.body.classList.remove('mobile-reading');
      }
    };
  }, [isExpanded, isTransitioning]);

  // City view event listener synchronization
  useEffect(() => {
    const handleCityViewEvent = (e: Event) => {
      const ce = e as CustomEvent<{ active: boolean }>;
      if (ce.detail && typeof ce.detail.active === 'boolean') {
        setIsCityView(ce.detail.active);
      }
    };
    window.addEventListener('toggle-city-view', handleCityViewEvent);
    return () => window.removeEventListener('toggle-city-view', handleCityViewEvent);
  }, []);

  // Haptic feedback on arrival
  useEffect(() => {
    if (transitionStatus === 'arriving') {
      triggerHaptic([25, 45, 25]);
    }
  }, [transitionStatus]);

  // Initialize audio elements
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dingAudio = new Audio('/sounds/elevator-ding.mp3');
      const movingAudio = new Audio('/sounds/elevator-moving.mp3');
      dingAudio.volume = 0.6;
      movingAudio.volume = 0.3;
      movingAudio.loop = true;
      
      setDingSound(dingAudio);
      setMovingSound(movingAudio);
    }
    
    // Close the widget when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      
      // Clear any lingering timeouts
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      
      // Reset any body styles
      document.body.style.overflow = '';
      document.body.classList.remove('elevator-transition-active');
      if (typeof document !== 'undefined') {
        document.body.classList.remove('mobile-reading');
      }
    };
  }, []);

  // Hide the fixed floor control while the footer owns the bottom of the viewport.
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const updateFooterVisibility = () => { const rect = footer.getBoundingClientRect(); setIsFooterVisible(rect.top < window.innerHeight && rect.bottom > 0); };
    const observer = new IntersectionObserver(([entry]) => setIsFooterVisible(entry.isIntersecting), { threshold: 0.01 });
    observer.observe(footer);
    updateFooterVisibility();
    window.addEventListener('scroll', updateFooterVisibility, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener('scroll', updateFooterVisibility); };
  }, []);

  // Handle initial highlight animation
  useEffect(() => {
    if (highlightOnMount) {
      // Turn off the highlight after 5 seconds
      const timeoutId = setTimeout(() => {
        setIsHighlighted(false);
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [highlightOnMount]);
  
  // Handle sounds based on state changes
  useEffect(() => {
    // Handle sounds for elevator arrival and transitions
    if (isTransitioning) {
      if (!isMuted && movingSound) {
        // Play elevator movement sound
        movingSound.play().catch(err => console.error(t('elevator.errors.soundPlay', 'Error playing elevator sound:'), err));
        
        // Setup event listener for arrival to play ding sound
        const handleElevatorArrived = () => {
          if (movingSound) {
            movingSound.pause();
            movingSound.currentTime = 0;
          }
          if (dingSound) {
            dingSound.play().catch(err => console.error(t('elevator.errors.dingPlay', 'Error playing elevator ding:'), err));
          }
          triggerHaptic([25, 45, 25]);
        };
        
        window.addEventListener('elevator-arrived', handleElevatorArrived);
        
        return () => {
          window.removeEventListener('elevator-arrived', handleElevatorArrived);
          if (movingSound) {
            movingSound.pause();
            movingSound.currentTime = 0;
          }
        };
      }
    } else {
      // Play a quick ding when section changes by scrolling (not during transitions)
      if (!isTransitioning && !isMuted && dingSound) {
        dingSound.play().catch(err => console.error('Error playing elevator ding:', err));
      }
    }
  }, [dingSound, isTransitioning, isMuted, movingSound, t]);

  // Update doors visibility based on isTransitioning
  useEffect(() => {
    setShowDoors(isTransitioning);
  }, [isTransitioning]);

  // Add a scroll listener to prevent conflicts
  useEffect(() => {
    const handleScroll = () => {
      if (isTransitioning) {
        // If user tries to scroll while transitioning, block it
        if (isScrolling.current) {
          return;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: false });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isTransitioning]);

  // Touch gesture handling for mobile bottom sheet and bar
  const handleExpandedTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleExpandedTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;
    const diffX = Math.abs(e.changedTouches[0].clientX - (touchStartX.current || 0));
    // Swipe down > 45px closes expanded bottom sheet
    if (diffY > 45 && diffY > diffX) {
      setIsExpanded(false);
      triggerHaptic(10);
    }
    touchStartY.current = null;
    touchStartX.current = null;
  };

  const handleBarTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleBarTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;
    const diffX = (touchStartX.current || 0) - e.changedTouches[0].clientX;
    
    // Swipe UP opens sheet
    if (diffY < -35 && Math.abs(diffY) > Math.abs(diffX)) {
      setIsExpanded(true);
      triggerHaptic(15);
    }
    // Swipe LEFT goes to next floor
    else if (diffX > 45 && Math.abs(diffX) > Math.abs(diffY)) {
      if (!isTransitioning) {
        triggerHaptic(15);
        handleFloorClick(destination);
      }
    }
    // Swipe RIGHT goes to previous floor
    else if (diffX < -45 && Math.abs(diffX) > Math.abs(diffY)) {
      const currentIndex = floors.indexOf(currentSection);
      const prevFloor = (currentIndex > 0 ? floors[currentIndex - 1] : floors[floors.length - 1]) as SectionKey;
      if (!isTransitioning) {
        triggerHaptic(15);
        handleFloorClick(prevFloor);
      }
    }
    touchStartY.current = null;
    touchStartX.current = null;
  };

  // Toggle city view mode
  const toggleCityView = () => {
    const nextState = !isCityView;
    setIsCityView(nextState);
    triggerHaptic(15);
    window.dispatchEvent(new CustomEvent('toggle-city-view', { detail: { active: nextState } }));
    if (nextState) {
      setIsExpanded(false);
    }
  };

  // Toggle sound effects
  const toggleSound = () => {
    setIsMuted(!isMuted);
    triggerHaptic(10);
    track({
      category: 'MobileElevator',
      action: isMuted ? 'SoundEnabled' : 'SoundDisabled',
      label: `From section: ${currentSection}`
    });
  };
  
  // Toggle expanded view
  const toggleExpanded = () => {
    if (!isTransitioning) { // Prevent toggling during transition
      setIsExpanded(!isExpanded);
      setIsHighlighted(false); // Turn off highlight when user interacts with widget
      triggerHaptic(10);
      track({
        category: 'MobileElevator',
        action: isExpanded ? 'Collapsed' : 'Expanded',
        label: `From section: ${currentSection}`
      });
    }
  };

  // Get transition status message
  const getTransitionStatusMessage = () => {
    switch (transitionStatus) {
      case 'preparing': return t('elevator.mobile.preparing', 'PREPARING');
      case 'scrolling': return t('elevator.mobile.travelling', 'TRAVELLING');
      case 'arriving': return t('elevator.mobile.arriving', 'ARRIVING');
      default: return t('elevator.mobile.stopped', 'STOPPED');
    }
  };
  
  useEffect(() => {
    if (isExpanded) widgetRef.current?.querySelector<HTMLButtonElement>("[data-mobile-close]")?.focus();
  }, [isExpanded]);

  const isLight = theme === "light";
  const nextFloor = floors[floors.indexOf(currentSection) + 1];
  const destination = (nextFloor || floors[0]) as SectionKey;
  
  return (
    <>
      {/* Status overlay during transitions */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[98] pointer-events-none"
          >
            <div className={`mx-auto mt-4 max-w-xs text-center p-2 rounded-lg ${isLight ? 'bg-white/90' : 'bg-black/90'} shadow-lg backdrop-blur-sm`}>
              <div className={`text-xs font-mono font-semibold ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
                {getTransitionStatusMessage()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    
      {/* Elevator doors overlay */}
      <AnimatePresence>
        {showDoors && (
          <div className="fixed inset-0 z-[99] pointer-events-none flex items-center justify-center overflow-hidden">
            <div className="w-full h-full flex relative">
              {/* Left door */}
              <motion.div 
                key="mobile-left-door"
                className={`w-1/2 h-full mobile-elevator-door mobile-elevator-door--left ${isLight ? 'bg-gray-200' : 'bg-gray-800'} border-r ${isLight ? 'border-gray-300' : 'border-gray-600'}`}
                initial={{ x: "-100%" }}
                animate={{ x: doorsState === 'open' || doorsState === 'opening' ? "-100%" : "0%" }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="h-full flex items-center justify-end pr-1">
                  <div className={`h-[80%] w-2 rounded-l ${isLight ? 'bg-gray-300' : 'bg-gray-700'}`}></div>
                </div>
              </motion.div>
              
              {/* Right door */}
              <motion.div 
                key="mobile-right-door"
                className={`w-1/2 h-full mobile-elevator-door mobile-elevator-door--right ${isLight ? 'bg-gray-200' : 'bg-gray-800'} border-l ${isLight ? 'border-gray-300' : 'border-gray-600'}`}
                initial={{ x: "100%" }}
                animate={{ x: doorsState === 'open' || doorsState === 'opening' ? "100%" : "0%" }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="h-full flex items-center justify-start pl-1">
                  <div className={`h-[80%] w-2 rounded-r ${isLight ? 'bg-gray-300' : 'bg-gray-700'}`}></div>
                </div>
              </motion.div>
            </div>

            {/* Floor indicator */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ 
                opacity: doorsState === 'closed' || doorsState === 'closing' ? 1 : 0,
                scale: doorsState === 'closed' || doorsState === 'closing' ? 1 : 0.95
              }}
              transition={{ duration: 0.35 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none"
            >
              <div className={`text-center p-4 rounded-xl ${isLight ? 'bg-white/95 text-gray-900 border border-gray-200/80 shadow-2xl' : 'bg-gray-950/95 text-white border border-gray-800 shadow-2xl'} backdrop-blur-md min-w-[200px]`}>
                <div className={`text-[11px] font-mono font-medium tracking-wide uppercase ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  {transitionStatus === 'arriving' 
                    ? t('elevator.mobile.arriving', 'ARRIVING AT FLOOR') 
                    : transitionStatus === 'preparing'
                      ? t('elevator.mobile.preparing', 'PREPARING') 
                      : t('elevator.mobile.movingToFloor', 'MOVING TO FLOOR')}
                </div>
                <div className={`text-4xl font-mono font-bold my-1 ${isLight ? 'text-blue-600' : 'text-blue-400'}`}
                  style={{ transition: isTransitioning ? 'none' : 'all 0.3s ease-in-out' }}>
                  {currentFloor}
                </div>
                {/* Altimeter indicator during movement */}
                <div className="mb-1">
                  <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border inline-block ${
                    isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                  }`}>
                    {targetSection ? getFloorAltitude(targetSection) : getFloorAltitude(currentSection)}
                  </span>
                </div>
                <div className={`text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}
                  style={{ transition: isTransitioning ? 'none' : 'all 0.3s ease-in-out' }}>
                  {isTransitioning 
                    ? transitionStatus === 'arriving' 
                      ? targetSection ? t(`navigation.${targetSection}`, targetSection.toUpperCase()) : ''
                      : t('elevator.mobile.passingThrough', 'PASSING THROUGH')
                    : t(`navigation.${currentSection}`, currentSection.toUpperCase())}
                </div>
                {isTransitioning && (
                  <div className="flex justify-center mt-2 gap-1.5">
                    <span className="h-2 w-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-2 w-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-2 w-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main elevator widget */}
      <div 
        ref={widgetRef}
        className={`mobile-elevator ${isFooterVisible ? "mobile-elevator--footer" : ""} ${isReading && !isExpanded && !isTransitioning ? "mobile-elevator--reading" : ""} ${isExpanded ? "mobile-elevator--expanded" : ""} ${isLight ? "bg-white text-gray-900" : "bg-gray-900 text-white"} ${isHighlighted ? "ring-2 ring-blue-500" : ""}`}
        onKeyDown={event => { if (event.key === "Escape") { setIsExpanded(false); requestAnimationFrame(() => widgetRef.current?.querySelector<HTMLButtonElement>("[data-mobile-floor-toggle]")?.focus()); } }}
      >
        {!isExpanded ? (
          <nav 
            className="mobile-elevator__bar" 
            aria-label={t('elevator.mobile.title')}
            onTouchStart={handleBarTouchStart}
            onTouchEnd={handleBarTouchEnd}
          >
            <button data-mobile-floor-toggle onClick={toggleExpanded}
              className="mobile-elevator__current" aria-expanded={false}
              aria-controls="mobile-floor-selector" disabled={isTransitioning}>
              <span className="mobile-elevator__number" aria-hidden="true">{currentFloor}</span>
              <span className="mobile-elevator__label">
                <span className="mobile-elevator__caption">{isTransitioning ? getTransitionStatusMessage() : t('elevator.mobile.viewFloors')}</span>
                <strong>{t(`navigation.${currentSection}`)}</strong>
              </span>
            </button>
            <button className="mobile-elevator__next" data-mobile-next
              disabled={isTransitioning}
              onClick={() => {
                triggerHaptic(15);
                handleFloorClick(destination);
              }}
              aria-label={t(nextFloor ? 'elevator.mobile.nextFloor' : 'elevator.mobile.backToLobby') + ': ' + t(`navigation.${destination}`)}>
              <span aria-hidden="true">{nextFloor ? '↑' : '↓'}</span>
              <span>{t(nextFloor ? 'elevator.mobile.nextFloor' : 'elevator.mobile.backToLobby')}</span>
            </button>
          </nav>
        ) : (
          <div 
            id="mobile-floor-selector" 
            className="p-4" 
            role="region" 
            aria-label={t("elevator.mobile.title")}
            onTouchStart={handleExpandedTouchStart}
            onTouchEnd={handleExpandedTouchEnd}
          >
            {/* Grabber handle bar for thumb drag down */}
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3 cursor-grab opacity-70" />

            {/* Expanded widget header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="2" width="16" height="20" rx="2" />
                  <line x1="12" y1="6" x2="12" y2="18" />
                  <path d="M8 10l4-4 4 4" />
                  <path d="M16 14l-4 4-4-4" />
                </svg>
                <h3 className={`text-lg font-medium ${isLight ? 'text-gray-800' : 'text-white'}`}>
                  {isTransitioning ? getTransitionStatusMessage() : t("elevator.mobile.title")}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                {/* City view toggle button */}
                <button 
                  onClick={toggleCityView}
                  className={`p-2 rounded-full transition-colors ${
                    isCityView 
                      ? 'bg-blue-600 text-white' 
                      : isLight 
                        ? 'hover:bg-gray-100 text-gray-700' 
                        : 'hover:bg-gray-800 text-gray-300'
                  }`}
                  aria-label={isCityView ? t("elevator.mobile.exitCityView", "Cerrar vista ciudad") : t("elevator.mobile.viewCity", "Ver ciudad")}
                  title={isCityView ? t("elevator.mobile.exitCityView", "Cerrar vista ciudad") : t("elevator.mobile.viewCity", "Ver ciudad")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
                {/* Sound toggle button */}
                <button 
                  onClick={toggleSound}
                  className={`p-2 rounded-full ${isLight ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}
                  aria-label={t(isMuted ? "elevator.mobile.enableSound" : "elevator.mobile.disableSound")}
                >
                  {isMuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071a1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.414 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243a1 1 0 01-1.414-1.414A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                {/* Close button */}
                <button 
                  onClick={toggleExpanded}
                  className={`p-2 rounded-full ${isLight ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}
                  aria-label={t("elevator.mobile.closeNavigation")}
                  data-mobile-close
                  disabled={isTransitioning}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Elevator display */}
            <div className={`mb-4 p-3 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-black'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <div className={`text-xs font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{t("elevator.mobile.currentFloor")}</div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-mono font-bold ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
                      {currentFloor}
                    </span>
                    <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                    }`}>
                      {getFloorAltitude(currentSection)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className={`text-right text-xs font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{t("elevator.mobile.status")}</div>
                  <div className={`font-mono ${isTransitioning ? 'text-amber-500' : isLight ? 'text-green-600' : 'text-green-500'}`}>
                    {isTransitioning ? (
                      <span className="inline-flex items-center">
                        {getTransitionStatusMessage()}
                        <span className="ml-1 flex space-x-1">
                          <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </span>
                      </span>
                    ) : (
                      <>{t("elevator.mobile.stopped")}</>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className={`text-xs font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{t("elevator.mobile.location")}</div>
                <div className={`font-medium ${isLight ? 'text-gray-800' : 'text-gray-100'}`}>
                  {t(`elevator.floors.${currentSection}.description`, currentSection.toUpperCase())}
                </div>
              </div>
            </div>
            
            {/* Elevator buttons */}
            <div className="grid grid-cols-2 gap-2">
              {floors.map((floor) => {
                // Calculate floor number from the floorMap in the shared hook
                const floorNum = getCurrentFloorNumber(floor);
                const isCurrentFloor = floor === currentSection;
                const isTargetFloor = targetSection === floor;
                
                return (
                  <button
                    key={floor}
                    onClick={() => {
                      triggerHaptic(15);
                      setIsExpanded(false);
                      handleFloorClick(floor as SectionKey);
                    }}
                    data-mobile-floor={floor}
                    aria-current={isCurrentFloor ? "location" : undefined}
                    disabled={(isCurrentFloor && !isTransitioning) || isTransitioning}
                    className={`
                      min-h-16 p-2 rounded-lg flex flex-col items-center justify-center
                      transition-all duration-200 relative
                      ${isCurrentFloor 
                        ? `${isLight ? 'bg-blue-100 text-blue-800' : 'bg-blue-900 text-blue-200'} ring-2 ${isLight ? 'ring-blue-500' : 'ring-blue-500'}` 
                        : isTargetFloor && isTransitioning
                          ? `${isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-900 text-amber-200'} ring-2 ${isLight ? 'ring-amber-500' : 'ring-amber-500'}`
                          : `${isLight ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`
                      }
                      ${isTransitioning && !isTargetFloor && 'opacity-60 cursor-not-allowed'}
                      ${isTransitioning && isTargetFloor && 'elevator-target-floor-pulse'}
                    `}
                    title={t(`navigation.${floor}`)}
                  >
                    <span className={`text-lg font-mono font-bold 
                      ${isCurrentFloor ? (isLight ? 'text-blue-800' : 'text-blue-300') : 
                        isTargetFloor && isTransitioning ? (isLight ? 'text-amber-800' : 'text-amber-300') : ''}
                    `}>
                      {floorNum}
                    </span>
                    <span className="text-[10px] uppercase leading-tight font-medium">{t(`navigation.${floor}`)}</span>
                    <span className="text-[9px] font-mono opacity-65 leading-tight">{getFloorAltitude(floor)}</span>
                    
                    {/* Show current floor indicator */}
                    {isCurrentFloor && !isTransitioning && (
                      <span className="absolute inset-0 border-2 rounded-lg animate-pulse opacity-60" 
                        style={{
                          borderColor: isLight ? 'rgb(59 130 246)' : 'rgb(96 165 250)',
                          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }}
                      ></span>
                    )}
                    
                    {/* Show target floor indicator */}
                    {isTargetFloor && isTransitioning && (
                      <span className="absolute inset-0 border-2 rounded-lg animate-pulse opacity-80" 
                        style={{
                          borderColor: isLight ? 'rgb(245 158 11)' : 'rgb(252 211 77)',
                          animation: 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }}
                      ></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileElevatorWidget;
