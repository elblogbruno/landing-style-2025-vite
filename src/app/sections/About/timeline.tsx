import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './timeline.css';

// Definición de tipos para los elementos del timeline
interface TimelineItem {
  time: string;
  title: string;
  body: string;
  imgSrc?: string;
  link?: string;
  btnText?: string;
}

interface TimelineProps {
  timeline: TimelineItem[];
  theme?: "dark" | "light";
}

// Componente simple para cada tarjeta del timeline
const TimelineCard: React.FC<{
  item: TimelineItem;
  isActive: boolean;
  onClick: () => void;
  isDark: boolean;
}> = ({ item, isActive, onClick, isDark }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useTranslation();
  
  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Determinar si debemos mostrar el contenido
  const showContent = isMobile ? isActive : (isActive || isHovered);
  
  return (
    <div 
      className={`timeline-card ${isActive ? 'active' : ''} ${isDark ? 'dark' : 'light'}`} 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="timeline-card-image" 
        style={{ backgroundImage: `url(${item.imgSrc})` }}
      >
        <div className="timeline-card-title">
          <h3>{item.title}</h3>
        </div>
        
        {/* Indicador de hover/click para ver más */}
        {!showContent && (
          <div className="timeline-card-hint">
            {isMobile ? (
              <span>{t('common.tapToSeeMore', 'Toca para ver más')}</span>
            ) : (
              <span>{t('common.hoverToSeeMore', 'Hover para ver más')}</span>
            )}
          </div>
        )}
        
        {/* Contenido que se muestra al hacer hover (desktop) o al hacer click (móvil) */}
        {showContent && (
          <div className="timeline-card-content">
            <p>{item.body}</p>
            {item.link && (
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="timeline-card-button"
                onClick={(e) => e.stopPropagation()}
              >
                {item.btnText || 'Ver más'}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente principal del timeline simplificado
export const TimelineAnimation: React.FC<TimelineProps> = ({ timeline, theme = "dark" }) => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isDark = theme === "dark";
  
  const handleCardClick = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  
  return (
    <div className={`timeline-container ${isDark ? 'dark' : 'light'}`}>
      <div className="timeline-header">
        <h1>{t('about.title', 'Mi Trayectoria')}</h1>
        <h2>{t('about.subtitle', 'Un vistazo a mi camino profesional')}</h2>
      </div>
      
      <div className="timeline-cards-scroll">
        <div className="timeline-cards">
          {timeline.map((item, index) => (
            <TimelineCard
              key={index}
              item={item}
              isActive={activeIndex === index}
              onClick={() => handleCardClick(index)}
              isDark={isDark}
            />
          ))}
        </div>
      </div>
      
      <div className="timeline-footer">
        <h3>{t('about.exploreTitle', 'Explora más')}</h3>
        <p>{t('about.exploreDescription', 'Descubre más sobre mi trayectoria profesional')}</p>
        <div className="timeline-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TimelineAnimation;
