"use client";

import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react'; 
import { FooterComponent } from './components/footer';
// import GoUpButton from './components/go_up_button';  
import SectionObserver from './components/SectionObserver'; 
import { track, trackDeferred } from './utils/umami-analytics';
import TimeMachine from './components/TimeMachine';

// Importar solo el componente Hero de forma estática para LCP
import Hero from './sections/Hero';

// Importar el resto de componentes con lazy loading
const About = lazy(() => import('./sections/About'));
const Experience = lazy(() => import('./sections/Experience'));
const Projects = lazy(() => import('./sections/Projects'));
const Talks = lazy(() => import('./sections/Talks'));
const News = lazy(() => import('./sections/News'));
const Awards = lazy(() => import('./sections/Awards'));
const Education = lazy(() => import('./sections/Education'));
const Contact = lazy(() => import('./sections/Contact'));

// Fallback para cuando se está cargando un componente
const LoadingFallback = () => (
  <div className="w-full py-20 flex justify-center items-center">
    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

import siteData from '../data/site-data.json';
 
import AvatarBox from './components/avatar/avatar_box';
import AnimatedBackground from './components/AnimatedBackground';
import ToggleBtn from './components/tglbutton';
import AudioManager from './components/avatar/AudioManager';
import MobileElevatorWidget from './components/mobile/MobileElevatorWidget';
import MobileWelcomeTour from './components/mobile/MobileWelcomeTour';

const Portfolio = () => {
  const [darkMode, setDarkMode] = useState(() => 
    document.documentElement.classList.contains('dark')
  ); 

  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  
  const [currentSection, setCurrentSection] = useState<'hero' | 'about' | 'experience' | 'projects' | 'talks' | 'news' | 'awards' | 'education' | 'contact'>('hero');
  const [showMobileTour, setShowMobileTour] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [highlightElevator, setHighlightElevator] = useState(false);
  const [elevatorTransitioning, setElevatorTransitioning] = useState(false);
  const [buttonTriggeredNavigation, setButtonTriggeredNavigation] = useState(false);
  
  const getFloorNumber = useCallback((section: string): number => {
    const floorMap: Record<string, number> = {
      hero: 7,
      about: 6,
      experience: 5,
      projects: 4,
      talks: 3,
      news: 2,
      awards: 1,
      education: 0,
      contact: -1
    };
    return floorMap[section] || 0;
  }, []);

  const sections = useMemo(() => ['hero', 'about', 'experience', 'projects', 'talks', 'news', 'awards', 'education', 'contact'], []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
      localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
    }
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('userThemePreference')) {
        setDarkMode(e.matches);
        localStorage.setItem('theme', e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleThemeChange = (isDark: boolean) => {
    setDarkMode(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    localStorage.setItem('userThemePreference', 'true');
  };

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    trackDeferred({
      category: 'page',
      action: 'view',
      label: 'Portfolio'
    });
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  const handleSectionChange = useCallback((section: typeof currentSection) => {
    // Solo registramos cambios de sección si la anterior es diferente para evitar eventos duplicados
    if (section !== currentSection) {
      setCurrentSection(section);
      
      // Evitamos registrar cambios automáticos de sección causados por desplazamiento
      if (!buttonTriggeredNavigation && !elevatorTransitioning) {
        track({
          category: 'section',
          action: 'view',
          label: section
        });
      }
    }
  }, [currentSection, buttonTriggeredNavigation, elevatorTransitioning]);

  const handleFloorClick = useCallback((floor: string) => {
    console.log(`Floor button clicked: ${floor}`);
    if (floor === currentSection) return;
    
    setButtonTriggeredNavigation(true);
    
    const targetElement = document.getElementById(floor);
    if (!targetElement) return;
    
    // Esta es una interacción explícita del usuario, por lo que sí queremos registrarla
    track({
      category: 'navigation',
      action: 'elevator_button_click',
      label: floor
    });
    
    document.body.classList.add('elevator-transition-active');
    
    const currentFloorIndex = sections.indexOf(currentSection);
    const targetFloorIndex = sections.indexOf(floor);
    const floorDistance = Math.abs(targetFloorIndex - currentFloorIndex);
    
    const doorCloseTime = 1600;
    const moveDuration = Math.min(1800 + (floorDistance * 600), 3500);
    const pauseBeforeOpen = 500;
    const doorOpenTime = 1600;
    
    const offsetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 100;
    const startPosition = window.pageYOffset;
    const distance = offsetPosition - startPosition;
    
    setCurrentSection(floor as typeof currentSection);
    
    setTimeout(() => {
      const startTime = performance.now();
      
      const animateScroll = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / moveDuration, 1);
        
        let easedProgress;
        if (progress < 0.2) {
          easedProgress = (progress / 0.2) * (progress / 0.2) * 0.2;
        } else if (progress > 0.8) {
          const decelProgress = (1 - progress) / 0.2;
          easedProgress = 0.8 + (1 - (decelProgress * decelProgress)) * 0.2;
        } else {
          easedProgress = 0.2 + (progress - 0.2) * (0.6 / 0.6);
        }
        
        window.scrollTo(0, startPosition + distance * easedProgress);
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          setTimeout(() => {
            document.body.classList.remove('elevator-transition-active');
          }, pauseBeforeOpen + doorOpenTime);
        }
      };
      
      requestAnimationFrame(animateScroll);
    }, doorCloseTime);
  }, [currentSection, sections]);

  useEffect(() => {
    if (elevatorTransitioning) {
      document.body.classList.add('elevator-transition-active');
    } else {
      document.body.classList.remove('elevator-transition-active');
    }
    
    return () => {
      document.body.classList.remove('elevator-transition-active');
    };
  }, [elevatorTransitioning]);

  const handleCloseMobileTour = () => {
    setShowMobileTour(false);
    setHighlightElevator(true);
    
    track({
      category: 'MobileTour',
      action: 'Closed',
      label: 'User closed tour'
    });
  };

  const handleElevatorTransition = (isTransitioning: boolean) => {
    console.log(`Elevator transitioning: ${isTransitioning}`);
    setElevatorTransitioning(isTransitioning);
    
    if (!isTransitioning) {
      setButtonTriggeredNavigation(false);
    }
  };
 
  return (
    <div className="scroll-smooth relative">
      <AudioManager />
      
      <AnimatedBackground theme={darkMode ? "dark" : "light"} />
      
      <SectionObserver
        sections={sections}
        currentSection={currentSection}
        onSectionChange={handleSectionChange} 
        performanceMode={false} />
      
      <div> 
        <div className="fixed top-4 right-4 z-50">
          <ToggleBtn  
          onChange={handleThemeChange}
          checked={darkMode} 
          className="block"
          />
        </div>

        <div className="relative w-full max-w-[1400px] mx-auto px-4 px-mobile-smaller">
          <div className="grid-layout">
            <div>
              <main>
                {sections.map((sectionId) => (
                  <section 
                    key={sectionId} 
                    id={sectionId} 
                    className="section-container scroll-mt-16"
                    data-section-id={sectionId}
                  >
                    {sectionId === 'hero' && (
                      <Hero data={siteData.hero} theme={darkMode ? "dark" : "light"} />
                    )}
                    
                    {sectionId === 'about' && (
                      <Suspense fallback={<LoadingFallback />}>
                        <About data={siteData.about} theme={darkMode ? "dark" : "light"} />
                      </Suspense>
                    )}
                    
                    {sectionId === 'experience' && (
                      <Suspense fallback={<LoadingFallback />}>
                        <Experience data={siteData.experience} theme={darkMode ? "dark" : "light"} />
                      </Suspense>
                    )}
                    
                    {sectionId === 'projects' && (
                      <Suspense fallback={<LoadingFallback />}>
                        <Projects data={{
                          title: siteData.projects.title,
                          items: siteData.projects.items,
                          skills: siteData.projects.skills,
                          categories: siteData.projects.categories
                        }} theme={darkMode ? "dark" : "light"} />
                      </Suspense>
                    )}
                    
                    {sectionId === 'talks' && (
                      <Suspense fallback={<LoadingFallback />}>
                        <Talks data={siteData.talks} theme={darkMode ? "dark" : "light"} />
                      </Suspense>
                    )}
                    
                    {sectionId === 'news' && (
                      <Suspense fallback={<LoadingFallback />}>
                        <News data={siteData.news} theme={darkMode ? "dark" : "light"} />
                      </Suspense>
                    )}
                    
                    {sectionId === 'awards' && (
                      <Suspense fallback={<LoadingFallback />}>
                        <Awards data={siteData.awards} theme={darkMode ? "dark" : "light"} />
                      </Suspense>
                    )}
                    
                    {sectionId === 'education' && (
                      <Suspense fallback={<LoadingFallback />}>
                        <Education data={siteData.education} theme={darkMode ? "dark" : "light"} />
                      </Suspense>
                    )}
                    
                    {sectionId === 'contact' && (
                      <Suspense fallback={<LoadingFallback />}>
                        <Contact data={siteData.contact} theme={darkMode ? "dark" : "light"} />
                      </Suspense>
                    )}
                  </section>
                ))}
              </main>
            </div>

            <div className="hidden md:block relative mt-40">
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-[80%] bg-gray-800/40 rounded-full flex flex-col justify-between py-2">
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
              
              <div className="sticky top-20 flex flex-col gap-6 ml-6 sm:hidden md:flex"> 
                <div className="window-frame elevator-frame">
                    <AvatarBox 
                      data={siteData.elevator} 
                      currentSection={currentSection} 
                      theme={darkMode ? "dark" : "light"} 
                      onTransitionChange={handleElevatorTransition} 
                      isButtonTriggered={buttonTriggeredNavigation} 
                    />
                </div> 
              
                <div className={`absolute top-0 -right-16 h-full flex flex-col justify-center p-3 rounded-r-xl border-2 shadow-xl  ${darkMode ? 'bg-black/90 border-gray-700' : 'bg-white/90 border-gray-300'}`}>
                  <div className="text-center mb-2">
                    <span className={`text-xs uppercase tracking-wider font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Floor</span>
                  </div>
                  
                  {sections.map((floor) => (
                  <div className="relative group ml-1 mb-1" key={floor}>
                    <button
                    onClick={() => handleFloorClick(floor)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 text-sm font-mono
                      ${currentSection === floor 
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
                    {floor.charAt(0).toUpperCase() + floor.slice(1)}
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <FooterComponent setIsDarkMode={setDarkMode} isDarkMode={darkMode} siteData={siteData} />
        
        {/* {!isMobile && <GoUpButton />} */}
        
        {isMobile && isMounted && (
          <MobileElevatorWidget 
            currentSection={currentSection}
            theme={darkMode ? "dark" : "light"}
            floors={sections} 
            data={siteData.elevator}
            onFloorSelect={handleFloorClick}
            highlightOnMount={highlightElevator}
            onTransitionChange={handleElevatorTransition}
            isButtonTriggered={buttonTriggeredNavigation}
          />
        )}
        
        {isMobile && showMobileTour && (
          <MobileWelcomeTour 
            theme={darkMode ? "dark" : "light"}
            onClose={handleCloseMobileTour}
          />
        )}
        
        {/* Componente TimeMachine */}
        <TimeMachine 
          theme={darkMode ? "dark" : "light"} 
          portfolioVersions={siteData.timemachine} 
        />
      </div>
    </div>
  );
};

export default Portfolio;