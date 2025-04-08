import React, { useState, useMemo } from 'react';

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
  data: {
    title: string;
    items: Talk[];
    contactText: string;
  };
  theme?: 'dark' | 'light';
}

const Talks: React.FC<TalksProps> = ({ data, theme = 'dark' }) => {
  // Configuración para paginación
  const INITIAL_TALK_COUNT = 3; // Número inicial de charlas regulares a mostrar
  const LOAD_MORE_COUNT = 3; // Número de charlas adicionales a cargar
  
  const [visibleTalkCount, setVisibleTalkCount] = useState(INITIAL_TALK_COUNT);
  const [expandedView, setExpandedView] = useState(false);
  
  // Parsear y ordenar las charlas
  const sortedTalks = useMemo(() => {
    return [...data.items].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }, [data.items]);

  // Separar charlas destacadas y no destacadas
  const featuredTalks = useMemo(() => {
    return sortedTalks.filter(talk => talk.featured);
  }, [sortedTalks]);
  
  const regularTalks = useMemo(() => {
    return sortedTalks.filter(talk => !talk.featured);
  }, [sortedTalks]);
  
  // Obtener solo las charlas regulares visibles según la paginación
  const visibleRegularTalks = useMemo(() => {
    return regularTalks.slice(0, visibleTalkCount);
  }, [regularTalks, visibleTalkCount]);
  
  // Estado para saber si se han cargado todas las charlas
  const allTalksLoaded = visibleTalkCount >= regularTalks.length;
  
  // Cargar más charlas
  const loadMoreTalks = () => {
    const newCount = visibleTalkCount + LOAD_MORE_COUNT;
    setVisibleTalkCount(newCount);
    if (newCount >= regularTalks.length) {
      setExpandedView(true);
    }
  };
  
  // Colapsar la vista y mostrar solo las charlas iniciales
  const collapseTalks = () => {
    setVisibleTalkCount(INITIAL_TALK_COUNT);
    setExpandedView(false);
    
    // Scroll hacia la sección de charlas
    const talksSection = document.getElementById('talks');
    if (talksSection) {
      talksSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Tema condicional para colores
  const isDark = theme === 'dark';

  // Función para renderizar una charla
  const renderTalk = (talk: Talk, isFeatured: boolean) => (
    <div
      key={talk.id}
      className={`${
        isFeatured 
          ? isDark 
            ? 'bg-blue-900/40 border-blue-700 hover:border-blue-500' 
            : 'bg-blue-50 border-blue-300 hover:border-blue-400' 
          : isDark 
            ? 'bg-gray-800/50 border-gray-700 hover:border-blue-500/50' 
            : 'bg-white/90 border-gray-200 hover:border-blue-400/50'
      } 
      backdrop-blur-sm rounded-xl p-5 shadow-lg border transition-all duration-300
      ${isFeatured ? 'md:col-span-2 lg:col-span-3' : ''}`}
    >
      <div className={`grid ${isFeatured ? 'grid-cols-1 md:grid-cols-[1fr,2fr]' : 'grid-cols-1'} gap-5`}>
        {talk.image ? (
          <div className="rounded-lg overflow-hidden h-[150px]">
            <img 
              src={talk.image} 
              alt={talk.title} 
              className="w-full h-full object-cover transform transition-transform hover:scale-105 duration-300"
              loading="lazy"
              decoding="async"
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
          <h3 className={`text-xl ${isFeatured ? 'md:text-2xl' : ''} font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-1`}>
            {talk.title}
            {isFeatured && (
              <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Destacado</span>
            )}
          </h3>
          <h4 className={`text-lg ${
            isFeatured
              ? isDark 
                ? 'text-blue-200' 
                : 'text-blue-700'
              : isDark 
                ? 'text-blue-300' 
                : 'text-blue-600'
          } mb-2`}>{talk.event}</h4>
          
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-3 text-sm line-clamp-2`}>
            {talk.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mt-auto">
            {talk.videoUrl && (
              <a 
                href={talk.videoUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`inline-flex items-center px-3 py-1 ${
                  isFeatured
                    ? 'bg-red-700/90 hover:bg-red-800/90'
                    : 'bg-red-600/80 hover:bg-red-700/80'
                } text-white rounded-lg transition-colors text-sm`}
              >
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Ver Video
              </a>
            )}
            
            {talk.slidesUrl && (
              <a 
                href={talk.slidesUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`inline-flex items-center px-3 py-1 ${
                  isFeatured
                    ? 'bg-blue-700/90 hover:bg-blue-800/90'
                    : 'bg-blue-600/80 hover:bg-blue-700/80'
                } text-white rounded-lg transition-colors text-sm`}
              >
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Ver Slides
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="py-10"> 
      <h2 className={`text-4xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-800'}`}>{data.title}</h2>
      
      {/* Charlas destacadas */}
      {featuredTalks.length > 0 && (
        <div className="mb-8"> 
          <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
            Charlas destacadas
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4">
            {featuredTalks.map(talk => renderTalk(talk, true))}
          </div>
        </div>
      )}
      
      {/* Encabezado para charlas regulares */}
      {regularTalks.length > 0 && (
        <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {featuredTalks.length > 0 ? 'Otras charlas' : 'Todas las charlas'}
        </h3>
      )}
      
      {/* Charlas regulares (paginadas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> 
        {visibleRegularTalks.map(talk => renderTalk(talk, false))}
      </div>
      
      {/* Botones para mostrar más/colapsar */}
      {regularTalks.length > INITIAL_TALK_COUNT && (
        <div className="flex justify-center mt-10">
          {!allTalksLoaded ? (
            <button
              onClick={loadMoreTalks}
              className={`px-6 py-3 rounded-xl shadow-lg transition-all flex items-center space-x-2 ${
                isDark 
                  ? 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 hover:border-blue-600' 
                  : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-blue-300'
              }`}
            >
              <span>Mostrar más charlas</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          ) : expandedView && (
            <button
              onClick={collapseTalks}
              className={`px-6 py-3 rounded-xl shadow-lg transition-all flex items-center space-x-2 ${
                isDark 
                  ? 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 hover:border-blue-600' 
                  : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-blue-300'
              }`}
            >
              <span>Ocultar charlas</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
      
      {/* Mensaje que muestra cuántas charlas se están mostrando */}
      {allTalksLoaded && regularTalks.length > INITIAL_TALK_COUNT && expandedView && (
        <div className={`text-center mt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>Mostrando todas las {regularTalks.length} charlas</p>
        </div>
      )}
      
      <div className="mt-10 text-center"> 
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} italic`}>
          {data.contactText} <a href="#contact" className={`${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} underline`}>¡Contáctame!</a>
        </p>
      </div>
    </div>
  );
};

export default Talks;
