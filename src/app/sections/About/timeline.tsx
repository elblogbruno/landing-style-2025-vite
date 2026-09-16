import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './timeline.css';

export interface TimelineItem {
  time: string;
  era?: string;
  title: string;
  body: string;
  imgSrc?: string;
  link?: string;
  btnText?: string;
  icon?: string;
}

export interface TimelineProps {
  timeline: TimelineItem[];
  theme?: "dark" | "light";
}

// Tarjeta minimalista y tipográfica para cada hito
const MinimalTimelineCard: React.FC<{
  item: TimelineItem;
  index: number;
  isActive: boolean;
  isDark: boolean;
  onSelect: (index: number) => void;
}> = React.memo(({ item, index, isActive, isDark, onSelect }) => {
  const isCurrent = (item.time || '').toLowerCase().includes('present');

  // Extraer citas si existen para darles formato editorial
  const quoteMatch = item.body.match(/«([^»]+)»/);
  const quoteText = quoteMatch ? quoteMatch[1] : null;
  const cleanBody = quoteMatch 
    ? item.body.replace(/«[^»]+»/, '').trim() 
    : item.body;

  const cardBg = isDark
    ? "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 text-zinc-100"
    : "bg-white/85 border-zinc-200 hover:border-zinc-300 text-zinc-850 shadow-sm";

  const activeBorder = isActive
    ? (isDark ? "ring-1 ring-blue-500/70 border-blue-500/50 bg-zinc-900/80" : "ring-1 ring-blue-500/50 border-blue-400 bg-white")
    : "";

  return (
    <article
      data-index={index}
      onClick={() => onSelect(index)}
      className={`minimal-card flex-shrink-0 w-[290px] xs:w-[320px] sm:w-[350px] rounded-xl border ${cardBg} ${activeBorder} p-5 flex flex-col justify-between transition-all duration-200 snap-center sm:snap-start hover:scale-[1.01]`}
      style={{ transform: 'translateZ(0)' }}
    >
      <div>
        {/* Cabecera minimalista: Año + Era */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
            isCurrent
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : isDark ? "bg-zinc-800 text-blue-400 border border-zinc-700/60" : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}>
            {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
            {item.time}
          </span>

          {item.era && (
            <span className={`text-[11px] font-medium tracking-wide uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {item.era}
            </span>
          )}
        </div>

        {/* Título del hito */}
        <h3 className={`text-base sm:text-lg font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          {item.title}
        </h3>

        {/* Cita destacada si existe */}
        {quoteText && (
          <blockquote className={`border-l-2 border-blue-500 pl-3 my-2 text-xs italic ${
            isDark ? 'text-blue-300/90 bg-blue-950/20' : 'text-blue-900 bg-blue-50/50'
          } py-1 rounded-r`}>
            «{quoteText}»
          </blockquote>
        )}

        {/* Narrativa concisa */}
        <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          {cleanBody}
        </p>
      </div>

      {/* Enlace sutil de acción */}
      {item.link && (
        <div className="mt-4 pt-3 border-t border-zinc-800/40 dark:border-zinc-800/60 flex items-center justify-between text-xs">
          <span className="text-[11px] text-zinc-500 font-mono">Hito #{index + 1}</span>
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`inline-flex items-center gap-1 font-medium transition-colors ${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            <span>{item.btnText || 'Ver más'}</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </article>
  );
});

// Componente principal TimelineAnimation con enfoque minimalista y tipográfico
export const TimelineAnimation: React.FC<TimelineProps> = ({ timeline = [], theme = "dark" }) => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [scrollLeft, setScrollLeft] = useState<number>(0);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isDark = theme === "dark";
  const totalItems = timeline.length;

  // Detectar hito activo al hacer scroll
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || totalItems === 0) return;

    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    const cards = container.querySelectorAll<HTMLElement>('.minimal-card');
    
    let closestIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card, idx) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(cardCenter - containerCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = idx;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  }, [totalItems, activeIndex]);

  // Listener de resize
  useEffect(() => {
    const handleResize = () => handleScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleScroll]);

  // Desplazamiento a un hito concreto
  const scrollToMilestone = useCallback((index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cards = container.querySelectorAll<HTMLElement>('.minimal-card');
    const targetCard = cards[index];

    if (targetCard) {
      const targetScroll = targetCard.offsetLeft - (container.clientWidth - targetCard.clientWidth) / 2;
      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth'
      });
      setActiveIndex(index);
    }
  }, []);

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) scrollToMilestone(activeIndex - 1);
  }, [activeIndex, scrollToMilestone]);

  const handleNext = useCallback(() => {
    if (activeIndex < totalItems - 1) scrollToMilestone(activeIndex + 1);
  }, [activeIndex, totalItems, scrollToMilestone]);

  // Mouse Drag Scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const container = scrollContainerRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  };

  // Teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  };

  // Progreso de la línea
  const progressPercentage = useMemo(() => {
    if (totalItems <= 1) return 100;
    return (activeIndex / (totalItems - 1)) * 100;
  }, [activeIndex, totalItems]);

  return (
    <section 
      className={`timeline-minimal-section w-full py-8 sm:py-12 ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={t('about.title', 'Mi Recorrido en Tecnología')}
    >
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Cabecera editorial minimalista */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-blue-500 dark:text-blue-400 mb-1.5 block">
              // 03 · {t('navigation.about', 'Sobre Mí')}
            </span>
            <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {t('about.title', 'Mi Recorrido en Tecnología')}
            </h2>
            <p className={`text-xs sm:text-sm max-w-xl mt-1 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t('about.subtitle', 'Mi camino entre código, hardware y proyectos propios.')}
            </p>
          </div>

          {/* Selector de hito y controles de navegación */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <span className="text-xs font-mono text-zinc-500">
              {activeIndex + 1} / {totalItems}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                disabled={activeIndex === 0}
                aria-label={t('about.previous', 'Hito anterior')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isDark
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 disabled:opacity-25'
                    : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 disabled:opacity-25'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={handleNext}
                disabled={activeIndex === totalItems - 1}
                aria-label={t('about.next', 'Hito siguiente')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isDark
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 disabled:opacity-25'
                    : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 disabled:opacity-25'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* EJE CRONOLÓGICO MINIMALISTA (Track sutil) */}
        <div className="relative mb-6 px-1">
          {/* Línea base estática */}
          <div className={`absolute top-3 left-2 right-2 h-[1px] ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'} z-0`} />

          {/* Línea de progreso coloreada */}
          <div 
            className="absolute top-3 left-2 h-[1px] bg-gradient-to-r from-blue-500 to-indigo-500 z-0 transition-all duration-300 ease-out"
            style={{ width: `calc((100% - 1rem) * ${progressPercentage / 100})` }}
          />

          {/* Nodos interactivos tipo píldora */}
          <div className="relative z-10 flex items-center justify-between">
            {timeline.map((item, idx) => {
              const isNodeActive = idx === activeIndex;
              const isPast = idx <= activeIndex;

              return (
                <button
                  key={idx}
                  onClick={() => scrollToMilestone(idx)}
                  className="group flex flex-col items-center focus:outline-none"
                  aria-label={`${item.time} - ${item.title}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isNodeActive
                      ? 'bg-blue-600 ring-2 ring-blue-500/40 scale-110 shadow-sm'
                      : isPast
                        ? (isDark ? 'bg-zinc-700 text-white' : 'bg-zinc-400 text-white')
                        : (isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-600' : 'bg-zinc-100 border border-zinc-200 text-zinc-400')
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isNodeActive ? 'bg-white' : 'bg-transparent'}`} />
                  </div>

                  <span className={`text-[10px] sm:text-[11px] font-mono mt-1.5 transition-colors ${
                    isNodeActive 
                      ? 'text-blue-500 dark:text-blue-400 font-bold' 
                      : (isDark ? 'text-zinc-500 group-hover:text-zinc-300' : 'text-zinc-400 group-hover:text-zinc-600')
                  }`}>
                    {item.time}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENEDOR DE TARJETAS MINIMALISTAS */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
          className={`minimal-cards-track flex gap-4 py-2 px-1 cursor-grab active:cursor-grabbing ${
            isDragging ? 'is-dragging' : ''
          }`}
          style={{
            transform: 'translateZ(0)',
            willChange: 'scroll-position'
          }}
        >
          {timeline.map((item, index) => (
            <MinimalTimelineCard
              key={index}
              item={item}
              index={index}
              isActive={activeIndex === index}
              isDark={isDark}
              onSelect={scrollToMilestone}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default TimelineAnimation;
