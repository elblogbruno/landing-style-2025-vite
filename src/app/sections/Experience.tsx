import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Interfaces simplificadas
interface ExperienceItem {
  logo: string;
  title: string;
  company: string;
  companyUrl: string;
  period: string;
  location: string;
  description?: string;
  moreInfo?: string;
}

interface ExperienceProps {
  theme?: "dark" | "light";
}

type ExperienceItemWithFlags = ExperienceItem & {
  hasDescription: boolean;
  hasMoreInfo: boolean;
};

// Componente de tarjeta de experiencia optimizado
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
  
  // Estilos de tarjeta simplificados
  const cardClasses = theme === "dark" 
    ? "bg-black/20 text-white" 
    : "bg-white/80 border border-gray-200 text-gray-800";
    
  const titleClasses = theme === "dark" ? "text-white" : "text-gray-800";
  const metaClasses = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const descClasses = theme === "dark" ? "text-gray-300" : "text-gray-600";
  const buttonClasses = theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500";

  return (
    <div className="timeline-item" style={{ 
      transform: 'translateZ(0)', 
      willChange: 'transform',
      height: 'auto',
      minHeight: '150px',
      containIntrinsicSize: '0 150px',
      contentVisibility: 'auto',
      position: 'relative',
      marginBottom: '1.5rem'
    }}>
      <div className={`flex flex-col sm:flex-row items-start gap-4 ${cardClasses} p-4 sm:p-6 rounded-xl backdrop-blur-sm`}
        style={{
          contain: 'content',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          WebkitFontSmoothing: 'antialiased',
          position: 'relative',
          zIndex: 1
        }}>
        
        {/* Logo */}
        <div className="relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 overflow-hidden rounded-lg mb-2 sm:mb-0">
          <img 
            src={item.logo}
            alt={`${item.company} logo`}
            className="object-cover w-full h-full"
            loading="eager"
            decoding="async"
            width="64"
            height="64"
          />
        </div>
        
        {/* Contenido */}
        <div className="w-full min-w-0">
          <h3 className={`text-lg sm:text-xl font-bold ${titleClasses} break-words`}>{item.title}</h3>
          
          <h4 className="text-base sm:text-lg text-blue-400">
            <a href={item.companyUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate inline-block max-w-full">
              {item.company}
            </a>
          </h4>
          
          <div className={`flex flex-wrap items-center text-xs sm:text-sm ${metaClasses} mt-1`}>
            <span className="inline-block mr-2">{item.period}</span>
            <span className="inline-block mx-1">•</span>
            <span className="inline-block ml-1">{item.location}</span>
          </div>
          
          {item.hasDescription && (
            <p className={`mt-2 sm:mt-3 text-sm sm:text-base ${descClasses} break-words`}>{item.description}</p>
          )}
          
          {(item.hasDescription || item.hasMoreInfo) && (
            <div className="mt-3">
              <button 
                onClick={() => openModal(index)}
                className={`text-sm ${buttonClasses} underline`}
              >
                {t('experience.seeMoreDetails')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => 
  prevProps.index === nextProps.index && 
  prevProps.theme === nextProps.theme && 
  prevProps.item === nextProps.item
);

// Modal de detalles simplificado
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
  
  const bgClass = theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-800";
  const headerClass = theme === "dark" ? "text-gray-200" : "text-gray-700";
  const textClass = theme === "dark" ? "text-gray-300" : "text-gray-600";
  const buttonClass = theme === "dark" ? "bg-blue-600" : "bg-blue-500";
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl ${bgClass} p-6 shadow-xl`}>
        {/* Botón cerrar */}
        <button onClick={closeModal} className="absolute top-4 right-4 text-2xl font-bold" aria-label={t('experience.close')}>
          &times;
        </button>
        
        {/* Cabecera */}
        <div className="flex items-start gap-4 mb-6">
          <div className="relative flex-shrink-0 w-16 h-16 overflow-hidden rounded-lg">
            <img 
              src={item.logo}
              alt={`${item.company} logo`}
              className="object-cover w-full h-full"
              loading="lazy"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold">{item.title}</h3>
            <h4 className="text-lg text-blue-400">
              <a href={item.companyUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {item.company}
              </a>
            </h4>
            <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              {item.period} • {item.location}
            </div>
          </div>
        </div>
        
        {/* Descripción */}
        {item.hasDescription && (
          <div className="mb-4">
            <h5 className={`text-lg font-semibold ${headerClass} mb-2`}>{t('experience.description')}</h5>
            <p className={textClass}>{item.description}</p>
          </div>
        )}
        
        {/* Información adicional */}
        {item.hasMoreInfo && (
          <div>
            <h5 className={`text-lg font-semibold ${headerClass} mb-2`}>{t('experience.moreInfo')}</h5>
            <p className={textClass}>{item.moreInfo}</p>
          </div>
        )}
        
        {/* Botón de cierre */}
        <div className="mt-6 text-center">
          <button 
            onClick={closeModal}
            className={`px-4 py-2 ${buttonClass} text-white rounded-md hover:bg-blue-700 transition-colors duration-300`}
          >
            {t('experience.close')}
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
  
  // Estados simplificados
  const [visibleItems, setVisibleItems] = useState(INITIAL_ITEM_COUNT);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Obtener datos de experiencia
  const experienceItems: ExperienceItemWithFlags[] = useMemo(() => {
    const items = t('experience.items', { returnObjects: true, defaultValue: [] }) as ExperienceItem[];
    return Array.isArray(items) ? items.map(item => ({
      ...item,
      hasDescription: !!item.description && item.description !== '',
      hasMoreInfo: !!item.moreInfo && item.moreInfo !== ''
    })) : [];
  }, [t]);
  
  const totalItems = experienceItems.length;
  const allItemsLoaded = visibleItems >= totalItems;
  
  // Precarga de imágenes
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
        // Pequeña demora para evitar parpadeos
        setTimeout(() => setInitialLoadComplete(true), 100);
      });
    }
  }, [experienceItems, initialLoadComplete, INITIAL_ITEM_COUNT]);
  
  // Handlers
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
            height: '150px',
            backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)',
            borderRadius: '0.75rem',
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
  
  // Selected item for modal
  const selectedItem = selectedIndex !== null ? experienceItems[selectedIndex] : null;
  
  return (
    <div className="md:py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className={`text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
          {t('experience.title')}
        </h2>
        
        <div 
          className="timeline space-y-6"
          style={{ 
            minHeight: initialLoadComplete ? `${Math.min(totalItems, visibleItems) * 150}px` : 'auto',
            position: 'relative',
            transform: 'translateZ(0)',
            willChange: 'transform',
            overflowAnchor: 'none',
            contentVisibility: 'auto',
            containIntrinsicSize: `0 ${Math.min(totalItems, visibleItems) * 150}px`,
            paddingBottom: '1rem'
          }}
        >
          {renderCards()}
        </div>
        
        {!allItemsLoaded && initialLoadComplete && (
          <div className="text-center mt-6 sm:mt-8">
            <button 
              onClick={showMore}
              className={`px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base ${
                theme === "dark" 
                  ? "bg-blue-600/30 text-blue-300 border border-blue-500" 
                  : "bg-blue-500/20 text-blue-700 border border-blue-300"
              } rounded-md hover:bg-blue-600/50 transition-colors duration-300`}
            >
              {t('experience.showMore')}
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
