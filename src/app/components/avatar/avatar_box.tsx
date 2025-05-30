import React, { memo } from 'react'; 
import { Canvas, extend } from '@react-three/fiber'; 
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useElevatorSound } from './hooks/useElevatorSound';
import { useElevatorNavigation } from '../../hooks/useElevatorNavigation';
import ElevatorDoors from './components/ElevatorDoors';
import ElevatorCabin from './components/ElevatorCabin';
import LoadingIndicator from './components/LoadingIndicator';
import { Mesh, BoxGeometry, MeshStandardMaterial, Fog, AmbientLight, DirectionalLight } from 'three';
import { track } from '../../utils/umami-analytics';
import { useTranslation } from 'react-i18next';
import { SectionKey } from './types';

import ElevatorControls from './components/ElevatorControls';
import WelcomeOverlay from './components/WelcomeOverlay';
import ElevatorButtons from './components/ElevatorButtons';
import './window-frame.css';

extend({ Mesh, BoxGeometry, MeshStandardMaterial, Fog, AmbientLight, DirectionalLight });

 
interface ElevatorProps { 
    currentSection: SectionKey;
    sections: string[];
    theme: "dark" | "light";
    onTransitionChange?: (isTransitioning: boolean) => void;
    isButtonTriggered?: boolean;
}

