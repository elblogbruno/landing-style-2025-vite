import React, { useState, useEffect, useRef } from 'react';
import { track } from '../../utils/umami-analytics';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionKey } from '../avatar/types';
 
interface MobileElevatorWidgetProps {
  currentSection: SectionKey;
  theme: "dark" | "light";
  floors: string[];
  data: {
    floors: {
      [key in SectionKey]: {
        description: string;
        pitchLine: string;
      }
    }
  };
  onFloorSelect: (floor: string) => void;
  highlightOnMount?: boolean;
  onTransitionChange?: (isTransitioning: boolean) => void;
  isButtonTriggered?: boolean;
}

const MobileElevatorWidget: React.FC<MobileElevatorWidgetProps> = ({
  currentSection,
  theme,
  floors,
  data,
  onFloorSelect,
  highlightOnMount = false 
}) => {
  // Definir floorMap a nivel de componente para que esté disponible en todo el código
  const floorMap: Record<string, number> = {
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

  const [isExpanded, setIsExpanded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentFloor, setCurrentFloor] = useState(getCurrentFloorNumber());
  const [dingSound, setDingSound] = useState<HTMLAudioElement | null>(null);
  const [movingSound, setMovingSound] = useState<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isHighlighted, setIsHighlighted] = useState(highlightOnMount);
  const [showDoors, setShowDoors] = useState(false);
  const [doorsState, setDoorsState] = useState<'closed' | 'opening' | 'closing' | 'open'>('open');
  const widgetRef = useRef<HTMLDivElement>(null);
  
  // Get current floor number based on section
  function getCurrentFloorNumber(): number {
    return floorMap[currentSection] || 0;
  }
  
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
  
  // Handle floor changes
  useEffect(() => {
    const newFloor = getCurrentFloorNumber();
    if (currentFloor !== newFloor && isExpanded) {
      setIsTransitioning(true);
      
      // Play elevator moving sound
      if (!isMuted && movingSound) {
        movingSound.play().catch(err => console.error('Error playing elevator sound:', err));
      }
      
      // Simulate elevator movement time
      const timeout = setTimeout(() => {
        setCurrentFloor(newFloor);
        setIsTransitioning(false);
        
        // Stop moving sound and play ding
        if (!isMuted) {
          if (movingSound) movingSound.pause();
          if (dingSound) dingSound.play().catch(err => console.error('Error playing elevator ding:', err));
        }
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [currentSection, isExpanded, isMuted, dingSound, movingSound, getCurrentFloorNumber, currentFloor]);
  
  // Handle section change with door animation and synchronized scroll
  const handleFloorClick = (floor: string) => {
    if (floor === currentSection || isTransitioning) return;
    
    // Solo registramos la interacción explícita del usuario con el elevador móvil
    track({
      category: 'MobileElevator',
      action: 'FloorSelected',
      label: floor
    });

    // Iniciar transición y cerrar puertas
    setShowDoors(true);
    setDoorsState('closing');
    setIsTransitioning(true);
    
    // Minimizar widget durante transición
    setIsExpanded(false);
    
    // Reproducir sonido de elevador en movimiento
    if (!isMuted && movingSound) {
      movingSound.play().catch(err => console.error('Error playing elevator sound:', err));
    }

    // Tiempo de cierre de puertas
    const doorCloseTime = 800;
    
    // Esperar a que las puertas se cierren completamente
    setTimeout(() => {
      setDoorsState('closed');
      
      // Determinar duración del movimiento según distancia
      const currentFloorIndex = floors.indexOf(currentSection);
      const targetFloorIndex = floors.indexOf(floor);
      const floorDistance = Math.abs(targetFloorIndex - currentFloorIndex);
      const moveDuration = Math.min(2000 + (floorDistance * 500), 3500);
      
      // Obtener elemento destino y calcular posición
      const targetElement = document.getElementById(floor);
      if (targetElement) {
        const offsetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 70;
        
        // Bloquear scroll durante la transición
        document.body.style.overflow = 'hidden';
        
        // Animar el scroll simultáneamente con el movimiento del elevador
        const startPosition = window.pageYOffset;
        const distance = offsetPosition - startPosition;
        const startTime = performance.now();
        
        // Calcular alturas de sección para determinar cambios de piso
        const sectionHeights: {section: string, top: number, bottom: number, floorNum: number}[] = [];
        floors.forEach(sectionId => {
          const sectionElement = document.getElementById(sectionId);
          if (sectionElement) {
            const sectionRect = sectionElement.getBoundingClientRect();
            sectionHeights.push({
              section: sectionId,
              top: sectionElement.offsetTop - 100, // Offset para detectar cambio un poco antes
              bottom: sectionElement.offsetTop + sectionRect.height,
              floorNum: floorMap[sectionId] || 0
            });
          }
        });
        
        // Ordenar por posición vertical
        sectionHeights.sort((a, b) => a.top - b.top);
        
        // Target floor number
        const targetFloorNum = floorMap[floor] || 0;
        const currentFloorNum = floorMap[currentSection] || 0;
        
        const animateScroll = (currentTime: number) => {
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / moveDuration, 1);
          
          // Easing para simular movimiento de elevador
          let easedProgress;
          if (progress < 0.2) {
            // Aceleración inicial
            easedProgress = (progress / 0.2) * (progress / 0.2) * 0.2;
          } else if (progress > 0.8) {
            // Desaceleración final
            const decelProgress = (1 - progress) / 0.2;
            easedProgress = 0.8 + (1 - (decelProgress * decelProgress)) * 0.2;
          } else {
            // Velocidad constante en medio
            easedProgress = 0.2 + (progress - 0.2) * (0.6 / 0.6);
          }
          
          // Calcular posición actual
          const currentPosition = startPosition + distance * easedProgress;
          window.scrollTo(0, currentPosition);
          
          // Determinar piso actual basado en la posición de scroll
          let displayFloor = currentFloorNum;
          
          // Si nos movemos hacia arriba (floor num aumenta)
          if (targetFloorNum > currentFloorNum) {
            // Encontrar el piso correspondiente a la posición actual
            for (let i = 0; i < sectionHeights.length; i++) {
              if (currentPosition >= sectionHeights[i].top && 
                  (i === sectionHeights.length - 1 || currentPosition < sectionHeights[i + 1].top)) {
                displayFloor = sectionHeights[i].floorNum;
                break;
              }
            }
          } 
          // Si nos movemos hacia abajo (floor num disminuye)
          else {
            // Recorrer pisos en orden inverso
            for (let i = sectionHeights.length - 1; i >= 0; i--) {
              if (currentPosition <= sectionHeights[i].bottom && 
                  (i === 0 || currentPosition > sectionHeights[i - 1].bottom)) {
                displayFloor = sectionHeights[i].floorNum;
                break;
              }
            }
          }
          
          // Actualizar piso actual para visualización
          setCurrentFloor(displayFloor);
          
          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          } else {
            // Al finalizar el scroll y el movimiento
            // Restaurar scroll normal
            document.body.style.overflow = '';
            
            // Detener sonido de movimiento y reproducir ding
            if (!isMuted) {
              if (movingSound) movingSound.pause();
              if (dingSound) dingSound.play().catch(err => console.error('Error playing elevator ding:', err));
            }
            
            // Abrir puertas en destino
            setDoorsState('opening');
            
            // Esperar a que se abran las puertas
            setTimeout(() => {
              setDoorsState('open');
              setShowDoors(false);
              setIsTransitioning(false);
              setIsExpanded(true);
            }, 800);
          }
        };
        
        // Iniciar la animación de scroll simultáneamente con el movimiento del elevador
        requestAnimationFrame(animateScroll);
      } else {
        // Si no se encuentra el elemento, usar método alternativo
        onFloorSelect(floor);
        
        // Simular el cambio de pisos durante la animación
        const targetFloorNum = floorMap[floor] || 0;
        const currentFloorNum = floorMap[currentSection] || 0;
        const isAscending = targetFloorNum > currentFloorNum;
        const floorsToPass = Math.abs(targetFloorNum - currentFloorNum);
        
        // Si hay pisos para pasar, hacer una animación de cambio de piso
        if (floorsToPass > 0) {
          let passedFloors = 0;
          const floorChangeInterval = Math.min(moveDuration / (floorsToPass + 1), 800);
          
          const floorChangeTimer = setInterval(() => {
            passedFloors++;
            if (passedFloors <= floorsToPass) {
              // Calcular el piso actual basado en la dirección
              const newFloor = isAscending 
                ? currentFloorNum + passedFloors
                : currentFloorNum - passedFloors;
              setCurrentFloor(newFloor);
            }
            
            if (passedFloors >= floorsToPass) {
              clearInterval(floorChangeTimer);
            }
          }, floorChangeInterval);
        }
        
        // Limpiar después de un tiempo equivalente al movimiento
        setTimeout(() => {
          if (!isMuted) {
            if (movingSound) movingSound.pause();
            if (dingSound) dingSound.play().catch(err => console.error('Error playing elevator ding:', err));
          }
          
          setDoorsState('opening');
          setTimeout(() => {
            setDoorsState('open');
            setShowDoors(false);
            setIsTransitioning(false);
            setIsExpanded(true);
            document.body.style.overflow = '';
          }, 800);
        }, moveDuration);
      }
    }, doorCloseTime);
  };

  // Toggle sound effects
  const toggleSound = () => {
    setIsMuted(!isMuted);
    
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
      
      track({
        category: 'MobileElevator',
        action: isExpanded ? 'Collapsed' : 'Expanded',
        label: `From section: ${currentSection}`
      });
    }
  };
  
  const isLight = theme === "light";
  
  return (
    <>
      {/* Elevator doors overlay */}
      <AnimatePresence>
        {showDoors && (
          <div className="fixed inset-0 z-[99] pointer-events-none flex items-center justify-center">
            <div className="w-full h-full flex">
              {/* Left door */}
              <motion.div 
                className={`w-1/2 h-full ${isLight ? 'bg-gray-200' : 'bg-gray-800'} border-r ${isLight ? 'border-gray-300' : 'border-gray-600'}`}
                initial={{ x: doorsState === 'opening' ? "0%" : "-50%" }}
                animate={{ 
                  x: doorsState === 'closing' || doorsState === 'closed' ? "0%" : "-50%" 
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <div className="h-full flex items-center justify-end pr-1">
                  <div className={`h-[80%] w-2 rounded-l ${isLight ? 'bg-gray-300' : 'bg-gray-700'}`}></div>
                </div>
              </motion.div>
              
              {/* Right door */}
              <motion.div 
                className={`w-1/2 h-full ${isLight ? 'bg-gray-200' : 'bg-gray-800'} border-l ${isLight ? 'border-gray-300' : 'border-gray-600'}`}
                initial={{ x: doorsState === 'opening' ? "0%" : "50%" }}
                animate={{ 
                  x: doorsState === 'closing' || doorsState === 'closed' ? "0%" : "50%" 
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <div className="h-full flex items-center justify-start pl-1">
                  <div className={`h-[80%] w-2 rounded-r ${isLight ? 'bg-gray-300' : 'bg-gray-700'}`}></div>
                </div>
              </motion.div>
            </div>

            {/* Floor indicator */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none">
              <div className={`text-center p-3 rounded-lg ${isLight ? 'bg-white' : 'bg-black'} shadow-lg`}>
                <div className={`text-xs font-mono ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  {isTransitioning ? 'MOVING TO FLOOR' : 'CURRENT FLOOR'}
                </div>
                <div className={`text-4xl font-mono font-bold ${isLight ? 'text-blue-600' : 'text-blue-400'}`}
                  style={{ transition: isTransitioning ? 'none' : 'all 0.3s ease-in-out' }}>
                  {currentFloor >= 0 ? currentFloor : `-${Math.abs(currentFloor)}`}
                  <span className={`text-lg ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                    {currentFloor >= 0 ? 'F' : 'B'}
                  </span>
                </div>
                <div className={`text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}
                  style={{ transition: isTransitioning ? 'none' : 'all 0.3s ease-in-out' }}>
                  {isTransitioning 
                    ? "PASSING THROUGH" 
                    : currentSection.toUpperCase()}
                </div>
                {isTransitioning && (
                  <div className="flex justify-center mt-1 gap-1">
                    <span className="h-2 w-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-2 w-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-2 w-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Main elevator widget */}
      <div 
        ref={widgetRef}
        className={`fixed ${isExpanded ? 'bottom-4 left-4 right-4' : 'bottom-20 right-4 w-16 h-16'} 
          z-50 transition-all duration-300 ease-in-out
          ${isLight ? 'bg-white' : 'bg-gray-900'} 
          rounded-xl
          shadow-lg border ${isLight ? 'border-gray-200' : 'border-gray-700'}
          ${isHighlighted ? 'animate-bounce shadow-2xl ring-4 ring-blue-500 ring-opacity-60' : ''}`}
        style={{
          borderRadius: isExpanded ? '0.75rem' : '9999px',
          transition: 'border-radius 300ms ease-in-out, width 300ms ease-in-out, height 300ms ease-in-out, bottom 300ms ease-in-out, left 300ms ease-in-out, right 300ms ease-in-out'
        }}
      >
        {/* Collapsed state - just an elevator icon */}
        {!isExpanded ? (
          <button 
            onClick={toggleExpanded}
            className="w-full h-full flex items-center justify-center"
            aria-label="Open elevator navigation"
            disabled={isTransitioning}
          >
            <div className="relative w-10 h-10">
              {/* Elevator icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke={isLight ? "#1e293b" : "#e2e8f0"} strokeWidth="2">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="12" y1="6" x2="12" y2="18" />
                <path d="M8 10l4-4 4 4" />
                <path d="M16 14l-4 4-4-4" />
              </svg>
              {/* Current floor indicator */}
              <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs
                ${isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'}`}>
                {currentFloor >= 0 ? Math.abs(currentFloor) : `-${Math.abs(currentFloor)}`}
              </div>
              {/* Pulse effect to indicate current section */}
              <div className={`absolute inset-0 rounded-full ${isLight ? 'bg-blue-500' : 'bg-blue-600'} animate-ping opacity-20`}></div>
            </div>
          </button>
        ) : (
          <div className="p-4 h-full">
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
                  Elevator Pitch
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {/* Sound toggle button */}
                <button 
                  onClick={toggleSound}
                  className={`p-2 rounded-full ${isLight ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}
                  aria-label={isMuted ? "Enable sound" : "Disable sound"}
                >
                  {isMuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071a1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.414 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.758 4.243a1 1 0 01-1.414-1.414A3.984 3.984 0 0013 10a3.984 3.984 0 00-1.172-2.828a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                {/* Close button */}
                <button 
                  onClick={toggleExpanded}
                  className={`p-2 rounded-full ${isLight ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}
                  aria-label="Close elevator navigation"
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
                  <div className={`text-xs font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>CURRENT FLOOR</div>
                  <div className={`text-2xl font-mono font-bold ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
                    {currentFloor >= 0 ? currentFloor : `-${Math.abs(currentFloor)}`}
                    <span className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                      {currentFloor >= 0 ? 'F' : 'B'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className={`text-right text-xs font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>STATUS</div>
                  <div className={`font-mono ${isTransitioning ? 'text-amber-500' : isLight ? 'text-green-600' : 'text-green-500'}`}>
                    {isTransitioning ? (
                      <span className="inline-flex items-center">
                        MOVING
                        <span className="ml-1 flex space-x-1">
                          <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </span>
                      </span>
                    ) : (
                      <>STOPPED</>
                    )}
                  </div>
                </div>
              </div>

              {/* TV Display with your avatar face */}
              <div className="mt-4 relative">
                {/* TV Frame */}
                <div className={`rounded-lg overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-gray-800'} p-1`}>
                  {/* TV Screen */}
                  <div className={`relative overflow-hidden rounded ${isLight ? 'bg-blue-100' : 'bg-blue-900/30'} aspect-video flex items-center justify-center`}>
                    {/* Static/Scanlines Effect */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                      backgroundImage: `repeating-linear-gradient(0deg, ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'} 0px, transparent 1px, transparent 2px)`,
                      backgroundSize: '100% 3px',
                      animation: 'scanlines 0.5s linear infinite'
                    }}></div>

                    {/* Avatar image and content */}
                    <div className="flex items-center justify-center p-2 w-full">
                      {/* Avatar Face */}
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50 mr-3 flex-shrink-0">
                        <img 
                          src="/images-webp/hero/profile.webp" 
                          alt="Profile Avatar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Speech bubble with pitch line */}
                      <div className={`relative p-2 rounded-lg flex-grow ${isLight ? 'bg-white/80' : 'bg-gray-700/80'}`}>
                        {/* Speech bubble pointer */}
                        <div className={`absolute left-[-8px] top-1/2 transform -translate-y-1/2 w-0 h-0 
                          border-t-[8px] border-t-transparent 
                          border-r-[8px] ${isLight ? 'border-r-white/80' : 'border-r-gray-700/80'} 
                          border-b-[8px] border-b-transparent`}>
                        </div>

                        {/* Pitch line text */}
                        <p className={`text-xs italic ${isLight ? 'text-gray-600' : 'text-gray-200'}`}>
                          "{data.floors[currentSection]?.pitchLine || 'Welcome to my elevator pitch!'}"
                        </p>
                      </div>
                    </div>

                    {/* TV Reflection overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className={`text-xs font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>LOCATION</div>
                <div className={`font-medium ${isLight ? 'text-gray-800' : 'text-gray-100'}`}>
                  {data.floors[currentSection]?.description || currentSection.toUpperCase()}
                </div>
              </div>
            </div>
            
            {/* Elevator buttons */}
            <div className="grid grid-cols-4 gap-2">
              {floors.map((floor) => {
                // Calculate floor number
                const floorNum = floorMap[floor] || 0;
                const isCurrentFloor = floor === currentSection;
                
                return (
                  <button
                    key={floor}
                    onClick={() => handleFloorClick(floor)}
                    disabled={(isCurrentFloor && !isTransitioning) || isTransitioning}
                    className={`
                      aspect-square p-1 rounded-lg flex flex-col items-center justify-center
                      transition-all duration-200 relative
                      ${isCurrentFloor 
                        ? `${isLight ? 'bg-blue-100 text-blue-800' : 'bg-blue-900 text-blue-200'} ring-2 ${isLight ? 'ring-blue-500' : 'ring-blue-500'}` 
                        : `${isLight ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`
                      }
                      ${isTransitioning && 'opacity-60 cursor-not-allowed'}
                    `}
                    title={`Go to ${floor.charAt(0).toUpperCase() + floor.slice(1)}`}
                  >
                    <span className={`text-lg font-mono font-bold ${isCurrentFloor ? (isLight ? 'text-blue-800' : 'text-blue-300') : ''}`}>
                      {floorNum >= 0 ? floorNum : `-${Math.abs(floorNum)}`}
                    </span>
                    <span className="text-[10px] uppercase leading-tight">{floor}</span>
                    
                    {isCurrentFloor && (
                      <span className="absolute inset-0 border-2 rounded-lg animate-pulse opacity-60" 
                        style={{
                          borderColor: isLight ? 'rgb(59 130 246)' : 'rgb(96 165 250)',
                          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
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