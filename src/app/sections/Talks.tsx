import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface Talk {
  id: number;
  title: string;
  event: string;
  date: string;
  location: string;
  description: string;
  videoUrl?: string;
  slidesUrl?: string;
  image?: string;
  featured?: boolean;
}

interface TalksProps {
  theme?: 'dark' | 'light';
}

// Componente optimizado para evitar re-renderizados innecesarios
const Talks: React.FC<TalksProps> = React.memo(({ theme = 'dark' }) => {
  const { t } = useTranslation();
  // Configuración para paginación
  const INITIAL_TALK_COUNT = 3; // Número inicial de charlas regulares a mostrar
  const LOAD_MORE_COUNT = 3; // Número de charlas adicionales a cargar
  
  const [visibleTalkCount, setVisibleTalkCount] = useState(INITIAL_TALK_COUNT);
  const [expandedView, setExpandedView] = useState(false);
  
  // Obtener datos directamente de las traducciones (memoizado)
  const talksData = useMemo(() => {
    return {
      title: t('talks.title'),
      items: t('talks.items', { returnObjects: true }) as Talk[],
      contactText: t('talks.contactText')
    };
  }, [t]);

  // Parsear y ordenar las charlas (memoizado)
  const sortedTalks = useMemo(() => {
    return [...talksData.items].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }, [talksData.items]);

  // Separar charlas destacadas y no destacadas (memoizado)
  const featuredTalks = useMemo(() => {
    return sortedTalks.filter(talk => talk.featured);
  }, [sortedTalks]);
  
  const regularTalks = useMemo(() => {
    return sortedTalks.filter(talk => !talk.featured);
  }, [sortedTalks]);
  
  // Obtener solo las charlas regulares visibles según la paginación (memoizado)
  const visibleRegularTalks = useMemo(() => {
    return regularTalks.slice(0, visibleTalkCount);
  }, [regularTalks, visibleTalkCount]);
  
  // Estado para saber si se han cargado todas las charlas (memoizado)
  const allTalksLoaded = useMemo(() => {
    return visibleTalkCount >= regularTalks.length;
  }, [visibleTalkCount, regularTalks.length]);
  
  // Cargar más charlas (useCallback para evitar recreación)
  const loadMoreTalks = useCallback(() => {
    setVisibleTalkCount(prev => {
      const newCount = prev + LOAD_MORE_COUNT;
      if (newCount >= regularTalks.length) {
        setExpandedView(true);
      }
      return newCount;
    });
  }, [regularTalks.length, LOAD_MORE_COUNT]);
  
  // Colapsar la vista y mostrar solo las charlas iniciales (useCallback para evitar recreación)
  const collapseTalks = useCallback(() => {
    setVisibleTalkCount(INITIAL_TALK_COUNT);
    setExpandedView(false);
    
    // Scroll hacia la sección de charlas con comportamiento nativo
    // para evitar bibliotecas de animación pesadas
    const talksSection = document.getElementById('talks');
    if (talksSection) {
      // Usar scrollIntoView simple sin comportamiento suave para mejorar rendimiento
      talksSection.scrollIntoView({ block: 'start' });
    }
  }, [INITIAL_TALK_COUNT]);

  // Tema condicional para colores
  const isDark = theme === 'dark';
  
  // Estilos pre-calculados para reducir cálculos durante el renderizado
  const themeStyles = useMemo(() => {
    if (isDark) {
      return {
        mainHeading: 'text-white',
        featureHeading: 'text-blue-300',
        regularHeading: 'text-gray-300',
        description: 'text-gray-300',
        buttonBg: 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 hover:border-blue-600',
        footerText: 'text-gray-400',
        linkText: 'text-blue-400 hover:text-blue-300'
      };
    } else {
      return {
        mainHeading: 'text-gray-800',
        featureHeading: 'text-blue-700',
        regularHeading: 'text-gray-700',
        description: 'text-gray-600',
        buttonBg: 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-blue-300',
        footerText: 'text-gray-500',
        linkText: 'text-blue-600 hover:text-blue-500'
      };
    }
  }, [isDark]);

  // Componente de tarjeta de charla memoizado para evitar re-renderizados
  const TalkCard = useCallback(({ talk, isFeatured }: { talk: Talk, isFeatured: boolean }) => {
    // Estilos específicos de las tarjetas pre-calculados
    const cardStyle = isFeatured 
      ? (isDark 
          ? 'bg-blue-900/40 border-blue-700 hover:border-blue-500' 
          : 'bg-blue-50 border-blue-300 hover:border-blue-400'
        )
      : (isDark 
          ? 'bg-gray-800/50 border-gray-700 hover:border-blue-500/50' 
          : 'bg-white/90 border-gray-200 hover:border-blue-400/50'
        );
        
    const layoutStyle = isFeatured ? 'md:col-span-2 lg:col-span-3' : '';
    const gridStyle = isFeatured ? 'grid-cols-1 md:grid-cols-[1fr,2fr]' : 'grid-cols-1';
    const titleSize = isFeatured ? 'md:text-2xl' : '';
    
    const subtitleStyle = isFeatured
      ? (isDark ? 'text-blue-200' : 'text-blue-700')
      : (isDark ? 'text-blue-300' : 'text-blue-600');
      
    const featuredBtnStyle = {
      video: isFeatured ? 'bg-red-700/90 hover:bg-red-800/90' : 'bg-red-600/80 hover:bg-red-700/80',
      slides: isFeatured ? 'bg-blue-700/90 hover:bg-blue-800/90' : 'bg-blue-600/80 hover:bg-blue-700/80'
    };
    
    return (
      <div
        className={`
          ${cardStyle} 
          backdrop-blur-sm rounded-xl p-5 shadow-lg border transition-all duration-300
          ${layoutStyle}
        `}
      >
        <div className={`grid ${gridStyle} gap-5`}>
          {talk.image ? (
            <div className="rounded-lg overflow-hidden h-[150px]">
              <img 
                src={talk.image} 
                alt={talk.title} 
                className="w-full h-full object-cover transform hover:scale-[1.02] duration-300"
                loading="lazy"
                decoding="async"
                width="300"
                height="150"
              />
            </div>
          ) : (
            <div className={`${
              isFeatured
                ? isDark 
                  ? 'bg-gradient-to-r from-blue-800 to-indigo-900' 
                  : 'bg-gradient-to-r from-blue-200 to-indigo-200'
                : isDark 
                  ? 'bg-gradient-to-r from-blue-900 to-purple-900' 
                  : 'bg-gradient-to-r from-blue-100 to-purple-100'
            } rounded-lg flex items-center justify-center p-4 h-[150px]`}>
              <svg className={`w-12 h-12 ${isDark ? 'text-blue-300' : 'text-blue-600'} opacity-70`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          <div className="flex flex-col h-full">
            <div className={`flex flex-wrap items-center text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-1`}>
              <span className="mr-2">{talk.date}</span>
              <span className="hidden sm:inline mx-1">•</span>
              <span className="sm:ml-1">{talk.location}</span>
            </div>
            
            <h3 className={`text-xl ${titleSize} font-bold ${themeStyles.mainHeading} mb-1`}>
              {talk.title}
              {isFeatured && (
                <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">{t('talks.featured')}</span>
              )}
            </h3>
            <h4 className={`text-lg ${subtitleStyle} mb-2`}>{talk.event}</h4>
            
            <p className={`${themeStyles.description} mb-3 text-sm line-clamp-2`}>
              {talk.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-auto">
              {talk.videoUrl && (
                <a 
                  href={talk.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`inline-flex items-center px-3 py-1 ${featuredBtnStyle.video} text-white rounded-lg transition-colors text-sm`}
                >
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
                  </svg>
                  {t('talks.watchVideo')}
                </a>
              )}
              
              {talk.slidesUrl && (
                <a 
                  href={talk.slidesUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`inline-flex items-center px-3 py-1 ${featuredBtnStyle.slides} text-white rounded-lg transition-colors text-sm`}
                >
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  {t('talks.viewSlides')}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }, [isDark, t, themeStyles]);

  // Renderizar componente memoizado
  return (
    <div className="py-10">
      <h2 className={`text-4xl font-bold mb-8 ${themeStyles.mainHeading}`}>{talksData.title}</h2>
      
      {/* Charlas destacadas */}
      {featuredTalks.length > 0 && (
        <div className="mb-8"> 
          <h3 className={`text-xl font-semibold mb-4 ${themeStyles.featureHeading}`}>
            {t('talks.featuredTalks')}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4">
            {featuredTalks.map(talk => (
              <TalkCard key={talk.id} talk={talk} isFeatured={true} />
            ))}
          </div>
        </div>
      )}
      
      {/* Encabezado para charlas regulares */}
      {regularTalks.length > 0 && (
        <h3 className={`text-xl font-semibold mb-4 ${themeStyles.regularHeading}`}>
          {featuredTalks.length > 0 ? t('talks.otherTalks') : t('talks.allTalks')}
        </h3>
      )}
      
      {/* Charlas regulares (paginadas) - optimizadas para evitar recálculos */}
      {regularTalks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> 
          {visibleRegularTalks.map(talk => (
            <TalkCard key={talk.id} talk={talk} isFeatured={false} />
          ))}
        </div>
      )}
      
      {/* Botones para mostrar más/colapsar */}
      {regularTalks.length > INITIAL_TALK_COUNT && (
        <div className="flex justify-center mt-10">
          {!allTalksLoaded ? (
            <button
              onClick={loadMoreTalks}
              className={`px-6 py-3 rounded-xl shadow-lg transition-all flex items-center space-x-2 ${themeStyles.buttonBg}`}
            >
              <span>{t('talks.showMoreTalks')}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          ) : expandedView && (
            <button
              onClick={collapseTalks}
              className={`px-6 py-3 rounded-xl shadow-lg transition-all flex items-center space-x-2 ${themeStyles.buttonBg}`}
            >
              <span>{t('talks.hideTalks')}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
      
      {/* Mensaje que muestra cuántas charlas se están mostrando */}
      {allTalksLoaded && regularTalks.length > INITIAL_TALK_COUNT && expandedView && (
        <div className={`text-center mt-4 ${themeStyles.footerText}`}>
          <p>{t('talks.showingAllTalks', { count: regularTalks.length })}</p>
        </div>
      )}
      
      <div className="mt-10 text-center"> 
        <p className={`${themeStyles.footerText} italic`}>
          {talksData.contactText} <a href="#contact" className={`${themeStyles.linkText} underline`}>{t('talks.contactMe')}</a>
        </p>
      </div>
    </div>
  );
});

export default Talks;
