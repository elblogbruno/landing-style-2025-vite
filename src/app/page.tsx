"use client";

import React, { useEffect, useState, useMemo, useCallback, Suspense, useRef } from 'react'; 
import { useTranslation } from 'react-i18next';
import { useElevatorNavigation } from './hooks/useElevatorNavigation';

import { FooterComponent } from './components/footer';
import SectionObserver from './components/SectionObserver'; 
import { track } from './utils/umami-analytics';
import LanguageSwitcher from './components/LanguageSwitcher';
import { lazyWithPreload, throttle } from './utils/lazy-loading';

// Importar componentes críticos de forma directa
import Hero from './sections/Hero.tsx';
import siteData from '../data/site-data.json';
import ToggleBtn from './components/tglbutton';
import { SectionKey } from './components/avatar/types';
import { useInView } from 'react-intersection-observer';
import ElevatorPlaceholder from './components/avatar/ElevatorPlaceholder';

// Componente de fallback optimizado
const LoadingFallback = () => (
  <div className="w-full py-20 flex justify-center items-center">
    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Lazy loading de componentes con diferentes prioridades
const About = lazyWithPreload(() => import('./sections/About'), 200, 'high');
const Experience = lazyWithPreload(() => import('./sections/Experience'), 300, 'high');
const Projects = lazyWithPreload(() => import('./sections/Projects'), 400, 'medium');
const Talks = lazyWithPreload(() => import('./sections/Talks'), 500, 'medium');
const News = lazyWithPreload(() => import('./sections/News'), 600, 'medium');
const Awards = lazyWithPreload(() => import('./sections/Awards'), 650, 'medium');
const Education = lazyWithPreload(() => import('./sections/Education'), 700, 'medium');
const Contact = lazyWithPreload(() => import('./sections/Contact'), 800, 'medium');

// Componentes pesados con carga diferida y prioridad reducida
const AvatarBox = lazyWithPreload(() => import('./components/avatar/avatar_box'), 1500, 'low');
const TimeMachine = lazyWithPreload(() => import('./components/TimeMachine'), 2500, 'low');
const AnimatedBackground = lazyWithPreload(() => import('./components/AnimatedBackground'), 800, 'medium');
const MobileElevatorWidget = lazyWithPreload(() => import('./components/mobile/MobileElevatorWidget'), 1000, 'low');
const MobileWelcomeTour = lazyWithPreload(() => import('./components/mobile/MobileWelcomeTour'), 1200, 'low');
const AudioManager = lazyWithPreload(() => import('./components/avatar/AudioManager'), 2000, 'low');

const Portfolio = () => {  
  // Access translation functions
  const { t } = useTranslation();

  // Estado para el tema (modo oscuro) - simplificado
  const [darkMode, setDarkMode] = useState(() => 
    document.documentElement.classList.contains('dark')
  );
  
  // Estado para detectar si estamos en móvil
  const [isMobile, setIsMobile] = useState(false);
  
  // Estado para la sección actual
  const [currentSection, setCurrentSection] = useState<SectionKey>('hero');
  
  // Estados UI
  const [showMobileTour, setShowMobileTour] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [highlightElevator, setHighlightElevator] = useState(false);
  const [elevatorTransitioning, setElevatorTransitioning] = useState(false);
  const [buttonTriggeredNavigation, setButtonTriggeredNavigation] = useState(false);
  
  // Estado para controlar el rendimiento
  const [highPerformanceMode, setHighPerformanceMode] = useState(false);
  
  // Estado para forzar renderizado de secciones (por ejemplo, al usar el elevador)
  const [forceRenderSections, setForceRenderSections] = useState<Set<SectionKey>>(new Set());
  
  // Referencias para evitar dependencias circulares
  const currentSectionRef = React.useRef<SectionKey>('hero');
  const buttonTriggeredRef = React.useRef(false);
  const elevatorTransitioningRef = React.useRef(false);
  
  // Actualizar referencias cuando cambian los estados
  useEffect(() => {
    currentSectionRef.current = currentSection;
  }, [currentSection]);
  
  useEffect(() => {
    buttonTriggeredRef.current = buttonTriggeredNavigation;
  }, [buttonTriggeredNavigation]);
  
  useEffect(() => {
    elevatorTransitioningRef.current = elevatorTransitioning;
  }, [elevatorTransitioning]);
  
  // Memoizar secciones para evitar recreación en cada render
  const sections = useMemo<SectionKey[]>(() => 
    ['hero', 'about', 'experience', 'projects', 'talks', 'news', 'awards', 'education', 'contact'],
    []
  );

  // Función para obtener el número de piso (memoizada)
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

  // Efecto simplificado para aplicar el tema
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Cambiar el tema - función simplificada
  const handleThemeChange = useCallback((isDark: boolean) => {
    setDarkMode(isDark);
  }, []);

  // Sistema inteligente de precarga basado en visibilidad de sección y dirección de scroll
  const [lastScrollY, setLastScrollY] = useState(0);
  const preloadNextComponents = useCallback(() => {
    if (!isMounted) return;
    
    const currentIndex = sections.indexOf(currentSectionRef.current);
    const scrollingDown = window.scrollY > lastScrollY;
    setLastScrollY(window.scrollY);
    
    // Precargar componentes cercanos basados en la dirección del scroll
    if (scrollingDown && currentIndex < sections.length - 1) {
      // Precargar siguiente componente cuando scroll hacia abajo
      const nextSection = sections[currentIndex + 1];
      const nextNextSection = sections[currentIndex + 2];
      
      switch (nextSection) {
        case 'about': About.preload(); break;
        case 'experience': Experience.preload(); break;
        case 'projects': Projects.preload(); break;
        case 'talks': Talks.preload(); break;
        case 'news': News.preload(); break;
        case 'awards': Awards.preload(); break;
        case 'education': Education.preload(); break;
        case 'contact': Contact.preload(); break;
      }
      
      // Precargar el siguiente del siguiente con menor prioridad
      if (nextNextSection) {
        setTimeout(() => {
          switch (nextNextSection) {
            case 'about': About.preload(); break;
            case 'experience': Experience.preload(); break;
            case 'projects': Projects.preload(); break;
            case 'talks': Talks.preload(); break;
            case 'news': News.preload(); break;
            case 'awards': Awards.preload(); break;
            case 'education': Education.preload(); break;
            case 'contact': Contact.preload(); break;
          }
        }, 1000);
      }
    } else if (!scrollingDown && currentIndex > 0) {
      // Precargar componente anterior cuando scroll hacia arriba
      const prevSection = sections[currentIndex - 1];
      switch (prevSection) {
        case 'hero': break; // Ya está cargado
        case 'about': About.preload(); break;
        case 'experience': Experience.preload(); break;
        case 'projects': Projects.preload(); break;
        case 'talks': Talks.preload(); break;
        case 'news': News.preload(); break;
        case 'awards': Awards.preload(); break;
        case 'education': Education.preload(); break;
        case 'contact': Contact.preload(); break;
      }
    }
  }, [isMounted, sections, lastScrollY]);

  // Efecto para detectar si estamos en móvil y activar modo de alto rendimiento
  useEffect(() => {
    const checkIfMobile = throttle(() => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      
      // Activar modo de alto rendimiento para dispositivos de gama baja o móviles antiguos
      if (
        isMobileView && 
        (
          typeof navigator !== 'undefined' && (
            navigator.hardwareConcurrency <= 4 || 
            /Android [4-6]|iPhone OS [8-9]/.test(navigator.userAgent) ||
            // Detectar dispositivos con poca memoria
            ('deviceMemory' in navigator && 
             (navigator as Navigator & {deviceMemory?: number})?.deviceMemory != null && 
             ((navigator as Navigator & {deviceMemory?: number})?.deviceMemory || 8) < 4)
          )
        )
      ) {
        setHighPerformanceMode(true);
      }
    }, 250); // Solo comprobar cada 250ms como máximo
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile, { passive: true });
    
    // Añadir detección de scroll para precarga
    const handleScroll = throttle(() => {
      preloadNextComponents();
    }, 500);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [preloadNextComponents]);

  // Trackeo de visita diferido para no afectar LCP
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        track({
          category: 'page',
          action: 'view',
          label: 'Portfolio'
        });
      } catch {
        // Ignorar errores de tracking
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Marcar componente como montado y comenzar precarga estratégica
  useEffect(() => {
    setIsMounted(true);
    
    // Mostrar el tour solo en móvil y solo la primera vez
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      const hasSeenTour = localStorage.getItem('hasSeenMobileTour');
      // No mostramos el tour inmediatamente, lo haremos después de que la página cargue
      setShowMobileTour(false);
      
      // Mostrar el tour después de que la página se cargue completamente
      if (!hasSeenTour) {
        const onPageLoad = () => {
          // Añadir un pequeño retraso para asegurar que toda la UI esté renderizada
          setTimeout(() => {
            setShowMobileTour(true);
          }, 800);
        };
        
        // Si la página ya está cargada, mostrar el tour
        if (document.readyState === 'complete') {
          onPageLoad();
        } else {
          // Si no, esperar a que se cargue
          window.addEventListener('load', onPageLoad);
          return () => window.removeEventListener('load', onPageLoad);
        }
      }
    }
    
    // Precargar el componente About después de la carga inicial
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        About.preload();
        setTimeout(() => Experience.preload(), 500);
      });
    } else {
      setTimeout(() => {
        About.preload();
        setTimeout(() => Experience.preload(), 500);
      }, 1500);
    }
    
    // Precargar el avatar en desktop después de que la página esté completamente cargada
    if (window.innerWidth >= 768) {
      window.addEventListener('load', () => {
        setTimeout(() => AvatarBox.preload(), 1000);
      });
    }
  }, []);
  
  // Limpiar clases de bloqueo de scroll al desmontar
  useEffect(() => {
    return () => {
      document.body.classList.remove('overflow-hidden', 'elevator-transition-active');
    };
  }, []);

  // Manejar cambio de sección de forma optimizada
  const handleSectionChange = useCallback((section: SectionKey) => {
    // Evitar cambios innecesarios de estado
    if (section !== currentSectionRef.current) {
      setCurrentSection(section);
      
      // Registrar solo cambios por scroll, no por botones
      if (!buttonTriggeredRef.current && !elevatorTransitioningRef.current) {
        // Diferir tracking para no bloquear la UI
        setTimeout(() => {
          try {
            track({
              category: 'section',
              action: 'view',
              label: section
            });
          } catch {
            // Ignorar errores de tracking
          }
        }, 50);
      }
    }
  }, []);

  // Actualizar estado de transición del elevador
  const handleElevatorTransition = useCallback((isTransitioning: boolean) => {
    setElevatorTransitioning(isTransitioning);
  }, []);

  // Use the shared elevator navigation hook
  const {
    isTransitioning,
    currentFloor,
    doorsState,
    transitionStatus,
    targetSection,
    floorsInTransition: floorsInTransitionState,
    handleFloorClick: handleElevatorNavigation
  } = useElevatorNavigation({
    currentSection,
    sections,
    onTransitionChange: handleElevatorTransition,
    isButtonTriggered: buttonTriggeredNavigation
  });
  
  // Define floorsInTransition ref before using it
  const floorsInTransition = React.useRef<(SectionKey)[]>([]);
  
  // Keep the floorsInTransition ref in sync with the hook's state
  useEffect(() => {
    floorsInTransition.current = floorsInTransitionState;
  }, [floorsInTransitionState]);

  // Función optimizada para click en pisos con caché de elementos DOM
  const elementCache = React.useRef<Record<string, HTMLElement | null>>({});
  
  // Use the shared elevator navigation logic to handle floor clicks
  const handleFloorClick = useCallback((floor: SectionKey) => {
    // Let the elevator navigation hook handle everything
    setButtonTriggeredNavigation(true);
    handleElevatorNavigation(floor);
  }, [handleElevatorNavigation]);

  // Gestionar transición del elevador (bloqueo de scroll)
  useEffect(() => {
    if (elevatorTransitioning) {
      document.body.classList.add('elevator-transition-active');
    } else {
      document.body.classList.remove('elevator-transition-active');
      setButtonTriggeredNavigation(false);
    }
  }, [elevatorTransitioning]);

  // Cerrar el tour de móvil
  const handleCloseMobileTour = useCallback(() => {
    setShowMobileTour(false);
    setHighlightElevator(true);
    localStorage.setItem('hasSeenMobileTour', 'true');
    
    try {
      track({
        category: 'MobileTour',
        action: 'Closed',
        label: 'User closed tour'
      });
    } catch {
      // Ignorar errores de tracking
    }
  }, []);

  // Listen for section change events from the mobile elevator
  useEffect(() => {
    const handleSectionChangeEvent = (event: CustomEvent) => {
      const { section } = event.detail;
      if (section && sections.includes(section as SectionKey)) {
        // Update the current section state directly
        setCurrentSection(section as SectionKey);
      }
    };

    // Add event listener for the custom event
    window.addEventListener('section-change', handleSectionChangeEvent as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('section-change', handleSectionChangeEvent as EventListener);
    };
  }, [sections]);

  // Memoizar todos los props para componentes
  const heroProps = useMemo(() => ({
    data: siteData.hero,
    theme: darkMode ? "dark" : "light" as "light" | "dark",
  }), [darkMode]);
  
  const themeValue = darkMode ? "dark" : "light" as "light" | "dark";
  
  const sectionObserverProps = useMemo(() => ({
    sections,
    currentSection,
    onSectionChange: handleSectionChange,
    performanceMode: highPerformanceMode,
    disabled: elevatorTransitioning || buttonTriggeredNavigation // Disable observer during transitions
  }), [sections, currentSection, handleSectionChange, highPerformanceMode, elevatorTransitioning, buttonTriggeredNavigation]);
  
  const elevatorProps = useMemo(() => ({
    currentSection,
    theme: themeValue,
    floors: sections as string[],
    onTransitionChange: handleElevatorTransition,
    isButtonTriggered: buttonTriggeredNavigation
  }), [currentSection, themeValue, handleElevatorTransition, buttonTriggeredNavigation]);
  
  const mobileElevatorProps = useMemo(() => ({
    currentSection,
    theme: themeValue,
    floors: sections as string[],
    highlightOnMount: highlightElevator
  }), [currentSection, themeValue, sections, highlightElevator]);

  const [elevatorLoaded, setElevatorLoaded] = useState(false);
  
  // Handler for when the elevator placeholder signals that it's ready to load the real elevator
  const handleElevatorLoad = useCallback(() => {
    setElevatorLoaded(true);
  }, []);

  return (
    <div className="scroll-smooth relative">
      {/* Audio (carga diferida para evitar bloqueos) */}
      <Suspense fallback={null}>
        <AudioManager />
      </Suspense>
      
      {/* Fondo animado con carga diferida */}
      <Suspense fallback={null}>
        <AnimatedBackground theme={themeValue} />
      </Suspense>
      
      {/* Observer para detectar secciones visibles */}
      <SectionObserver {...sectionObserverProps} />
      
      {/* Controles de tema e idioma */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <LanguageSwitcher theme={themeValue} />
        <ToggleBtn  
          onChange={handleThemeChange}
          checked={darkMode} 
          className="block"
        />
      </div>

      {/* Contenido principal */}
      <div className="relative w-full max-w-[1400px] mx-auto px-4">
        <div className="grid-layout">
          {/* Columna principal con secciones */}
          <div>
            <main>
              {/* Hero cargado directamente (importante para LCP) */}
              <section 
                id="hero" 
                className="section-container scroll-mt-16"
                data-section-id="hero"
              >
                <Hero {...heroProps} />
              </section>
              
              {/* All other sections loaded directly without complex visibility tracking */}
              <section id="about" className="section-container scroll-mt-16" data-section-id="about">
                <Suspense fallback={<LoadingFallback />}>
                  <About theme={themeValue} />
                </Suspense>
              </section>
              
              <section id="experience" className="section-container scroll-mt-16" data-section-id="experience">
                <Suspense fallback={<LoadingFallback />}>
                  <Experience theme={themeValue} />
                </Suspense>
              </section>
              
              <section id="projects" className="section-container scroll-mt-16" data-section-id="projects">
                <Suspense fallback={<LoadingFallback />}>
                  <Projects theme={themeValue} />
                </Suspense>
              </section>
              
              <section id="talks" className="section-container scroll-mt-16" data-section-id="talks">
                <Suspense fallback={<LoadingFallback />}>
                  <Talks theme={themeValue} />
                </Suspense>
              </section>
              
              <section id="news" className="section-container scroll-mt-16" data-section-id="news">
                <Suspense fallback={<LoadingFallback />}>
                  <News theme={themeValue} />
                </Suspense>
              </section>
              
              <section id="awards" className="section-container scroll-mt-16" data-section-id="awards">
                <Suspense fallback={<LoadingFallback />}>
                  <Awards theme={themeValue} />
                </Suspense>
              </section>
              
              <section id="education" className="section-container scroll-mt-16" data-section-id="education">
                <Suspense fallback={<LoadingFallback />}>
                  <Education theme={themeValue} />
                </Suspense>
              </section>
              
              <section id="contact" className="section-container scroll-mt-16" data-section-id="contact">
                <Suspense fallback={<LoadingFallback />}>
                  <Contact theme={themeValue} />
                </Suspense>
              </section>
            </main>
          </div>
          
          {/* Columna lateral con el elevador (solo en desktop) */} 
          {isMobile == false && ( <div className="hidden md:block relative mt-40">
            {/* Indicadores de piso */}
            <div 
              className={`absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-[80%] bg-gray-800/40 rounded-full flex flex-col justify-between py-2 elevator-indicator elevator-line-container ${isMounted ? 'opacity-100' : 'opacity-0 invisible'}`}
              style={{ 
                visibility: isMounted ? 'visible' : 'hidden',
                pointerEvents: isMounted ? 'auto' : 'none',
                transitionDelay: '300ms' 
              }}
            >
              {sections.map((section) => (
                <div 
                  key={section}
                  className={`w-3 h-3 mx-auto rounded-full transition-all duration-300 ${
                    isMounted && currentSection === section
                      ? 'bg-blue-500 scale-125' 
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            {/* Elevador 3D (carga diferida para no bloquear) */}
            
              <div className="sticky top-20 flex flex-col gap-6 ml-6 sm:hidden md:flex"
                style={{ 
                  opacity: isMounted ? 1 : 0, 
                  transition: 'opacity 0.3s ease-out',
                  // Prevent layout shifts by setting fixed dimensions
                  height: '600px',
                  width: '100%'
                }}
              >
                {!highPerformanceMode && (
                  <div className="window-frame elevator-frame" style={{ position: 'relative' }}>
                    {/* Use placeholder until the main content loads */}
                    <div style={{ 
                      position: !elevatorLoaded ? 'relative' : 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      visibility: !elevatorLoaded ? 'visible' : 'hidden',
                      zIndex: !elevatorLoaded ? 2 : 0,
                      transition: 'visibility 0.1s'
                    }}>
                      <ElevatorPlaceholder theme={themeValue} onLoad={handleElevatorLoad} />
                    </div>
                    
                    {/* Optimize rendering by avoiding conditional mounting/unmounting */}
                    <div style={{ 
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      visibility: elevatorLoaded ? 'visible' : 'hidden',
                      zIndex: elevatorLoaded ? 2 : 0
                    }}>
                      <Suspense fallback={
                        <div className="flex items-center justify-center h-[600px] w-full bg-gray-900 rounded-lg">
                          <div className="text-center">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-400 text-sm">{t('elevator.loading', 'Cargando elevador...')}</p>
                          </div>
                        </div>
                      }>
                        {/* Only render AvatarBox if elevatorLoaded to avoid unnecessary work */}
                        {elevatorLoaded && <AvatarBox {...elevatorProps} />}
                      </Suspense>
                    </div>
                  </div>
                )}
              
              {/* Botones de piso para el elevador */}
              <div className={`absolute top-0 -right-16 h-full flex flex-col justify-center p-3 rounded-r-xl border-2 shadow-xl ${darkMode ? 'bg-black/90 border-gray-700' : 'bg-white/90 border-gray-300'}`}>
                <div className="text-center mb-2">
                  <span className={`text-xs uppercase tracking-wider font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Piso</span>
                </div>
                
                {sections.map((floor) => (
                  <div className="relative group ml-1 mb-1" key={floor}>
                    <button
                      onClick={() => handleFloorClick(floor)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 text-sm font-mono
                        ${(currentSection === floor || (isTransitioning && (targetSection === floor || floorsInTransition.current.includes(floor))))
                          ? 'bg-blue-500 text-white' 
                          : darkMode 
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      aria-label={`Ir al piso ${floor}`}
                    >
                      {isMounted && (
                        <div className="flex flex-col items-center">
                          <span className="text-xs leading-none mb-0.5 font-bold">
                            {getFloorNumber(floor)}
                            <span className="text-[9px]">{getFloorNumber(floor) >= 0 ? 'F' : 'B'}</span>
                          </span>
                          <span className="text-[10px] leading-none">{floor[0].toUpperCase()}</span>
                        </div>
                      )}
                    </button>
                    <div className={`absolute top-1/2 -translate-y-1/2 left-[calc(100%+8px)] px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 ${darkMode ? 'bg-black text-white' : 'bg-white text-black border border-gray-200'}`}>
                      {t(`navigation.${floor}`)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>)}
        </div>
      </div>

      {/* Footer */}
      <FooterComponent setIsDarkMode={setDarkMode} isDarkMode={darkMode} />
      
      {/* Componentes de UI móvil con carga diferida */} 
      {isMobile && isMounted && (
        <Suspense fallback={null}>
          <MobileElevatorWidget 
            {...mobileElevatorProps}
            onTransitionChange={handleElevatorTransition}
          />
        </Suspense>
      )}
      
      {isMobile && showMobileTour && (
        <Suspense fallback={null}>
          <MobileWelcomeTour 
            theme={themeValue}
            onClose={handleCloseMobileTour}
          />
        </Suspense>
      )}
      
      {/* Time Machine (cargado al final) */}
      <Suspense fallback={null}>
        <TimeMachine theme={themeValue} />
      </Suspense>
    </div>
  );
};

export default React.memo(Portfolio);