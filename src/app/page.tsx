"use client";

import React, { useEffect, useState, useMemo, useCallback, Suspense } from 'react'; 
import { useTranslation } from 'react-i18next';
// import { useElevatorNavigation } from './hooks/useElevatorNavigation';

import { FooterComponent } from './components/footer';
import SectionObserver from './components/SectionObserver'; 
import { track, trackPageView } from './utils/umami-analytics';
import LanguageSwitcher from './components/LanguageSwitcher';
import { lazyWithPreload, throttle } from './utils/lazy-loading';

// Importar componentes críticos de forma directa
import Hero from './sections/Hero.tsx';
import ProofSignals from './sections/home/ProofSignals';
import WhatImBuilding from './sections/home/WhatImBuilding';
import HowIThink from './sections/home/HowIThink';
import siteData from '../data/site-data.json';
import ToggleBtn from './components/tglbutton';
import { SectionKey } from './components/avatar/types';
import ElevatorPlaceholder from './components/avatar/ElevatorPlaceholder';
import FloorAtmosphere from './components/FloorAtmosphere';
import DeferredFloor from './components/DeferredFloor';
// Floor styles ship with the page rather than with each floor's code: the floors' text is in
// the prerendered HTML, so their styles have to be there before the code arrives.
import './sections/About/museum.css';
import './sections/About/timeline.css';
import './sections/experience-office.css';
import './sections/talks-stage.css';
import './sections/awards-room.css';
import './sections/education-room.css';
import { defineFloor, prepareFloorsThrough } from './components/floors';
// import ElevatorButtonsPlaceholder from './components/avatar/ElevatorButtonsPlaceholder';

// Floors: their code is split and loaded near the viewport; their text is prerendered.
// Defined at module level so the build prerender can load every floor before rendering.
const floors = {
  about: defineFloor('about', () => import('./sections/About/About')),
  experience: defineFloor('experience', () => import('./sections/Experience')),
  projects: defineFloor('projects', () => import('./sections/Projects')),
  talks: defineFloor('talks', () => import('./sections/Talks')),
  awards: defineFloor('awards', () => import('./sections/Awards')),
  education: defineFloor('education', () => import('./sections/Education')),
  contact: defineFloor('contact', () => import('./sections/Contact')),
};

// Componentes pesados con carga diferida y prioridad reducida
const AvatarBox = lazyWithPreload(() => import('./components/avatar/avatar_box'), 1500, 'low');
const TimeMachine = lazyWithPreload(() => import('./components/TimeMachine'), 2500, 'low');
const AnimatedBackground = lazyWithPreload(() =>  import('./components/AnimatedBackground'), 200, 'high'); // Aumentamos la prioridad para que cargue más rápido
const MobileElevatorWidget = lazyWithPreload(() => import('./components/mobile/MobileElevatorWidget'), 1000, 'low');
const AudioManager = lazyWithPreload(() => import('./components/avatar/AudioManager'), 2000, 'low');

