"use client";

import React, { useEffect, useState, useMemo, useCallback, Suspense } from 'react'; 
// import { useTranslation } from 'react-i18next';
// import { useElevatorNavigation } from './hooks/useElevatorNavigation';

import { FooterComponent } from './components/footer';
import SectionObserver from './components/SectionObserver'; 
import { track, trackPageView } from './utils/umami-analytics';
import LanguageSwitcher from './components/LanguageSwitcher';
import { lazyWithPreload, throttle } from './utils/lazy-loading';

// Importar componentes críticos de forma directa
import Hero from './sections/Hero.tsx';
import siteData from '../data/site-data.json';
import ToggleBtn from './components/tglbutton';
import { SectionKey } from './components/avatar/types';
import ElevatorPlaceholder from './components/avatar/ElevatorPlaceholder';
// import ElevatorButtonsPlaceholder from './components/avatar/ElevatorButtonsPlaceholder';

// Componente de fallback optimizado
const LoadingFallback = () => (
  <div className="w-full py-20 flex justify-center items-center">
    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Lazy loading de componentes con diferentes prioridades
const About = lazyWithPreload(() => import('./sections/About/About.tsx'), 200, 'high');
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
const AnimatedBackground = lazyWithPreload(() =>  import('./components/AnimatedBackground'), 200, 'high'); // Aumentamos la prioridad para que cargue más rápido
const MobileElevatorWidget = lazyWithPreload(() => import('./components/mobile/MobileElevatorWidget'), 1000, 'low');
const MobileWelcomeTour = lazyWithPreload(() => import('./components/mobile/MobileWelcomeTour'), 1200, 'low');
const AudioManager = lazyWithPreload(() => import('./components/avatar/AudioManager'), 2000, 'low');

const Portfolio = () => {   

  // Estado para el tema (modo oscuro) - simplificado
  const [darkMode, setDarkMode] = useState(() => {
    // Movemos esta lógica fuera de la inicialización del estado para evitar accesos al DOM durante el renderizado
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });
  
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
  
  // Agregamos estado para controlar la visibilidad del fondo animado
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);

  // Referencias para evitar dependencias circulares
  const currentSectionRef = React.useRef<SectionKey>('hero');
  const buttonTriggeredRef = React.useRef(false);
  const elevatorTransitioningRef = React.useRef(false);
  const documentRef = React.useRef<Document | null>(null);
  
  // Guardar referencia al documento para evitar accesos repetidos al DOM
  useEffect(() => {
    documentRef.current = document;
  }, []);
  
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

  // Efecto simplificado para aplicar el tema
  useEffect(() => {
    // Evitamos accesos innecesarios al DOM usando la referencia
    const doc = documentRef.current;
    if (!doc) return;
    
    // Utilizamos requestAnimationFrame para alinear con el ciclo de pintado
    // y reducir reflows/repaints innecesarios
    requestAnimationFrame(() => {
      if (darkMode) {
        doc.documentElement.classList.add('dark');
      } else {
        doc.documentElement.classList.remove('dark');
      }
      
      // Deferred localStorage write to avoid blocking the main thread
      setTimeout(() => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
      }, 0);
    });
  }, [darkMode]);

  // Cambiar el tema - función simplificada
  const handleThemeChange = useCallback((isDark: boolean) => {
    setDarkMode(isDark);
  }, []);

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
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Trackeo de visita diferido para no afectar LCP
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        console.log(`%c [page.tsx] Tracking page view for Portfolio`, 'background:#8a2be2;color:white;padding:3px;');
        trackPageView();
      } catch {
        // Ignorar errores de tracking
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Marcar componente como montado y comenzar precarga estratégica
  useEffect(() => {
    setIsMounted(true);
    
    // Comprobar si hay un hash en la URL al cargar la página
    // y desplazarse a la sección correspondiente
    if (typeof window !== 'undefined' && window.location.hash) {
      const sectionId = window.location.hash.substring(1); // Eliminar el # del inicio
      if (sections.includes(sectionId as SectionKey)) {
        // Navegar a la sección después de un pequeño retraso para asegurar que el DOM está listo
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            // Desplazarse a la sección con un pequeño offset para mejor visualización
            const yOffset = -50;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
            
            // Actualizar la sección actual
            setCurrentSection(sectionId as SectionKey);
          }
        }, 500);
      }
    }
    
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
  }, [sections]);
  
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
      
      // Actualizar el hash en la URL solo para navegación explícita (no durante scroll)
      // Solo actualizamos si está activado por botones o eventos de navegación explícitos
      if (buttonTriggeredRef.current && !elevatorTransitioningRef.current) {
        // Usamos history.replaceState para evitar añadir entradas al historial de navegación
        if (window.history && window.history.replaceState) {
          const url = section === 'hero' 
            ? window.location.pathname // Eliminar el hash si estamos en la sección hero
            : `${window.location.pathname}#${section}`;
          
          window.history.replaceState(
            { ...window.history.state, section },
            '',
            url
          );
        } else {
          // Fallback para navegadores que no soportan history API
          window.location.hash = section === 'hero' ? '' : section;
        }
      }
      
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
 
  // Gestionar transición del elevador (bloqueo de scroll) - OPTIMIZADO
  useEffect(() => {
    // Evitamos el console.log que puede ser costoso
    // console.log(`%c [page.tsx] Estado de transición cambiado: ${elevatorTransitioning}`, 'background:#8a2be2;color:white;padding:3px;');
    
    // Usamos la referencia al documento para evitar múltiples accesos al DOM
    const doc = documentRef.current;
    if (!doc) return;
    
    // Agrupamos las modificaciones al DOM para reducir reflows
    if (elevatorTransitioning) {
      // Utilizamos requestAnimationFrame para alinear los cambios de DOM con el ciclo de pintado
      requestAnimationFrame(() => {
        doc.body.classList.add('elevator-transition-active');
      });
    } else {
      requestAnimationFrame(() => {
        doc.body.classList.remove('elevator-transition-active');
        setButtonTriggeredNavigation(false);
      });
    }
  }, [elevatorTransitioning]);

 
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
    sections: sections as string[],
    onTransitionChange: handleElevatorTransition,
    isButtonTriggered: buttonTriggeredNavigation
  }), [currentSection, themeValue, sections, handleElevatorTransition, buttonTriggeredNavigation]);
  
  const mobileElevatorProps = useMemo(() => ({
    currentSection,
    theme: themeValue,
    floors: sections as string[],
    highlightOnMount: highlightElevator
  }), [currentSection, themeValue, sections, highlightElevator]);

  const [preloadingElevator, setPreloadingElevator] = useState(false);
  const [elevatorLoaded, setElevatorLoaded] = useState(false);

  // Handler optimizado para carga coordinada
  const handleElevatorLoad = useCallback(() => {
    // Transición suave con pequeño retraso
    setTimeout(() => {
      setElevatorLoaded(true);
    }, 100);
  }, []);

  // Manejador para cuando el fondo animado se carga - OPTIMIZADO
  const handleBackgroundLoad = useCallback(() => {
    // Deferred state update to avoid blocking render cycle
    setTimeout(() => {
      requestAnimationFrame(() => {
        setBackgroundLoaded(true);
      });
    }, 0);
  }, []);

  // Efecto para precargar el elevador cuando sea necesario
  useEffect(() => {
    if (isMounted && !isMobile && !preloadingElevator && !elevatorLoaded) {
      // Iniciar precarga coordinada
      setPreloadingElevator(true);
      
      // Precargar AvatarBox después de un corto retraso
      setTimeout(() => {
        AvatarBox.preload();
      }, 200);
    }
  }, [isMounted, isMobile, preloadingElevator, elevatorLoaded]);

  return (
    <div className={`scroll-smooth relative transition-colors duration-700 ${darkMode ? 'bg-[#121212]' : 'bg-[#f8f9fa]'} min-h-screen flex flex-col`}>
      {/* Audio (carga diferida para evitar bloqueos) */}
      <Suspense fallback={null}>
        <AudioManager />
      </Suspense>
      
      {/* Fondo estático que coincide con el color inicial */}
      <div 
        className={`fixed inset-0 z-0 transition-opacity duration-1000 ease-out ${
          darkMode ? 'bg-[#121212]' : 'bg-[#f8f9fa]'
        } ${backgroundLoaded ? 'opacity-0' : 'opacity-100'}`}
        style={{ pointerEvents: 'none' }}
        aria-hidden="true"
      />
      
      {/* Fondo animado con carga prioritaria y transición suave */}
      <div 
        className={`transition-opacity duration-1000 ease-in-out ${
          backgroundLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ willChange: 'opacity' }}
      >
        <Suspense fallback={
          <div className={`fixed inset-0 z-0 ${
            darkMode ? 'bg-[#121212]' : 'bg-[#f8f9fa]'
          }`} aria-hidden="true" />
        }>
          <AnimatedBackground theme={themeValue} onLoad={handleBackgroundLoad} />
        </Suspense>
      </div>
      
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
      <div className="relative w-full max-w-[1400px] mx-auto px-4 flex-grow">
        <div className="grid-layout">
          {/* Columna principal con secciones */}
          <div>
            <main>
              {/* Hero cargado directamente (importante para LCP) */}
              <section 
                id="hero" 
                className="section-container"
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
              
              <section id="projects" className="section-container" data-section-id="projects">
                <Suspense fallback={<LoadingFallback />}>
                  <Projects theme={themeValue} />
                </Suspense>
              </section>
              
              <section id="talks" className="section-container" data-section-id="talks">
                <Suspense fallback={<LoadingFallback />}>
                  <Talks theme={themeValue} />
                </Suspense>
              </section>
              
              <section id="news" className="section-container" data-section-id="news">
                <Suspense fallback={<LoadingFallback />}>
                  <News theme={themeValue} />
                </Suspense>
              </section>
              
              <section id="awards" className="section-container" data-section-id="awards">
                <Suspense fallback={<LoadingFallback />}>
                  <Awards theme={themeValue} />
                </Suspense>
              </section>
              
              <section id="education" className="section-container" data-section-id="education">
                <Suspense fallback={<LoadingFallback />}>
                  <Education theme={themeValue} />
                </Suspense>
              </section>
              
              <section id="contact" className="section-container" data-section-id="contact">
                <Suspense fallback={<LoadingFallback />}>
                  <Contact theme={themeValue} />
                </Suspense>
              </section>
            </main>
          </div>
          
          {/* Columna lateral con el elevador (solo en desktop) */} 
          {isMobile == false && ( <div className="hidden md:block relative mt-40">
            {/* Indicadores de piso */}
            {elevatorLoaded  && ( <div 
              className={`absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-[80%] bg-gray-800/70 dark:bg-gray-700/70 rounded-full flex flex-col justify-between py-2 elevator-indicator elevator-line-container ${isMounted ? 'opacity-100' : 'opacity-0 invisible'}`}
              style={{ 
                visibility: isMounted ? 'visible' : 'hidden',
                pointerEvents: isMounted ? 'auto' : 'none',
                transitionDelay: '300ms',
                zIndex: 20, // Asegurar que esté por encima de otros elementos
                boxShadow: '0 0 8px rgba(0, 0, 0, 0.2)' // Añadir sombra para mejorar visibilidad
              }}
            >
              {sections.map((section) => (
                <div 
                  key={section}
                  className={`w-3 h-3 mx-auto rounded-full transition-all duration-300 ${
                    isMounted && currentSection === section
                      ? 'bg-blue-500 scale-125 shadow-glow' 
                      : 'bg-gray-400 dark:bg-gray-500'
                  }`}
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                />
              ))}
            </div>)}
            
            {/* Elevador 3D (carga coordinada) */}
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
                  <div className="flex flex-col">
                    {/* Contenedor principal del elevador con transición coordinada */}
                    <div className="window-frame elevator-frame relative">
                      {/* Placeholder del elevador con fade-out cuando se carga el real */}
                      <div style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: elevatorLoaded ? 0 : 1,
                        visibility: elevatorLoaded ? 'hidden' : 'visible',
                        zIndex: elevatorLoaded ? 0 : 2,
                        transition: 'opacity 0.8s ease-out, visibility 0.8s step-end'
                      }}>
                        <ElevatorPlaceholder theme={themeValue} onLoad={handleElevatorLoad} />
                      </div>
                      
                      {/* Elevador real con fade-in */}
                      <div style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: elevatorLoaded ? 1 : 0,
                        visibility: elevatorLoaded ? 'visible' : 'hidden',
                        zIndex: elevatorLoaded ? 2 : 0,
                        transition: 'opacity 0.8s ease-in, visibility 0.1s step-start'
                      }}>
                        <Suspense fallback={null}>
                          {/* Siempre renderizar AvatarBox después de iniciar la carga para evitar saltos */}
                          <AvatarBox {...elevatorProps} />
                        </Suspense>
                      </div>
                    </div> 
                  </div>
                )}
            </div>
          </div>)}
        </div>
      </div>

      {/* Footer con z-index explícito para que esté siempre visible */}
      <div className="relative z-10">
        <FooterComponent setIsDarkMode={setDarkMode} isDarkMode={darkMode} />
      </div>
      
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