import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

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
  data?: {
    title: string;
    items: ExperienceItem[];
  };
  theme?: "dark" | "light";
}

type TranslateFunction = (key: string, options?: Record<string, unknown>) => string;

// Componente de tarjeta de experiencia optimizado
const ExperienceCard = React.memo(({
  index,
  openModal,
  theme,
  t,
  experienceData // Recibimos los datos precalculados
}: {
  index: number;
  openModal: (index: number) => void;
  theme: "dark" | "light";
  t: TranslateFunction;
  experienceData: {
    title: string;
    company: string;
    companyUrl: string;
    logo: string;
    period: string;
    location: string;
    hasDescription: boolean;
    hasMoreInfo: boolean;
    description?: string;
  }
}) => {
  // Estilos precalculados para evitar recreaciones
  const styles = useMemo(() => ({
    container: `flex flex-col sm:flex-row items-start gap-4 ${theme === "dark" ? "bg-black/20" : "bg-white/80 border border-gray-200"} p-4 sm:p-6 rounded-xl backdrop-blur-sm`,
    title: `text-lg sm:text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"} break-words`,
    textMeta: `flex flex-wrap items-center text-xs sm:text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"} mt-1`,
    description: `mt-2 sm:mt-3 text-sm sm:text-base ${theme === "dark" ? "text-gray-300" : "text-gray-600"} break-words`,
    button: `text-sm ${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"} underline`
  }), [theme]);
  
  // Función para handleClick precalculada
  const handleClick = useCallback(() => {
    openModal(index);
  }, [openModal, index]);

  return (
    <div className="timeline-item">
      <div className={styles.container}>
        <div className="relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 overflow-hidden rounded-lg mb-2 sm:mb-0">
          <img 
            src={experienceData.logo}
            alt={`${experienceData.company} logo`}
            className="object-cover w-full h-full"
            loading="lazy"
            decoding="async"
            width="64"
            height="64"
          />
        </div>
        <div className="w-full min-w-0">
          <h3 className={styles.title}>
            {experienceData.title}
          </h3>
          <h4 className="text-base sm:text-lg text-blue-400">
            <a href={experienceData.companyUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate inline-block max-w-full">
              {experienceData.company}
            </a>
          </h4>
          <div className={styles.textMeta}>
            <span className="inline-block mr-2">
              {experienceData.period}
            </span>
            <span className="inline-block mx-1">•</span>
            <span className="inline-block ml-1">
              {experienceData.location}
            </span>
          </div>
          {experienceData.hasDescription && (
            <p className={styles.description}>
              {experienceData.description}
            </p>
          )}
          {(experienceData.hasDescription || experienceData.hasMoreInfo) && (
            <div className="mt-3">
              <button 
                onClick={handleClick}
                className={styles.button}
              >
                {t('experience.seeMoreDetails')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Optimización adicional: comparación personalizada para React.memo
  return prevProps.index === nextProps.index && 
         prevProps.theme === nextProps.theme && 
         prevProps.experienceData === nextProps.experienceData;
});

ExperienceCard.displayName = 'ExperienceCard';

// Modal de detalles de experiencia memoizado
const ExperienceModal = React.memo(({
  isOpen,
  closeModal,
  theme,
  t,
  experienceData // Recibimos los datos precalculados
}: {
  isOpen: boolean;
  selectedIndex?: number | null; // Marcado como opcional para evitar error
  closeModal: () => void;
  theme: "dark" | "light";
  t: TranslateFunction;
  experienceData: {
    title: string;
    company: string;
    companyUrl: string;
    logo: string;
    period: string;
    location: string;
    hasDescription: boolean;
    hasMoreInfo: boolean;
    description?: string;
    moreInfo?: string;
  } | null;
}) => {
  if (!isOpen || !experienceData) return null;
  
  // Mover useMemo fuera del flujo condicional para evitar errores
  const styles = {
    container: `relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl ${
      theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-800"
    } p-6 shadow-xl`,
    title: `text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`,
    textMeta: `text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`,
    sectionHeader: `text-lg font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-700"} mb-2`,
    text: `${theme === "dark" ? "text-gray-300" : "text-gray-600"}`,
    button: `px-4 py-2 ${
      theme === "dark" 
        ? "bg-blue-600 text-white" 
        : "bg-blue-500 text-white"
    } rounded-md hover:bg-blue-700 transition-colors duration-300`
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={styles.container}>
        <button 
          onClick={closeModal}
          className="absolute top-4 right-4 text-2xl font-bold"
          aria-label={t('experience.close')}
        >
          &times;
        </button>
        
        <div className="flex items-start gap-4 mb-6">
          <div className="relative flex-shrink-0 w-16 h-16 overflow-hidden rounded-lg">
            <img 
              src={experienceData.logo}
              alt={`${experienceData.company} logo`}
              className="object-cover w-full h-full"
              loading="lazy"
              decoding="async"
              width="64"
              height="64"
            />
          </div>
          <div>
            <h3 className={styles.title}>
              {experienceData.title}
            </h3>
            <h4 className="text-lg text-blue-400">
              <a href={experienceData.companyUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {experienceData.company}
              </a>
            </h4>
            <div className={styles.textMeta}>
              {experienceData.period} • {experienceData.location}
            </div>
          </div>
        </div>
        
        {experienceData.hasDescription && (
          <div className="mb-4">
            <h5 className={styles.sectionHeader}>
              {t('experience.description')}
            </h5>
            <p className={styles.text}>
              {experienceData.description}
            </p>
          </div>
        )}
        
        {experienceData.hasMoreInfo && (
          <div>
            <h5 className={styles.sectionHeader}>
              {t('experience.moreInfo')}
            </h5>
            <p className={styles.text}>
              {experienceData.moreInfo}
            </p>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <button 
            onClick={closeModal}
            className={styles.button}
          >
            {t('experience.close')}
          </button>
        </div>
      </div>
    </div>
  );
});

ExperienceModal.displayName = 'ExperienceModal';

const Experience: React.FC<ExperienceProps> = React.memo(({ theme = "dark" }) => {
  const { t } = useTranslation();
  const [visibleItems, setVisibleItems] = useState(3);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExperienceIndex, setSelectedExperienceIndex] = useState<number | null>(null);
  
  // Cachear el número total de experiencias para evitar recálculos
  const totalItems = useMemo(() => {
    let count = 0;
    while (t(`experience.items.${count}.title`, { defaultValue: '' }) !== '') {
      count++;
    }
    return count
  }, [t]);

  // Precalcular todos los datos de experiencia para evitar llamadas repetidas a t()
  const experienceDataItems = useMemo(() => {
    return Array.from({ length: totalItems }).map((_, index) => ({
      title: t(`experience.items.${index}.title`),
      company: t(`experience.items.${index}.company`),
      companyUrl: t(`experience.items.${index}.companyUrl`),
      logo: t(`experience.items.${index}.logo`),
      period: t(`experience.items.${index}.period`),
      location: t(`experience.items.${index}.location`),
      description: t(`experience.items.${index}.description`, { defaultValue: '' }),
      moreInfo: t(`experience.items.${index}.moreInfo`, { defaultValue: '' }),
      hasDescription: t(`experience.items.${index}.description`, { defaultValue: '' }) !== '',
      hasMoreInfo: t(`experience.items.${index}.moreInfo`, { defaultValue: '' }) !== ''
    }));
  }, [totalItems, t]);

  // Usar callbacks para funciones de manejo de eventos
  const showMore = useCallback(() => {
    setVisibleItems(totalItems);
  }, [totalItems]);

  const openModal = useCallback((index: number) => {
    setSelectedExperienceIndex(index);
    setIsModalOpen(true);
    // Evitar scroll cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedExperienceIndex(null);
    // Restaurar scroll
    document.body.style.overflow = '';
  }, []);

  // Memoizar la lista de tarjetas de experiencia para evitar recreaciones
  const experienceCards = useMemo(() => {
    return experienceDataItems.slice(0, visibleItems).map((data, index) => (
      <ExperienceCard
        key={index}
        index={index}
        openModal={openModal}
        theme={theme}
        t={t}
        experienceData={data}
      />
    ));
  }, [visibleItems, experienceDataItems, openModal, theme, t]);

  // Memoizar el botón "Ver más" para evitar recreaciones
  const showMoreButton = useMemo(() => {
    if (visibleItems >= totalItems) return null;
    
    return (
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
    );
  }, [visibleItems, totalItems, showMore, theme, t]);

  // Optimización: solo obtener los datos del elemento seleccionado para el modal
  const selectedExperienceData = useMemo(() => {
    return selectedExperienceIndex !== null ? experienceDataItems[selectedExperienceIndex] : null;
  }, [selectedExperienceIndex, experienceDataItems]);

  return (
    <div className="md:py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className={`text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
          {t('experience.title')}
        </h2>
        
        <div className="timeline space-y-6">
          {experienceCards}
        </div>
        
        {showMoreButton}
      </div>

      {/* Modal memoizado */}
      <ExperienceModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        theme={theme}
        t={t}
        experienceData={selectedExperienceData}
      />
    </div>
  );
});

Experience.displayName = 'Experience';

export default Experience;
