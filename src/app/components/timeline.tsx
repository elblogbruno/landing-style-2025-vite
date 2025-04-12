"use client";

import { useState, useEffect, useRef, memo } from "react"; 
import { motion, AnimatePresence, animate, useMotionValue } from "framer-motion";
import useMeasure from "react-use-measure";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";

import './timeline.css';

// Definir la interfaz para los elementos del timeline
interface TimelineItem {
  time: string;
  title: string;
  body: string;
  imgSrc?: string;
  link?: string;
  btnText?: string;
  icon?: React.ReactNode;
}

// SVG icons as reusable components to reduce DOM size
const InfoIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
));

const ArrowDownIcon = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 animate-bounce"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 14l-7 7m0 0l-7-7m7 7V3"
    />
  </svg>
));

// Actualizar la firma de TimelineAnimation para usar la interfaz y memoizarla
export const TimelineAnimation = memo(function TimelineAnimation({ timeline, theme }: { timeline: TimelineItem[], theme: string }) {
  const timelineRef = useRef(null);
  const isDark = theme === "dark";
  const { t } = useTranslation();

  // Detectar si el componente está visible para mejorar rendimiento
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
    rootMargin: '100px'
  });

  return (
    <div ref={ref} className="w-full h-auto flex justify-center overflow-hidden" id="timeline">
      <section
        ref={timelineRef}
        className="max-w-4xl w-full flex flex-col items-center px-4 lg:px-8"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className={`text-4xl font-extrabold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('about.title')}
          </h1>
          <h2 className={`text-2xl font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} max-w-2xl mt-4`}>
            {t('about.subtitle')}
          </h2>
        </div>

        {/* Contenedor especial que limita visualmente pero permite overflow */}
        <div className="w-full pt-8 pb-6 overflow-visible relative">
          {/* Solo renderizamos el TimelineComponent cuando está visible o cerca */}
          {inView && <TimelineComponent timeline={timeline} theme={theme} />}
        </div>

        <div className="flex flex-col items-center justify-around gap-4">
          <h1 className={`text-3xl font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'} mt-8`}>
            {t('about.exploreTitle')}
          </h1>

          <p className={`font-medium max-w-xl text-lg text-center ${isDark ? 'text-gray-300' : 'text-gray-700'} mt-4 px-6`}>
            {t('about.exploreDescription')}
          </p>

          <div className="flex items-center justify-center mt-6">
            <ArrowDownIcon />
          </div>
        </div>
      </section>
    </div>
  );
});

