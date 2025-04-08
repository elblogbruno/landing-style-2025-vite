import { Canvas, extend } from '@react-three/fiber'; 
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useElevatorSound } from './hooks/useElevatorSound';
import ElevatorDoors from './components/ElevatorDoors';
import ElevatorCabin from './components/ElevatorCabin';
import LoadingIndicator from './components/LoadingIndicator';
import { Mesh, BoxGeometry, MeshStandardMaterial, Fog, AmbientLight, DirectionalLight } from 'three';
import { track } from '../../utils/umami-analytics';

// import FloorMarkers from './components/FloorMarkers';


import ElevatorControls from './components/ElevatorControls';
import WelcomeOverlay from './components/WelcomeOverlay';

import './window-frame.css';  
import React, { memo } from 'react'; 
import { SectionKey } from './types';

extend({ Mesh, BoxGeometry, MeshStandardMaterial, Fog, AmbientLight, DirectionalLight });

 
// Utility function for animating scroll with elevator-like easing
const animateScroll = (
  targetElement: HTMLElement, 
  duration: number = 2000, 
  offset: number = -100,
  onComplete?: () => void
) => {
  const startPosition = window.pageYOffset;
  const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset + offset;
  const distance = targetPosition - startPosition;
  const startTime = performance.now();
  
  const animation = (currentTime: number) => {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    
    // Elevator-like easing function
    let easedProgress;
    if (progress < 0.2) {
      // Initial acceleration
      easedProgress = (progress / 0.2) * (progress / 0.2) * 0.2;
    } else if (progress > 0.8) {
      // Final deceleration
      const decelProgress = (1 - progress) / 0.2;
      easedProgress = 0.8 + (1 - (decelProgress * decelProgress)) * 0.2;
    } else {
      // Constant speed in the middle
      easedProgress = 0.2 + (progress - 0.2) * (0.6 / 0.6);
    }
    
    window.scrollTo(0, startPosition + distance * easedProgress);
    
    if (progress < 1) {
      requestAnimationFrame(animation);
    } else if (onComplete) {
      onComplete();
    }
  };
  
  requestAnimationFrame(animation);
};

interface ElevatorProps {
    data: {
        overlay: {
            title: string;
            subtitle: string;
            resumeUrl: string;
            buttons: {
                text: string;
                url: string;
                type: string;
                external?: boolean;
            }[];
        };
        floors: {
            [key in SectionKey]: {
                description: string;
                pitchLine: string;
            }
        };
    };
    currentSection: SectionKey;
    theme: "dark" | "light";
    onTransitionChange?: (isTransitioning: boolean) => void;
    isButtonTriggered?: boolean; // Nueva prop para distinguir navegación por botón vs scroll
}

