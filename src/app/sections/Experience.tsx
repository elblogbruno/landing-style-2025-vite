import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ExperienceItem {
  logo: string;
  title: string;
  company: string;
  companyUrl: string;
  period: string;
  location: string;
  description?: string;
  summary?: string;
  highlights?: string[];
  skills?: string[];
  technologies?: string[];
  moreInfo?: string;
}

interface ExperienceProps {
  theme?: "dark" | "light";
}

type ExperienceItemWithFlags = ExperienceItem & {
  hasDescription: boolean;
  hasMoreInfo: boolean;
  isCurrent: boolean;
};

// Helper to parse moreInfo into structured blocks (e.g. "Architecture & Systems: ...")
const parseMoreInfo = (text: string) => {
  return text
    .split('\n\n')
    .map((b) => b.trim())
    .filter(Boolean)
    .map((block) => {
      const colonIndex = block.indexOf(':');
      if (colonIndex > 0 && colonIndex < 40) {
        return {
          title: block.substring(0, colonIndex).trim(),
          body: block.substring(colonIndex + 1).trim()
        };
      }
      return {
        title: null,
        body: block
      };
    });
};

// Componente de tarjeta de experiencia optimizado y estructurado visualmente
const ExperienceCard = React.memo(({
  index,
  openModal,
  theme,
  item
}: {
  index: number;
  openModal: (index: number) => void;
  theme: "dark" | "light";
  item: ExperienceItemWithFlags;
}) => {
  const { t } = useTranslation();
  
  const isDark = theme === "dark";
  const cardClasses = isDark 
    ? "bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/60 border-gray-800 hover:border-blue-500/40 text-white shadow-xl shadow-black/20" 
    : "bg-white/90 border-gray-200 hover:border-blue-500/40 text-gray-800 shadow-md";
    
  const titleClasses = isDark ? "text-white" : "text-gray-900";
  const metaClasses = isDark ? "text-gray-400" : "text-gray-500";
  const descClasses = isDark ? "text-gray-300" : "text-gray-600";
  const bulletColor = isDark ? "text-blue-400" : "text-blue-600";
  const skillTagClass = isDark
    ? "bg-blue-500/10 text-blue-300 border-blue-500/25"
    : "bg-blue-50 text-blue-700 border-blue-200";

  const displaySkills = item.skills || item.technologies || [];

  return (
    <div 
      className="timeline-item transition-all duration-300"
      style={{ 
        transform: 'translateZ(0)', 
        willChange: 'transform',
        height: 'auto',
        minHeight: '160px',
        containIntrinsicSize: '0 160px',
        contentVisibility: 'auto',
        position: 'relative',
        marginBottom: '1.5rem'
      }}
    >
      <div 
        className={`flex flex-col items-start ${cardClasses} p-5 sm:p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 group`}
        style={{
          contain: 'content',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Cabecera: Logo + Título + Empresa + Metadatos */}
        <div className="flex items-start gap-4 w-full">
          {/* Logo container */}
          <div className="relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 overflow-hidden rounded-xl border border-gray-700/40 bg-black/20 p-1 flex items-center justify-center shadow-inner">
            <img 
              src={item.logo}
              alt={`${item.company} logo`}
              className="object-contain w-full h-full rounded-lg transition-transform duration-300 group-hover:scale-105"
              loading="eager"
              decoding="async"
              width="64"
              height="64"
            />
          </div>
          
          {/* Info principal */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className={`text-lg sm:text-xl font-bold ${titleClasses} tracking-tight group-hover:text-blue-400 transition-colors`}>
                {item.title}
              </h3>
              {item.isCurrent && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t('experience.current', 'Current')}
                </span>
              )}
            </div>
            
            <h4 className="text-base font-semibold text-blue-400 mt-0.5">
              <a 
                href={item.companyUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:underline inline-flex items-center gap-1.5"
              >
                <span>{item.company}</span>
                <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </h4>
            
            <div className={`flex flex-wrap items-center gap-x-3 text-xs sm:text-sm ${metaClasses} mt-1.5`}>
              <span className="inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {item.period}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {item.location}
              </span>
            </div>
          </div>
        </div>

        {/* Resumen conciso (1-2 frases claras) */}
        {(item.summary || item.description) && (
          <p className={`mt-3.5 text-sm sm:text-base ${descClasses} leading-relaxed`}>
            {item.summary || item.description}
          </p>
        )}

        {/* Puntos clave / Highlights técnicos escaneables */}
        {item.highlights && item.highlights.length > 0 && (
          <ul className="mt-3 space-y-1.5 w-full">
            {item.highlights.slice(0, 3).map((highlight, hIdx) => (
              <li key={hIdx} className={`flex items-start gap-2 text-xs sm:text-sm ${descClasses}`}>
                <span className={`${bulletColor} font-bold select-none text-base leading-none`}>›</span>
                <span className="leading-snug">{highlight}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Píldoras de tecnologías (Tech Stack) */}
        {displaySkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3.5 pt-2 w-full">
            {displaySkills.slice(0, 7).map((skill) => (
              <span
                key={skill}
                className={`px-2.5 py-0.5 rounded-md text-xs font-mono border ${skillTagClass} transition-colors`}
              >
                {skill}
              </span>
            ))}
            {displaySkills.length > 7 && (
              <span className={`px-2 py-0.5 rounded-md text-xs font-mono opacity-70 ${skillTagClass}`}>
                +{displaySkills.length - 7}
              </span>
            )}
          </div>
        )}

        {/* Botón de acción: Ver detalles */}
        {(item.hasDescription || item.hasMoreInfo || (item.highlights && item.highlights.length > 3)) && (
          <div className="mt-4 pt-3 border-t border-gray-800/40 w-full flex justify-end">
            <button 
              onClick={() => openModal(index)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium ${
                isDark 
                  ? "bg-blue-600/15 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30" 
                  : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
              } transition-all duration-200 hover:scale-[1.02]`}
            >
              <span>{t('experience.seeMoreDetails', 'Ver arquitectura y detalles')}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => 
  prevProps.index === nextProps.index && 
  prevProps.theme === nextProps.theme && 
  prevProps.item === nextProps.item
);

// Modal de detalles de arquitectura e impacto estructurado
const ExperienceModal = React.memo(({
  isOpen,
  closeModal,
  theme,
  item
}: {
  isOpen: boolean;
  closeModal: () => void;
  theme: "dark" | "light";
  item: ExperienceItemWithFlags | null;
}) => {
  const { t } = useTranslation();
  
  if (!isOpen || !item) return null;
  
  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-gray-900 border border-gray-800 text-white" : "bg-white border border-gray-200 text-gray-800";
  const headerClass = isDark ? "text-gray-200" : "text-gray-800";
  const textClass = isDark ? "text-gray-300" : "text-gray-600";
  const buttonClass = isDark ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-600 hover:bg-blue-700";

  const structuredBlocks = item.moreInfo ? parseMoreInfo(item.moreInfo) : [];
  const displaySkills = item.skills || item.technologies || [];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={closeModal}
    >
      <div 
        className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl ${bgClass} p-6 sm:p-8 shadow-2xl space-y-6`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button 
          onClick={closeModal} 
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors" 
          aria-label={t('experience.close', 'Cerrar')}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Cabecera */}
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-xl border border-gray-700/50 bg-black/20 p-1 flex items-center justify-center">
            <img 
              src={item.logo}
              alt={`${item.company} logo`}
              className="object-contain w-full h-full rounded-lg"
              loading="lazy"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-bold">{item.title}</h3>
              {item.isCurrent && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t('experience.current', 'Current')}
                </span>
              )}
            </div>
            <h4 className="text-lg text-blue-400 font-medium mt-0.5">
              <a href={item.companyUrl} target="_blank" rel="noopener noreferrer" className="hover:underline inline-flex items-center gap-1">
                {item.company}
                <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </h4>
            <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1 flex flex-wrap gap-2`}>
              <span>{item.period}</span>
              <span>•</span>
              <span>{item.location}</span>
            </div>
          </div>
        </div>
        
        {/* Descripción general */}
        {(item.summary || item.description) && (
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/40 border-gray-700/50' : 'bg-blue-50/50 border-blue-100'}`}>
            <h5 className={`text-xs font-bold uppercase tracking-wider text-blue-400 mb-1.5`}>
              {t('experience.overview', 'Resumen ejecutivo')}
            </h5>
            <p className={`${textClass} text-sm sm:text-base leading-relaxed`}>
              {item.summary || item.description}
            </p>
          </div>
        )}

        {/* Highlights / Responsabilidades */}
        {item.highlights && item.highlights.length > 0 && (
          <div>
            <h5 className={`text-sm font-bold uppercase tracking-wider ${headerClass} mb-2.5 flex items-center gap-2`}>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {t('experience.keyAchievements', 'Responsabilidades e impacto clave')}
            </h5>
            <ul className="space-y-2">
              {item.highlights.map((h, i) => (
                <li key={i} className={`flex items-start gap-2.5 text-sm ${textClass}`}>
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="leading-relaxed">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Bloques de arquitectura y especialización técnica */}
        {structuredBlocks.length > 0 && (
          <div className="space-y-3">
            <h5 className={`text-sm font-bold uppercase tracking-wider ${headerClass} mb-2 flex items-center gap-2`}>
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              {t('experience.moreInfo', 'Desglose de arquitectura y sistemas')}
            </h5>
            {structuredBlocks.map((block, bIdx) => (
              <div 
                key={bIdx} 
                className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/30 border-gray-700/50' : 'bg-gray-50 border-gray-200'}`}
              >
                {block.title && (
                  <h6 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    {block.title}
                  </h6>
                )}
                <p className={`text-sm ${textClass} leading-relaxed`}>{block.body}</p>
              </div>
            ))}
          </div>
        )}

        {/* Píldoras de tecnologías completas */}
        {displaySkills.length > 0 && (
          <div>
            <h5 className={`text-xs font-bold uppercase tracking-wider ${headerClass} mb-2`}>
              {t('experience.technologies', 'Tecnologías y herramientas')}
            </h5>
            <div className="flex flex-wrap gap-2">
              {displaySkills.map((skill) => (
                <span
                  key={skill}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono border ${
                    isDark 
                      ? "bg-blue-500/10 text-blue-300 border-blue-500/30" 
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Botón de cierre */}
        <div className="pt-2 text-center">
          <button 
            onClick={closeModal}
            className={`px-5 py-2.5 ${buttonClass} text-white text-sm font-medium rounded-xl transition-colors duration-200 shadow-lg`}
          >
            {t('experience.close', 'Cerrar')}
          </button>
        </div>
      </div>
    </div>
  );
});

// Componente principal Experience
const Experience: React.FC<ExperienceProps> = React.memo(({ theme = "dark" }) => {
  const { t } = useTranslation();
  const INITIAL_ITEM_COUNT = 3;
  
  const [visibleItems, setVisibleItems] = useState(INITIAL_ITEM_COUNT);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Obtener datos de experiencia con banderas y cálculo de actualidad
  const experienceItems: ExperienceItemWithFlags[] = useMemo(() => {
    const items = t('experience.items', { returnObjects: true, defaultValue: [] }) as ExperienceItem[];
    return Array.isArray(items) ? items.map(item => {
      const periodLower = (item.period || '').toLowerCase();
      const isCurrent = periodLower.includes('present') || periodLower.includes('presente');
      return {
        ...item,
        hasDescription: !!item.description && item.description !== '',
        hasMoreInfo: !!item.moreInfo && item.moreInfo !== '',
        isCurrent
      };
    }) : [];
  }, [t]);
  
  const totalItems = experienceItems.length;
  const allItemsLoaded = visibleItems >= totalItems;
  
  // Precarga de logos
  useEffect(() => {
    if (!initialLoadComplete && experienceItems.length > 0) {
      Promise.all(
        experienceItems.slice(0, INITIAL_ITEM_COUNT).map(item => {
          return new Promise<void>((resolve) => {
            if (!item.logo) return resolve();
            const img = new Image();
            img.src = item.logo;
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        })
      ).then(() => {
        setTimeout(() => setInitialLoadComplete(true), 100);
      });
    }
  }, [experienceItems, initialLoadComplete, INITIAL_ITEM_COUNT]);
  
  const openModal = useCallback((index: number) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);
  
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedIndex(null);
    document.body.style.overflow = '';
  }, []);
  
  const showMore = useCallback(() => setVisibleItems(totalItems), [totalItems]);
  
  // Renderizar tarjetas
  const renderCards = () => {
    if (!initialLoadComplete) {
      return Array.from({ length: Math.min(INITIAL_ITEM_COUNT, totalItems) }).map((_, i) => (
        <div 
          key={`placeholder-${i}`}
          className="timeline-item-placeholder" 
          style={{ 
            height: '160px',
            backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)',
            borderRadius: '1rem',
            margin: '1.5rem 0',
            transform: 'translateZ(0)'
          }}
        />
      ));
    }
    
    return experienceItems.slice(0, visibleItems).map((item, index) => (
      <ExperienceCard
        key={`experience-${index}`}
        index={index}
        openModal={openModal}
        theme={theme}
        item={item}
      />
    ));
  };
  
  const selectedItem = selectedIndex !== null ? experienceItems[selectedIndex] : null;
  
  return (
    <div className="md:py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6 sm:mb-8">
          <h2 className={`text-2xl sm:text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            {t('experience.title')}
          </h2>
          <span className={`text-xs sm:text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            {totalItems} {t('experience.rolesCount', 'posiciones y liderazgo técnico')}
          </span>
        </div>
        
        <div 
          className="timeline space-y-6"
          style={{ 
            minHeight: initialLoadComplete ? `${Math.min(totalItems, visibleItems) * 160}px` : 'auto',
            position: 'relative',
            transform: 'translateZ(0)',
            willChange: 'transform',
            overflowAnchor: 'none',
            contentVisibility: 'auto',
            containIntrinsicSize: `0 ${Math.min(totalItems, visibleItems) * 160}px`,
            paddingBottom: '1rem'
          }}
        >
          {renderCards()}
        </div>
        
        {!allItemsLoaded && initialLoadComplete && (
          <div className="text-center mt-6 sm:mt-8">
            <button 
              onClick={showMore}
              className={`px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-medium ${
                theme === "dark" 
                  ? "bg-blue-600/25 text-blue-300 border border-blue-500/40 hover:bg-blue-600/40" 
                  : "bg-blue-500/15 text-blue-700 border border-blue-300 hover:bg-blue-500/25"
              } rounded-xl transition-all duration-300 shadow-md hover:scale-[1.02]`}
            >
              {t('experience.showMore', 'Mostrar más experiencias')}
            </button>
          </div>
        )}
      </div>

      <ExperienceModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        theme={theme}
        item={selectedItem}
      />
    </div>
  );
});

ExperienceCard.displayName = 'ExperienceCard';
ExperienceModal.displayName = 'ExperienceModal';
Experience.displayName = 'Experience';

export default Experience;