const Portfolio = () => {   

  // Estado para el tema (modo oscuro) - simplificado
  const [darkMode, setDarkMode] = useState(false);

  // Estado para detectar si estamos en móvil
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(true);
  
  // Estado para la sección actual
  const [currentSection, setCurrentSection] = useState<SectionKey>('hero');
  
  // Estados UI
  const [isMounted, setIsMounted] = useState(false);
  const [elevatorTransitioning, setElevatorTransitioning] = useState(false);
  const [buttonTriggeredNavigation, setButtonTriggeredNavigation] = useState(false);
  
  // Estado para controlar el rendimiento
  const [highPerformanceMode, setHighPerformanceMode] = useState(false);
  
  // Agregamos estado para controlar la visibilidad del fondo animado
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);

  // Estado para la vista de ciudad (ocultar contenido para contemplar el fondo)
  const [cityViewActive, setCityViewActive] = useState(false);

  // Sincronizar evento de vista ciudad
  useEffect(() => {
    const handleCityViewToggle = (e: Event) => {
      const ce = e as CustomEvent<{ active: boolean }>;
      if (ce.detail && typeof ce.detail.active === 'boolean') {
        setCityViewActive(ce.detail.active);
      }
    };
    window.addEventListener('toggle-city-view', handleCityViewToggle);
    return () => window.removeEventListener('toggle-city-view', handleCityViewToggle);
  }, []);

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
    ['hero', 'about', 'experience', 'projects', 'talks', 'awards', 'education', 'contact'],
    []
  ); 

  // Efecto simplificado para aplicar el tema
  useEffect(() => {
    // Evitamos accesos innecesarios al DOM usando la referencia
    const doc = documentRef.current;
    if (!doc || !isMounted) return;
    
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
  }, [darkMode, isMounted]);

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

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
    setIsMounted(true);
    const navigateToHash = async () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      try {
        await prepareFloorsThrough(id);
        const target = document.getElementById(id);
        target?.scrollIntoView({ behavior: 'instant', block: 'start' });
        const floor = target?.closest('main > section')?.id;
        if (floor) setCurrentSection(floor as SectionKey);
      } catch { /* The floor exposes a retry button if its chunk cannot load. */ }
    };
    const onAnchor = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element).closest('a[href]');
      if (!anchor) return;
      const url = new URL(anchor.getAttribute('href')!, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      event.preventDefault();
      history.pushState(null, '', url.hash);
      void navigateToHash();
    };
    void navigateToHash();
    window.addEventListener('hashchange', navigateToHash);
    document.addEventListener('click', onAnchor);
    return () => {
      window.removeEventListener('hashchange', navigateToHash);
      document.removeEventListener('click', onAnchor);
    };
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
    highlightOnMount: false
  }), [currentSection, themeValue, sections]);

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
    <div className={`scroll-smooth relative transition-colors duration-700 ${darkMode ? 'bg-[#121212]' : 'bg-[#f8f9fa]'} min-h-screen flex flex-col overflow-x-clip max-w-full`}>
      {/* Audio (carga diferida para evitar bloqueos) */}
      <Suspense fallback={null}>
        {isMounted && <AudioManager />}
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
          {isMounted && <AnimatedBackground theme={themeValue} currentSection={currentSection} onLoad={handleBackgroundLoad} />}
        </Suspense>
      </div>
      
      {/* Observer para detectar secciones visibles */}
      <SectionObserver {...sectionObserverProps} />
      
      {/* Controles de tema e idioma */}
      <div className="site-controls fixed top-3 right-3 sm:top-4 sm:right-4 z-50 flex items-center gap-1.5 sm:gap-2.5 p-1 sm:p-1.5 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200/80 dark:border-gray-700/80 shadow-md transition-all duration-300">
        <LanguageSwitcher theme={themeValue} />
        <ToggleBtn  
          onChange={handleThemeChange}
          checked={darkMode} 
          className="block"
        />
      </div>

      {/* Contenido principal */}
      <div className={`relative w-full max-w-[1400px] mx-auto px-4 flex-grow transition-all duration-500 overflow-x-clip ${cityViewActive ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100'}`}>
        <div className="grid-layout">
          {/* Columna principal con secciones */}
          <div className="min-w-0 max-w-full">
            <main>
              {/* Hero cargado directamente (importante para LCP) */}
              <section 
                id="hero" 
                className="section-container !pt-0 !pb-2 md:!pt-2 md:!pb-4"
                data-section-id="hero"
              >
                <FloorAtmosphere section="hero" theme={themeValue} showBadge={false} />
                <Hero {...heroProps} />
                <ProofSignals theme={themeValue} />
                <WhatImBuilding theme={themeValue} />
              </section>
              
              {/* All other sections loaded directly without complex visibility tracking */}
              <section id="about" className="section-container scroll-mt-16" data-section-id="about">
                <FloorAtmosphere section="about" theme={themeValue} />
                <DeferredFloor floor={floors.about} theme={themeValue}><HowIThink theme={themeValue} /></DeferredFloor>
              </section>
              
              <section id="experience" className="section-container scroll-mt-16" data-section-id="experience">
                <FloorAtmosphere section="experience" theme={themeValue} />
                <DeferredFloor floor={floors.experience} theme={themeValue} />
              </section>

              <section id="projects" className="section-container scroll-mt-16" data-section-id="projects">
                <FloorAtmosphere section="projects" theme={themeValue} />
                <DeferredFloor floor={floors.projects} theme={themeValue} />
              </section>
              
              <section id="talks" className="section-container scroll-mt-16" data-section-id="talks">
                <FloorAtmosphere section="talks" theme={themeValue} />
                <DeferredFloor floor={floors.talks} theme={themeValue} />
              </section>
              
              <section id="awards" className="section-container scroll-mt-16" data-section-id="awards">
                <FloorAtmosphere section="awards" theme={themeValue} />
                <DeferredFloor floor={floors.awards} theme={themeValue} />
              </section>
              
              <section id="education" className="section-container scroll-mt-16" data-section-id="education">
                <FloorAtmosphere section="education" theme={themeValue} />
                <DeferredFloor floor={floors.education} theme={themeValue} />
              </section>
              
              <section id="contact" className="section-container scroll-mt-16" data-section-id="contact">
                <FloorAtmosphere section="contact" theme={themeValue} />
                <DeferredFloor floor={floors.contact} theme={themeValue} />
              </section>
            </main>
          </div>
          
          {/* Columna lateral con el elevador (solo en desktop) */} 
          {isMobile == false && ( <div className="hidden md:block relative mt-16 lg:mt-20">
            {/* Indicadores de piso (orden ascendente: piso 0 abajo, piso 7 arriba) */}
            {elevatorLoaded  && ( <div 
              className={`absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-[80%] bg-gray-800/70 dark:bg-gray-700/70 rounded-full flex flex-col-reverse justify-between py-2 elevator-indicator elevator-line-container ${isMounted ? 'opacity-100' : 'opacity-0 invisible'}`}
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
            <div className="desktop-elevator sticky top-20 flex flex-col gap-6 sm:hidden md:flex"
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
                    <div className="relative w-full h-[600px]">
                      {/* Placeholder del elevador con fade-out cuando se carga el real */}
                      <div style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 'calc(100% - 80px)',
                        height: '100%',
                        opacity: elevatorLoaded ? 0 : 1,
                        visibility: elevatorLoaded ? 'hidden' : 'visible',
                        zIndex: elevatorLoaded ? 0 : 2,
                        transition: 'opacity 0.8s ease-out, visibility 0.8s step-end'
                      }}>
                        <div className="window-frame elevator-frame relative w-full h-full">
                          <ElevatorPlaceholder theme={themeValue} onLoad={handleElevatorLoad} />
                        </div>
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

      {/* Botón flotante para restaurar contenido si la vista ciudad está activa */}
      {cityViewActive && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('toggle-city-view', { detail: { active: false } }));
              if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                try { navigator.vibrate(15); } catch { /* vibration not supported */ }
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white text-sm font-semibold shadow-2xl backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95"
            aria-label={t('elevator.mobile.exitCityView', 'Volver al contenido')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
            <span>{t('elevator.mobile.exitCityView', 'Volver al contenido')}</span>
          </button>
        </div>
      )}

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
      
      {/* Time Machine (cargado al final) */}
      <Suspense fallback={null}>
        {isMounted && <TimeMachine theme={themeValue} />}
      </Suspense>
    </div>
  );
};

export default React.memo(Portfolio);