// Optimized TimelineItem component to reduce DOM size
const TimelineItem = memo(({ item, theme, onToggle, isActive, index = 0 }: { 
  item: TimelineItem, 
  index?: number,
  theme: string,
  onToggle: () => void,
  isActive: boolean
}) => {
  const isDark = theme === "dark";
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useTranslation();

  // Detectar mobile solo una vez al montar
  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  // On desktop we show overlay on hover, on mobile we use click/tap
  const showOverlay = isMobile ? isActive : (isActive || isHovered);

  return (
    <motion.div 
      className="about-timeline-item-container mb-12"
      initial={{ opacity: 0.8, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="about-timeline-item"
        style={{
          backgroundImage: `url(${item.imgSrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        onClick={onToggle}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        data-img-src={item.imgSrc} // Añadir atributo data para referencias futuras
      >
        {/* Imagen de fondo lazy loading (reemplazando backgroundImage directa) */}
        {item.imgSrc && (
          <img 
            src={item.imgSrc} 
            alt={t(`about.timeline.${index}.title`, item.title)} 
            className="absolute inset-0 w-full h-full object-cover opacity-0" // Oculta pero carga lazy
            loading="lazy"
            decoding="async"
            onLoad={(e) => {
              // Una vez cargada, aplicar como fondo
              const target = e.currentTarget.parentElement;
              if (target) {
                target.style.backgroundImage = `url(${item.imgSrc})`;
              }
            }}
          />
        )}

        <div className="about-timeline-title-overlay">
          <h2 className={`about-timeline-title ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t(`about.timeline.${index}.title`, item.title)}
          </h2>
        </div>

        {/* Mobile tap indicator - only shown if not active on mobile */}
        {isMobile && !isActive && (
          <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white rounded-full p-2 animate-pulse">
            <InfoIcon />
          </div>
        )}

        <AnimatePresence>
          {showOverlay && (
            <motion.div
              className="about-timeline-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="about-timeline-overlay-content">
                <p className="about-timeline-body">{t(`about.timeline.${index}.body`, item.body)}</p>
                {item.link && (
                  <a
                    href={t(`about.timeline.${index}.link`, item.link)}
                    target="_blank"
                    className="about-timeline-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t(`about.timeline.${index}.btnText`)}
                  </a>
                )}
                {/* Close button for mobile */}
                {isMobile && (
                  <button 
                    className="mt-3 text-white bg-gray-700 py-2 px-4 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle();
                    }}
                  >
                    {t('common.close', 'Close')}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

// Optimized TimelineComponent with virtualization
const TimelineComponent = memo(function TimelineComponent({ timeline, theme }: { timeline: TimelineItem[], theme: string }) {
  const isDark = theme === "dark";
  const timelineItems = timeline;

  const FAST_DURATION = 45;
  const SLOW_DURATION = 550;

  const [duration, setDuration] = useState(FAST_DURATION);
  const [containerWidth, setContainerWidth] = useState(0);
  const [ref, bounds] = useMeasure();
  const xTranslation = useMotionValue(0);

  const [mouseOver, setMouseOver] = useState(false);
  const [mustFinish, setMustFinish] = useState(false);
  const [rerender, setRerender] = useState(false);
  const [isMobile, setIsMobile] = useState(false); 
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  // Only render items that are visible or close to being visible
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 5 });

  // Usar un umbral más bajo para reducir cálculos
  const { ref: inViewRef, inView} = useInView({ 
    threshold: 0.2, 
    triggerOnce: false
  });
  
  // Mantener un ref para animaciones activas para poder cancelarlas
  const animationRef = useRef<any>(null);

  // Estado para verificar si está visible para animaciones
  const [isVisible, setIsVisible] = useState(false);
  
  // Guardamos todos los valores activos en refs para evitar re-renders
  const isVisibleRef = useRef(false);
  const inViewRef2 = useRef(false);

  // Calcular dinámicamente la posición inicial
  const containerCenter = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  const startPosition = containerCenter - 150; // 150 es aproximadamente la mitad del ancho de una tarjeta
  const endPosition = -(containerWidth / 2);

  // Handle item click
  const handleItemToggle = (index: number) => {
    setActiveItemIndex(activeItemIndex === index ? null : index);
  };

  // Actualizar refs cuando cambia la visibilidad
  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    inViewRef2.current = inView;
    
    // Solo activar las animaciones cuando es visible
    if (inView) {
      setIsVisible(true);
    } else {
      // Añadir un pequeño retraso para evitar parpadeos
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [inView]);

  // Detect mobile device based on screen width
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Check initially
    checkMobile();
    
    // Set up event listener for resize
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update visible range for mobile scrolling
  useEffect(() => {
    if (isMobile) {
      const timelineEl = document.querySelector('.mobile-scroll-container');
      if (timelineEl) {
        // Update visible range based on scroll position
        const handleScrollUpdate = () => {
          if (!isVisibleRef.current) return; // No procesar si no es visible
          
          const scrollPos = timelineEl.scrollLeft;
          const containerWidth = timelineEl.clientWidth;
          const itemWidth = 300; // Approximate width of item + margin
          
          const startIdx = Math.max(0, Math.floor(scrollPos / itemWidth) - 1);
          const visibleItems = Math.ceil(containerWidth / itemWidth) + 2; // Add buffer
          
          setVisibleRange({
            start: startIdx,
            end: Math.min(timelineItems.length - 1, startIdx + visibleItems)
          });
        };
        
        timelineEl.addEventListener('scroll', handleScrollUpdate);
        
        return () => {
          timelineEl.removeEventListener('scroll', handleScrollUpdate);
        };
      }
    }
  }, [isMobile, timelineItems.length, isVisible]);

  // Calculate container width
  useEffect(() => {
    if (!inView) return; // No actualizar si no está visible
    
    const totalWidth = bounds.width;
    setContainerWidth(totalWidth);
  }, [bounds.width, inView]);

  // Animation effect - optimized to pause when not visible
  useEffect(() => {
    if (isMobile || !inView) return;
    
    if (inView && !mouseOver) {
      xTranslation.set(startPosition);
    } else if (!inView) {
      return;
    }

    // Limpiar cualquier animación previa
    if (animationRef.current) {
      animationRef.current();
      animationRef.current = null;
    }

    // Solo ejecutar animaciones si está visible
    if (!isVisible) return;

    let controls;

    if (mustFinish) {
      controls = animate(xTranslation, [xTranslation.get(), endPosition], {
        ease: "linear",
        duration: duration * (1 - xTranslation.get() / endPosition),
        onComplete: () => {
          setMustFinish(false);
          xTranslation.set(startPosition);
          setRerender(!rerender);
        },
      });
    } else {
      controls = animate(xTranslation, [startPosition, endPosition], {
        ease: "linear",
        duration: duration,
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 0,
        onRepeat: () => {
          xTranslation.set(startPosition);
        },
      });
    }

    // Guardar la función de limpieza
    animationRef.current = controls?.stop;

    return () => {
      if (controls) controls.stop();
    };
  }, [rerender, xTranslation, duration, containerWidth, startPosition, endPosition, mustFinish, inView, mouseOver, isMobile, isVisible]);
  
  // Virtualization for desktop view
  const getVisibleDesktopItems = () => {
    // Skip calculation if not visible
    if (!isVisibleRef.current || !inViewRef2.current) {
      return visibleRange;
    }
    
    // Simple calculation for visible items
    const scrollPosition = xTranslation.get();
    const screenWidth = window.innerWidth;
    const itemWidth = 300; // Approximate width of each item
    
    const startIdx = Math.max(0, Math.floor((-scrollPosition) / itemWidth) - 1);
    const endIdx = Math.min(
      timelineItems.length - 1, 
      Math.ceil((screenWidth - scrollPosition) / itemWidth) + 1
    );
    
    return { start: startIdx, end: endIdx };
  };

  // Mobile view
  if (isMobile) {
    return (
      <div 
        ref={inViewRef}
        className="relative w-full h-auto"
      >
        {/* Mobile scrollable version */}
        <div className="mobile-scroll-container w-full py-4 relative">
          <div 
            ref={ref}
            className={`flex flex-row items-center about-timeline horizontal ${
              isDark ? "about-timeline-dark" : "about-timeline-light"
            } pl-4 pr-16`}
            style={{ minWidth: 'max-content' }} // Force content to be as wide as needed
          >
            {/* Only render visible items for mobile to reduce DOM size */}
            {timelineItems
              .slice(visibleRange.start, visibleRange.end + 1)
              .map((item, i) => {
                const actualIndex = i + visibleRange.start;
                return (
                  <TimelineItem 
                    key={actualIndex} 
                    item={item} 
                    index={actualIndex} 
                    theme={theme}
                    onToggle={() => handleItemToggle(actualIndex)}
                    isActive={activeItemIndex === actualIndex}
                  />
                );
              })}
          </div>
        </div> 
      </div>
    );
  }

  // Desktop view with virtualization - only render if visible
  return (
    <div
      ref={inViewRef}
      className="relative w-full h-[500px] overflow-hidden" 
    >
      {isVisible && (
        <div className="flex justify-center w-full h-full">
          <motion.div
            className="flex flex-row justify-start items-center h-full"
            style={{ x: xTranslation }}
            onHoverStart={() => {
              setMustFinish(true);
              setMouseOver(true); 
              setDuration(SLOW_DURATION);
            }}
            onHoverEnd={() => {
              setMustFinish(false);
              setMouseOver(false);
              setDuration(FAST_DURATION);
            }}
            onUpdate={() => {
              // Actualizar elementos visibles solo si el ratón no está encima
              // y el componente sigue siendo visible
              if (!mouseOver && isVisibleRef.current) {
                const visibleItems = getVisibleDesktopItems();
                if (visibleItems.start !== visibleRange.start || 
                    visibleItems.end !== visibleRange.end) {
                  setVisibleRange(visibleItems);
                }
              }
            }}
          >
            <div
              ref={ref}
              className={`flex flex-row items-center about-timeline horizontal ${
                isDark ? "about-timeline-dark" : "about-timeline-light"
              }`}
            >
              {/* Create placeholder elements for all items, but only render content for visible ones */}
              {timelineItems.map((item, index) => {
                const isVisible = index >= visibleRange.start && index <= visibleRange.end;
                
                if (!isVisible) {
                  // Return empty placeholder with correct size to maintain scrolling
                  return (
                    <div 
                      key={index}
                      className="about-timeline-item-container mb-12"
                      style={{ width: '300px', height: '400px', visibility: 'hidden' }} 
                    />
                  );
                }
                
                return (
                  <TimelineItem 
                    key={index} 
                    item={item} 
                    index={index} 
                    theme={theme}
                    onToggle={() => handleItemToggle(index)}
                    isActive={activeItemIndex === index}
                  />
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
});

export default TimelineComponent;
