import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

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

interface AboutProps {
  theme?: "dark" | "light";
}

const About: React.FC<AboutProps> = ({ theme = "dark" }) => {
  const { t } = useTranslation();
  const isDark = theme === "dark";

  // Obtener datos del timeline desde las traducciones
  const rawTimeline = t('about.timeline', { returnObjects: true, defaultValue: [] }) as TimelineItem[];
  const timeline = useMemo(() => Array.isArray(rawTimeline) ? rawTimeline : [], [rawTimeline]);

  // Hito activo seleccionado
  const [activeIdx, setActiveIdx] = useState<number>(0);

  const activeItem: TimelineItem | undefined = timeline[activeIdx];

  const handlePrev = useCallback(() => {
    setActiveIdx((prev) => (prev > 0 ? prev - 1 : timeline.length - 1));
  }, [timeline.length]);

  const handleNext = useCallback(() => {
    setActiveIdx((prev) => (prev < timeline.length - 1 ? prev + 1 : 0));
  }, [timeline.length]);

  // Estilos de tarjeta compartidos para consistencia visual
  const cardBaseStyle = isDark
    ? "bg-zinc-900/70 border-zinc-800/80 backdrop-blur-md shadow-xl text-zinc-100"
    : "bg-white/85 border-zinc-200/90 backdrop-blur-md shadow-lg shadow-zinc-900/5 text-zinc-850";

  return (
    <section 
      className="w-full py-6 sm:py-10" 
      aria-label={t('about.title', 'Todo empezó a los 13')}
    >
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* CABECERA DE PLANTA (03 · SOBRE MÍ) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 dark:bg-blue-400/15 border border-blue-500/25 dark:border-blue-400/25 text-blue-600 dark:text-blue-300 text-xs font-semibold tracking-wide mb-2">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
              </span>
              <span>{t('about.badge', '// 03 · Sobre Mí')}</span>
              <span className="text-[10px] font-mono opacity-60">· +23.5m</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {t('about.title', 'Todo empezó a los 13')}
            </h2>
            <p className={`text-sm sm:text-base max-w-2xl mt-1.5 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {t('about.subtitle', 'Mi camino entre código, hardware y proyectos propios.')}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg border border-zinc-700/40 dark:border-zinc-800 text-zinc-400">
              {t('about.floorBadge', 'Planta 03 · Trayectoria')}
            </span>
          </div>
        </div>

        <p className={`mb-7 rounded-2xl border p-5 sm:p-7 text-base leading-relaxed ${cardBaseStyle}`}>
          {t('about.intro')}
        </p>

        {/* Recorrido cronológico */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* BLOQUE 1: VISOR INTERACTIVO DEL RECORRIDO */}
          <div className={`md:col-span-12 rounded-2xl border p-5 sm:p-7 flex flex-col justify-between ${cardBaseStyle} relative overflow-hidden group`}>
            
            {/* Topbar: Pills selectoras de año y flechas de navegación */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold text-blue-500 dark:text-blue-400">
                    {t('about.exploreTitle', 'Mi historia, paso a paso')}
                  </span>
                  <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                    ({activeIdx + 1}/{timeline.length})
                  </span>
                </div>

                {/* Flechas de navegación prev/next */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrev}
                    aria-label={t('about.previous', 'Hito anterior')}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      isDark 
                        ? 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60' 
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label={t('about.next', 'Hito siguiente')}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      isDark 
                        ? 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60' 
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Botones de píldora para seleccionar cada año */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6">
                {timeline.map((item, idx) => {
                  const isSelected = idx === activeIdx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveIdx(idx)}
                      aria-pressed={isSelected}
                      className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105"
                          : isDark
                            ? "bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                            : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 border border-zinc-200"
                      }`}
                    >
                      {item.time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contenido animado del hito actual */}
            <AnimatePresence mode="wait">
              {activeItem && (
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center"
                >
                  {/* Foto real del hito */}
                  <div className="sm:col-span-5 relative">
                    <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-zinc-700/40 dark:border-zinc-800 bg-zinc-950 shadow-inner group-hover:scale-[1.01] transition-transform duration-300">
                      {activeItem.imgSrc ? (
                        <img
                          src={activeItem.imgSrc}
                          alt={activeItem.title}
                          className="w-full h-full object-contain object-center transition-all duration-500 filter contrast-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600 font-mono text-xs">
                          Foto histórica
                        </div>
                      )}
                      
                      {/* Vignette decorativa */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                      {/* Tag de época superpuesto sobre la imagen */}
                      {activeItem.era && (
                        <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md text-blue-300 border border-white/10">
                          {activeItem.era}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Texto y narrativa */}
                  <div className="sm:col-span-7 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-mono font-bold text-blue-500 dark:text-blue-400">
                          {activeItem.time}
                        </span>
                        {activeItem.era && (
                          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                            · {activeItem.era}
                          </span>
                        )}
                      </div>

                      <h3 className={`text-lg sm:text-xl font-bold tracking-tight mb-2.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {activeItem.title}
                      </h3>

                      <p className={`text-base sm:text-lg leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        {activeItem.body}
                      </p>
                    </div>

                    {/* Botón de acción externa si existe link */}
                    {activeItem.link && (
                      <div className="mt-4 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-end">
                        <a
                          href={activeItem.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                            isDark 
                              ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30' 
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                          }`}
                        >
                          <span>{activeItem.btnText || 'Ver Proyecto'}</span>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