const AvatarBox: React.FC<ElevatorProps> = ({ 
    data, 
    currentSection, 
    theme, 
    onTransitionChange,
    isButtonTriggered = false // Por defecto asumimos que es navegación por scroll
}) => { 
    const [loading, setLoading] = useState(true);
    const currentSectionRef = useRef(currentSection);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [currentFloor, setCurrentFloor] = useState(6);
    const cameraRef = useRef({ y: 25 });
    const [floorDescription, setFloorDescription] = useState("");
    const [showOverlay, setShowOverlay] = useState(currentSection === 'hero');
    const [doorsOpen, setDoorsOpen] = useState(false); 
    const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const doorsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isScrollingRef = useRef(false);
    const pendingSectionRef = useRef<SectionKey | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const elevatorContainerRef = useRef<HTMLDivElement>(null); 
    const animationFrameRef = useRef<number | null>(null);
    const [elevatorVibration, setElevatorVibration] = useState(0);
    // Removing unused state variables
    const [animationType, setAnimationType] = useState<'full' | 'scroll'>('scroll');
    const lastButtonTriggerRef = useRef(false);
    const doorTransitionInProgressRef = useRef(false); // Track if doors are currently animating

    // Modificado para solo reproducir sonidos cuando se usa navegación por botones
    const { isMuted, toggleMute } = useElevatorSound(isTransitioning && animationType === 'full');

    // Colores basados en el tema
    const colors = useMemo(() => ({
      background: theme === "dark" ? 'linear-gradient(to bottom, #0f172a, #1e293b)' : 'linear-gradient(to bottom, #e0f2fe, #f1f5f9)',
      fogColor: theme === "dark" ? '#1e293b' : '#e0f2fe',
    }), [theme]);

    

    const handleStartTrip = useCallback(() => {
        // Solo registramos eventos importantes iniciados por el usuario
        track({
            category: 'Elevator',
            action: 'StartJourney',
            label: 'From hero section'
        });

        // Ensure doors close first with a clear visual transition
        // Only update the force update counter if no door transition is in progress
        if (!doorTransitionInProgressRef.current) {
            doorTransitionInProgressRef.current = true;
            setDoorsOpen(false);
            
            // Reset transition flag after animation completes
            setTimeout(() => {
                doorTransitionInProgressRef.current = false;
            }, 1700); // Just slightly longer than door animation
        }
        
        // Wait for doors to fully close before scrolling
        setTimeout(() => {
            setShowOverlay(false);
            currentSectionRef.current = 'about';
            
            // Get the target section element
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                // Use our custom animation function instead of scrollIntoView
                animateScroll(aboutSection, 2000, -100, () => {
                    // After animation completes, make sure the elevator has moved to the right position
                    if (currentSectionRef.current !== 'about') {
                        moveElevatorToSection('about');
                    }
                });
            }
        }, 1500); // Increased timeout to ensure doors fully close before scrolling
    }, []);

    useEffect(() => {
        if (currentSection === 'hero') {
            setShowOverlay(true);
            setDoorsOpen(false);
        } else {
            setDoorsOpen(true);
            setShowOverlay(false); 
        }
    }, [currentSection]);

    // Handle model loading
    const handleModelLoaded = useCallback(() => {
        setLoading(false);
        
        // Eliminamos el tracking de la carga del modelo ya que no es una interacción directa del usuario
    }, []);

    // Configuración de pisos y posiciones con pitch lines
    const floors = useMemo(() => {
      // Definir una altura constante entre pisos (6 unidades)
      const floorHeight = 10;
      // Altura base para el piso más alto (piso 6)
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
            description: data.floors.hero.description,
            pitchLine: data.floors.hero.pitchLine
          },
          'about': { 
            y: baseHeight - floorHeight, 
            floor: 5, 
            description: data.floors.about.description, 
            pitchLine: data.floors.about.pitchLine
          },
          'experience': { 
            y: baseHeight - (floorHeight * 2), 
            floor: 4, 
            description: data.floors.experience.description, 
            pitchLine: data.floors.experience.pitchLine
          },
          'projects': { 
            y: baseHeight - (floorHeight * 3), 
            floor: 3, 
            description: data.floors.projects.description, 
            pitchLine: data.floors.projects.pitchLine
          },
          'talks': { 
            y: baseHeight - (floorHeight * 4), 
            floor: 2, 
            description: data.floors.talks.description, 
            pitchLine: data.floors.talks.pitchLine
          },
          'news': { 
            y: baseHeight - (floorHeight * 5), 
            floor: 1, 
            description: data.floors.news.description, 
            pitchLine: data.floors.news.pitchLine
          },
          'awards': { 
            y: baseHeight - (floorHeight * 6), 
            floor: 0, 
            description: data.floors.awards.description, 
            pitchLine: data.floors.awards.pitchLine
          },
          'education': { 
            y: baseHeight - (floorHeight * 7), 
            floor: -1, 
            description: data.floors.education.description, 
            pitchLine: data.floors.education.pitchLine
          },
          'contact': { 
            y: baseHeight - (floorHeight * 8), 
            floor: -2, 
            description: data.floors.contact.description, 
            pitchLine: data.floors.contact.pitchLine
          },
      };
      return floorsConfig;
    }, [data.floors]);

    // Iniciar el movimiento del elevador al montar el componente
    useEffect(() => {
        // Configurar estado inicial basado en currentSection
        const targetFloor = floors[currentSection].floor;
        const description = floors[currentSection].description;
        
        setCurrentFloor(targetFloor);
        setFloorDescription(description);
        
        // Inicializamos la posición de la cámara
        const targetY = floors[currentSection].y;
        cameraRef.current.y = targetY;

        // Eliminamos el tracking del montaje del componente ya que no es una interacción del usuario
    }, [currentSection, floors]);

    // Watch for section changes and move the elevator accordingly
    useEffect(() => {
        // Update the current section ref
        if (currentSectionRef.current !== currentSection) {
            // console.log('Section changed from', currentSectionRef.current, 'to', currentSection);
            currentSectionRef.current = currentSection;
            
            // Don't move the elevator if we're already in the target section
            if (!isTransitioning) {
                moveElevatorToSection(currentSection);
            } else {
                // Queue the section change if we're transitioning
                pendingSectionRef.current = currentSection;
            }
        }
    }, [currentSection]);

    // Función para bloquear el scroll de la página
    const blockScrolling = useCallback((block: boolean) => {
        if (block && animationType === 'full') {
            document.documentElement.style.scrollBehavior = 'auto';
            document.body.style.overflow = 'hidden';
            document.documentElement.classList.add('elevator-transitioning');
        } else if (!block) {
            document.body.style.overflow = '';
            document.documentElement.classList.remove('elevator-transitioning');
            // Restaurar el comportamiento de scroll suave después de un breve retraso
            setTimeout(() => {
                document.documentElement.style.scrollBehavior = 'smooth';
            }, 100);
        }
        
        // Notificar al componente padre sobre el cambio de estado si es una animación completa
        if (onTransitionChange && animationType === 'full') {
            onTransitionChange(block);
        }
    }, [onTransitionChange, animationType]);

    // Detectar cambios en el tipo de navegación
    useEffect(() => {
        // console.log('isButtonTriggered:', isButtonTriggered);
        // Si cambia el modo de navegación (botón vs scroll), actualizar el tipo de animación
        if (isButtonTriggered !== lastButtonTriggerRef.current) {
            lastButtonTriggerRef.current = isButtonTriggered;
            // console.log('Animation type changed:', isButtonTriggered ? 'full' : 'scroll');
            setAnimationType(isButtonTriggered ? 'full' : 'scroll');
        }
    }, [isButtonTriggered]);

    // Apply vibration effect to elevator container
    useEffect(() => {
        if (!elevatorContainerRef.current) return;
        
        if (elevatorVibration > 0) {
            // Apply dynamic vibration based on the intensity value
            const intensity = elevatorVibration * 1.2; // Scale up for visual effect
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
            
            // Clean up
            return () => {
                clearInterval(vibrationInterval);
                if (container) {
                    container.style.transform = '';
                }
            };
        } else {
            // Reset transform when vibration stops
            elevatorContainerRef.current.style.transform = '';
        }
    }, [elevatorVibration]);

    // Función para mover el elevador a una sección específica
    const moveElevatorToSection = useCallback((section: SectionKey) => {
        // console.log('Moving elevator to section:', section);
        if (isTransitioning) {
            pendingSectionRef.current = section;
            return;
        }

        const targetY = floors[section].y;
        const targetFloor = floors[section].floor;
        const description = floors[section].description;

        // Solo registramos el cambio de piso cuando se hace mediante botones (interacción directa)
        if (animationType === 'full') {
            track({
                category: 'Elevator',
                action: 'FloorChange',
                label: `To ${section} (Floor ${targetFloor}) via button`
            });
        }

        // Iniciar transición
        setIsTransitioning(true);
        isScrollingRef.current = true;
        setFloorDescription(description);
        
        // ANIMACIÓN TIPO COMPLETO (por botón): cerrar puertas, bloquear scroll, etc.
        if (animationType === 'full') {
            // console.log('Elevator moving to section:', section);
            // Bloquear el scroll durante la transición completa
            blockScrolling(true);
            
            // Only change door state and force update if transition isn't already in progress
            if (!doorTransitionInProgressRef.current) {
                doorTransitionInProgressRef.current = true;
                // Close the doors first - ensure they fully close before elevator moves
                setDoorsOpen(false);
                
                // Reset transition flag after animation completes
                setTimeout(() => {
                    doorTransitionInProgressRef.current = false;
                }, 1700); // Slightly longer than door animation
            }
            
            // Clear any existing timeouts and animations
            if (doorsTimeoutRef.current) {
                clearTimeout(doorsTimeoutRef.current);
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            
            // Wait for doors to fully close before moving (sincronizado con el scroll)
            doorsTimeoutRef.current = setTimeout(() => {
                // Añadir clase para vibración
                const elevatorElement = document.querySelector('.window-frame');
                elevatorElement?.classList.add('elevator-moving');
                
                // Show floor direction and target in console for debugging
                // console.log(`Moving ${goingUp ? '↑' : '↓'} to floor ${targetFloor}`);
                
                // Calcular distancia para ajustar duración
                const floorDiff = Math.abs(targetFloor - currentFloor);
                
                // Duración basada en distancia (debe coincidir con la duración del scroll en page.tsx)
                const duration = Math.min(1800 + (floorDiff * 600), 3500);
                const startY = cameraRef.current.y;
        
                // Iniciar animación de movimiento del elevador
                let startTime: number | null = null;
                const animate = (timestamp: number | null) => {
                    if (timestamp === null) return;
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    const rawProgress = Math.min(elapsed / duration, 1);
                    
                    // Usar la misma función de easing que el scroll
                    let progress;
                    
                    if (rawProgress < 0.2) {
                        // Aceleración inicial
                        progress = (rawProgress / 0.2) * (rawProgress / 0.2) * 0.2;
                        
                        // Vibración inicial
                        const startingVibration = rawProgress * 0.5;
                        setElevatorVibration(startingVibration);
                    } else if (rawProgress > 0.8) {
                        // Desaceleración final
                        const decelProgress = (1 - rawProgress) / 0.2;
                        progress = 0.8 + (1 - decelProgress * decelProgress) * 0.2;
                        
                        // Vibración final
                        const endingVibration = (1 - ((rawProgress - 0.8) / 0.2)) * 0.5;
                        setElevatorVibration(endingVibration);
                    } else {
                        // Velocidad constante
                        progress = 0.2 + (rawProgress - 0.2) * (0.6 / 0.6);
                        
                        // Vibración constante
                        setElevatorVibration(0.3 + Math.sin(elapsed * 0.01) * 0.1);
                    }
        
                    const newY = startY + (targetY - startY) * progress;
                    cameraRef.current.y = newY;
                    
                    if (rawProgress < 1) {
                        animationFrameRef.current = requestAnimationFrame(animate);
                    } else {
                        // Finalización de la animación completa
                        if (transitionTimeoutRef.current) {
                            clearTimeout(transitionTimeoutRef.current);
                        }
                        
                        // Vibración final al llegar
                        setElevatorVibration(0.8);
                        
                        // After elevator has arrived at destination
                        transitionTimeoutRef.current = setTimeout(() => {
                            elevatorElement?.classList.remove('elevator-moving');
                            setElevatorVibration(0);
                            
                            // Update floor information
                            setCurrentFloor(targetFloor);
                            
                            // Only open doors if no door transition is in progress
                            if (!doorTransitionInProgressRef.current) {
                                doorTransitionInProgressRef.current = true;
                                // Open doors after arrival
                                setDoorsOpen(true);
                                
                                // Reset transition flag after animation completes
                                setTimeout(() => {
                                    doorTransitionInProgressRef.current = false;
                                }, 1700); // Slightly longer than door animation
                            }
                            
                            // Evento de apertura de puertas - no es necesario registrarlo, ya que es parte de la transición
                            // iniciada por la interacción del usuario que ya registramos al inicio
                            
                            // After doors are fully open, reset transition state
                            setTimeout(() => {
                                setIsTransitioning(false);
                                isScrollingRef.current = false;
                                
                                // Desbloquear el scroll de la página
                                blockScrolling(false);
                                
                                if (pendingSectionRef.current && pendingSectionRef.current !== section) {
                                    const nextSection = pendingSectionRef.current;
                                    pendingSectionRef.current = null;
                                    moveElevatorToSection(nextSection);
                                }
                            }, 1600); // Match door opening animation duration
                            
                        }, 500); // Slight pause after arrival before opening doors
                    }
                };
                animationFrameRef.current = requestAnimationFrame(animate);
            }, 1500); // Increased timeout to ensure doors fully close before moving
        } else {
            // console.log('Elevator moving to section (scroll):', section);
            // ANIMACIÓN TIPO SCROLL (por scroll): solo actualizar la posición de la cámara
            cameraRef.current.y = targetY;
            setCurrentFloor(targetFloor);
            setIsTransitioning(false);
            isScrollingRef.current = false;
        }
    }, [animationType, blockScrolling, currentFloor, floors, isTransitioning]);

    return (
        <div 
            className={`window-frame elevator-frame ${elevatorVibration > 0 ? 'vibrating' : ''}`} 
            ref={elevatorContainerRef}
            style={{
                transition: elevatorVibration > 0 ? 'none' : 'transform 0.3s ease-out'
            }}
        >
            {loading && <LoadingIndicator theme={theme} />}
            
            {/* Make sure WelcomeOverlay comes BEFORE the ElevatorDoors in the DOM to ensure proper z-index stacking */}
            <WelcomeOverlay 
                show={showOverlay} 
                theme={theme}
                data={data.overlay}
                onStart={handleStartTrip} 
            />

            <ElevatorDoors 
                isOpen={doorsOpen} 
                theme={theme}
            />

            <Canvas 
                shadows
                gl={{ antialias: true }}
                camera={{ 
                    fov: 60, // Campo de visión más amplio para ver mejor el interior
                    position: [0, 1, 5.5], // Posición fija mirando hacia dentro
                    near: 0.1,
                    far: 50
                }} 
                style={{ background: colors.background }}
                onCreated={() => {
                    // Eliminamos el tracking de la creación del canvas ya que no es una interacción del usuario
                }}
            > 
                <fog attach="fog" args={[colors.fogColor,  30, 70]} />
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
                    // Función vacía para cumplir con la interfaz
                }}
            />
        </div>
    );
};

export default memo(AvatarBox);