const AvatarBox: React.FC<ElevatorProps> = ({  
    currentSection, 
    sections,
    theme, 
    onTransitionChange,
    isButtonTriggered = false
}) => { 
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [showOverlay, setShowOverlay] = useState(currentSection === 'hero');
    const cameraRef = useRef({ y: 25 });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const elevatorContainerRef = useRef<HTMLDivElement>(null);
    const [elevatorVibration, setElevatorVibration] = useState(0);
    
    // Use the shared elevator navigation hook
    const {
      isTransitioning,
      currentFloor,
      doorsState,
      transitionStatus,
      targetSection,
      floorsInTransition,
      handleFloorClick, 
    } = useElevatorNavigation({
      currentSection, 
      onTransitionChange,
      isButtonTriggered
    });

    // Función para obtener el número de piso
    const getFloorNumber = useCallback((section: string): number => {
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
      return floorMap[section] || 0;
    }, []);

    // Use the elevator sound hook
    const { isMuted, toggleMute } = useElevatorSound(isTransitioning);

    // Generate floor descriptions based on the current section
    const [floorDescription, setFloorDescription] = useState("");

    // Theme-based colors
    const colors = useMemo(() => ({
      background: theme === "dark" ? 'linear-gradient(to bottom, #0f172a, #1e293b)' : 'linear-gradient(to bottom, #e0f2fe, #f1f5f9)',
      fogColor: theme === "dark" ? '#1e293b' : '#e0f2fe',
    }), [theme]);

    // Floor configuration with positions and descriptions
    const floors = useMemo(() => {
      const floorHeight = 10;
      const baseHeight = 28;
      
      const floorsConfig: Record<SectionKey, { 
        y: number; 
        floor: number; 
        description: string; 
        pitchLine: string; 
      }> = {
          'hero': { 
            y: baseHeight, 
            floor: 6, 
            description: t('elevator.floors.hero.description'),
            pitchLine: t('elevator.floors.hero.pitchLine')
          },
          'about': { 
            y: baseHeight - floorHeight, 
            floor: 5, 
            description: t('elevator.floors.about.description'), 
            pitchLine: t('elevator.floors.about.pitchLine')
          },
          'experience': { 
            y: baseHeight - (floorHeight * 2), 
            floor: 4, 
            description: t('elevator.floors.experience.description'), 
            pitchLine: t('elevator.floors.experience.pitchLine')
          },
          'projects': { 
            y: baseHeight - (floorHeight * 3), 
            floor: 3, 
            description: t('elevator.floors.projects.description'), 
            pitchLine: t('elevator.floors.projects.pitchLine')
          },
          'talks': { 
            y: baseHeight - (floorHeight * 4), 
            floor: 2, 
            description: t('elevator.floors.talks.description'), 
            pitchLine: t('elevator.floors.talks.pitchLine')
          },
          'news': { 
            y: baseHeight - (floorHeight * 5), 
            floor: 1, 
            description: t('elevator.floors.news.description'), 
            pitchLine: t('elevator.floors.news.pitchLine')
          },
          'awards': { 
            y: baseHeight - (floorHeight * 6), 
            floor: 0, 
            description: t('elevator.floors.awards.description'), 
            pitchLine: t('elevator.floors.awards.pitchLine')
          },
          'education': { 
            y: baseHeight - (floorHeight * 7), 
            floor: -1, 
            description: t('elevator.floors.education.description'), 
            pitchLine: t('elevator.floors.education.pitchLine')
          },
          'contact': { 
            y: baseHeight - (floorHeight * 8), 
            floor: -2, 
            description: t('elevator.floors.contact.description'), 
            pitchLine: t('elevator.floors.contact.pitchLine')
          },
      };
      return floorsConfig;
    }, [t]);

    // Update floor description whenever current section changes
    useEffect(() => {
      setFloorDescription(floors[currentSection].description);
    }, [currentSection, floors]);

    // Handle model loading
    const handleModelLoaded = useCallback(() => {
      setLoading(false);
    }, []);
    
    // Apply vibration effect to elevator container during transitions
    useEffect(() => {
      if (!elevatorContainerRef.current) return;
      
      if (isTransitioning && elevatorVibration > 0) {
        // Apply dynamic vibration based on the intensity value
        const intensity = elevatorVibration * 1.2;
        const container = elevatorContainerRef.current;
        
        // Apply transform with small random offsets for vibration effect
        const applyVibration = () => {
          if (!container) return;
          const randomX = (Math.random() - 0.5) * intensity;
          const randomY = (Math.random() - 0.5) * intensity;
          container.style.transform = `translate(${randomX}px, ${randomY}px)`;
        };
        
        // Create rapid interval for vibration effect
        const vibrationInterval = setInterval(applyVibration, 50);
        
        // Add elevator-moving class for additional CSS effects
        const elevatorElement = document.querySelector('.window-frame');
        elevatorElement?.classList.add('elevator-moving');
        
        // Clean up
        return () => {
          clearInterval(vibrationInterval);
          if (container) {
            container.style.transform = '';
          }
          elevatorElement?.classList.remove('elevator-moving');
        };
      } else {
        // Reset transform when vibration stops
        elevatorContainerRef.current.style.transform = '';
      }
    }, [elevatorVibration, isTransitioning]);

    // Listen for elevator movement events
    useEffect(() => {
      const handleElevatorMoving = () => {
        // Set vibration based on transition state
        if (isTransitioning) {
          setElevatorVibration(0.3);
        }
      };
      
      const handleElevatorArrived = () => {
        // Reduce vibration upon arrival
        setElevatorVibration(0.15);
        
        // Gradually stop vibration
        setTimeout(() => {
          setElevatorVibration(0);
        }, 500);
      };
      
      window.addEventListener('elevator-moving', handleElevatorMoving as EventListener);
      window.addEventListener('elevator-arrived', handleElevatorArrived);
      
      return () => {
        window.removeEventListener('elevator-moving', handleElevatorMoving as EventListener);
        window.removeEventListener('elevator-arrived', handleElevatorArrived);
      };
    }, [isTransitioning]);
    
    // Handle hero section and welcome overlay
    const handleStartTrip = useCallback(() => {
      // Track analytics for user interaction
      track({
        category: 'Elevator',
        action: 'StartJourney',
        label: 'From hero section'
      });

      // Hide overlay and navigate to about section
      setShowOverlay(false);
      handleFloorClick('about');
      
    }, [handleFloorClick]);

    // Handle overlay visibility based on current section
    useEffect(() => {
      // Mostrar overlay solo cuando estamos en la sección 'hero' y no estamos en transición
      setShowOverlay(currentSection === 'hero' && !isTransitioning);
    }, [currentSection, isTransitioning]);

    // Update camera position based on current section
    useEffect(() => {
      if (floors[currentSection]) {
        cameraRef.current.y = floors[currentSection].y;
      }
    }, [currentSection, floors]);

    // Crear un estado para forzar actualizaciones de las puertas
    const [doorForceUpdate, setDoorForceUpdate] = useState(0);

    // Simplificado: una única función de manejo de eventos para el elevador
    useEffect(() => {
        // Función para manejar todos los eventos del elevador
        const handleElevatorEvent = (e: Event) => {
            const eventType = e.type;
            
            // Registrar evento en consola
            console.log(`%c ELEVATOR EVENT: ${eventType}`, 'background:#3498db;color:white;padding:2px');
            
            // Actualizar forzadamente el componente de puertas
            setDoorForceUpdate(Date.now());
        };
        
        // Lista simplificada de eventos a escuchar
        const eventTypes = [
            'elevator-force-door-action',
            'elevator-doors-action'
        ];
        
        // Registrar escuchas para todos los eventos
        eventTypes.forEach(eventType => {
            window.addEventListener(eventType, handleElevatorEvent);
        });
        
        // Limpiar todas las escuchas
        return () => {
            eventTypes.forEach(eventType => {
                window.removeEventListener(eventType, handleElevatorEvent);
            });
        };
    }, []);
    
    // Actualizado: Seguimiento del estado de las puertas
    useEffect(() => {
        console.log(`%c AVATAR BOX: Door state = ${doorsState}, Transition = ${transitionStatus}`, 
            'background:#2c3e50;color:#3498db;padding:2px');
    }, [doorsState, transitionStatus]);

    return (
        <div className="relative">
            <div 
                className={`window-frame elevator-frame ${elevatorVibration > 0 ? 'vibrating' : ''}`} 
                ref={elevatorContainerRef}
                style={{
                    transition: elevatorVibration > 0 ? 'none' : 'transform 0.3s ease-out',
                    position: 'relative',
                    overflow: 'hidden',
                    borderTopRightRadius: 0,      // Esquina superior derecha plana
                    borderBottomRightRadius: 0    // Esquina inferior derecha plana
                }}
            >
                {loading && <LoadingIndicator theme={theme} />}
                
                {/* Make sure WelcomeOverlay comes BEFORE the ElevatorDoors in the DOM to ensure proper z-index stacking */}
                <WelcomeOverlay 
                    show={showOverlay} 
                    theme={theme} 
                    onStart={handleStartTrip}
                    handleFloorClick={handleFloorClick}
                />

                {/* Always render doors with transition state */}
                <ElevatorDoors 
                    key={`elevator-doors-${doorForceUpdate}`}
                    isOpen={doorsState === 'open' || doorsState === 'opening'} 
                    doorsState={doorsState} // Pasando el estado original de las puertas
                    theme={theme}
                    transitionStatus={transitionStatus}
                />

                <Canvas 
                    shadows
                    gl={{ antialias: true }}
                    camera={{ 
                        fov: 60,
                        position: [0, 1, 5.5],
                        near: 0.1,
                        far: 50
                    }} 
                    style={{ background: colors.background }}
                > 
                    <fog attach="fog" args={[colors.fogColor, 30, 70]} />
                    <ambientLight intensity={theme === "dark" ? 0.8 : 0.8} />
                    <directionalLight position={[0, 1, 2]} intensity={theme === "dark" ? 5.0 : 0.8} castShadow />
                    
                    <group position={[0, cameraRef.current.y - floors[currentSection].y, 0]}>
                        <ElevatorCabin 
                            currentSection={currentSection}
                            theme={theme}
                            floors={floors}
                            currentFloor={currentFloor}
                            floorDescription={floorDescription}
                            isTransitioning={isTransitioning}
                            onModelLoaded={handleModelLoaded}
                        />
                    </group>
                </Canvas>

                <ElevatorControls 
                    theme={theme}
                    currentFloor={currentFloor} 
                    floorDescription={floorDescription}
                    isMuted={isMuted} 
                    toggleMute={toggleMute}
                    isFullscreen={isFullscreen}
                    toggleFullscreen={() => {
                        if (elevatorContainerRef.current) {
                            if (!document.fullscreenElement) {
                                elevatorContainerRef.current.requestFullscreen();
                            } else {
                                document.exitFullscreen();
                            }
                            setIsFullscreen(!isFullscreen);
                        }
                    }}
                    enableAudio={() => {
                        // Function stub to satisfy interface
                    }}
                />
                
                {/* Botones del elevador integrados dentro del marco principal */}
                <ElevatorButtons 
                    sections={sections as SectionKey[]}
                    currentSection={currentSection}
                    isTransitioning={isTransitioning}
                    targetSection={targetSection ?? 'hero'}
                    floorsInTransition={floorsInTransition}
                    darkMode={theme === "dark"}
                    handleElevatorNavigation={handleFloorClick}
                    getFloorNumber={getFloorNumber}
                />
            </div>
            
            {/* Panel de botones del elevador - fuera del marco del elevador */}
            <ElevatorButtons 
                sections={sections as SectionKey[]}
                currentSection={currentSection}
                isTransitioning={isTransitioning}
                targetSection={targetSection ?? 'hero'}
                floorsInTransition={floorsInTransition}
                darkMode={theme === "dark"}
                handleElevatorNavigation={handleFloorClick}
                getFloorNumber={getFloorNumber}
            />
        </div>
    );
};

export default memo(AvatarBox);