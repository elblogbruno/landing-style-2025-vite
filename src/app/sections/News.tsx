import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface NewsItem {
  id: number;
  title: string;
  source: string;
  date: string;
  description: string;
  url: string;
  image?: string;
  featured?: boolean;
}

interface NewsProps {
  theme?: 'dark' | 'light';
}

const News: React.FC<NewsProps> = ({ theme = 'dark' }) => {
  const { t } = useTranslation();
  const isLight = theme === 'light';
  
  // Configuración para paginación
  const INITIAL_NEWS_COUNT = 4; // Número inicial de noticias regulares a mostrar
  const LOAD_MORE_COUNT = 4; // Número de noticias adicionales a cargar
  
  const [visibleNewsCount, setVisibleNewsCount] = useState(INITIAL_NEWS_COUNT);
  const [expandedView, setExpandedView] = useState(false);
  
  // Obtener datos directamente de las traducciones
  const newsData = useMemo(() => {
    return {
      title: t('news.title'),
      items: t('news.items', { returnObjects: true }) as NewsItem[],
      contactText: t('news.contactText')
    };
  }, [t]);
  
  // Parsear y ordenar las noticias
  const sortedNews = useMemo(() => {
    return [...newsData.items].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }, [newsData.items]);

  const featuredNews = useMemo(() => {
    return sortedNews.filter(item => item.featured);
  }, [sortedNews]);
  
  const regularNews = useMemo(() => {
    return sortedNews.filter(item => !item.featured);
  }, [sortedNews]);
  
  // Obtener solo las noticias regulares visibles según la paginación
  const visibleRegularNews = useMemo(() => {
    return regularNews.slice(0, visibleNewsCount);
  }, [regularNews, visibleNewsCount]);
  
  // Estado para saber si se han cargado todas las noticias
  const allNewsLoaded = visibleNewsCount >= regularNews.length;
  
  // Cargar más noticias
  const loadMoreNews = () => {
    const newCount = visibleNewsCount + LOAD_MORE_COUNT;
    setVisibleNewsCount(newCount);
    if (newCount >= regularNews.length) {
      setExpandedView(true);
    }
  };
  
  // Colapsar la vista y mostrar solo las noticias iniciales
  const collapseNews = () => {
    setVisibleNewsCount(INITIAL_NEWS_COUNT);
    setExpandedView(false);
    
    // Scroll hacia la sección de noticias
    const newsSection = document.getElementById('news');
    if (newsSection) {
      newsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`py-12`}>
      <h2 className={`text-4xl font-bold mb-8 ${isLight ? 'text-gray-800' : 'text-white'}`}>{newsData.title}</h2>
      
      {/* Noticias destacadas */}
      {featuredNews.length > 0 && (
        <div className="mb-12 space-y-6">
          {featuredNews.map((item) => (
            <div key={item.id} className={`rounded-xl p-5 shadow-lg backdrop-blur-sm ${
              isLight 
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200' 
                : 'bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-[1fr,1.5fr] gap-6">
                {item.image && (
                  <div className="rounded-lg overflow-hidden max-h-[240px]">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}
                <div className="flex flex-col justify-center">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm mb-3 ${
                    isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {t('news.featured')}
                  </div>
                  <div className={`flex items-center text-sm mb-2 ${
                    isLight ? 'text-blue-600' : 'text-blue-400'
                  }`}>
                    <span className="mr-2">{item.source}</span>
                    <span>•</span>
                    <span className="ml-2">{item.date}</span>
                  </div>
                  <h3 className={`text-2xl font-bold mb-3 ${
                    isLight ? 'text-gray-800' : 'text-white'
                  }`}>{item.title}</h3>
                  <p className={`mb-4 ${
                    isLight ? 'text-gray-600' : 'text-gray-300'
                  }`}>{item.description}</p>
                  <a 
                    href={item.url}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors self-start mt-auto ${
                      isLight ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600/70 hover:bg-blue-700/70'
                    }`}
                  >
                    {t('news.readFullArticle')}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Título para noticias regulares */}
      {regularNews.length > 0 && (
        <h3 className={`text-xl font-semibold mb-6 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
          {featuredNews.length > 0 ? t('news.moreNews') : t('news.allNews')}
        </h3>
      )}
      
      {/* Noticias regulares (paginadas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleRegularNews.map((item) => (
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            key={item.id}
            className={`rounded-xl p-6 shadow-lg transition-all duration-300 flex flex-col h-full ${
              isLight 
                ? 'bg-white border border-gray-200 hover:border-blue-300' 
                : 'bg-gray-800/50 border border-gray-700 hover:border-blue-500/50'
            }`}
          >
            {item.image && (
              <div className="rounded-lg overflow-hidden mb-4 h-48">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transform transition-transform hover:scale-105 duration-300"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )}
            <div className={`flex items-center text-sm mb-2 ${
              isLight ? 'text-blue-600' : 'text-blue-400'
            }`}>
              <span className="mr-2">{item.source}</span>
              <span>•</span>
              <span className="ml-2">{item.date}</span>
            </div>
            <h3 className={`text-xl font-bold mb-3 ${
              isLight ? 'text-gray-800' : 'text-white'
            }`}>{item.title}</h3>
            <p className={`mb-4 flex-grow ${
              isLight ? 'text-gray-600' : 'text-gray-300'
            }`}>{item.description}</p>
            <div className={`inline-flex items-center transition-colors mt-auto ${
              isLight ? 'text-blue-600 hover:text-blue-500' : 'text-blue-400 hover:text-blue-300'
            }`}>
              {t('news.readMore')}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </a>
        ))}
      </div>
      
      {/* Botones para mostrar más/colapsar */}
      {regularNews.length > INITIAL_NEWS_COUNT && (
        <div className="flex justify-center mt-12">
          {!allNewsLoaded ? (
            <button
              onClick={loadMoreNews}
              className={`px-6 py-3 rounded-xl shadow-lg transition-all flex items-center space-x-2 ${
                isLight 
                  ? 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-blue-300' 
                  : 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 hover:border-blue-600'
              }`}
            >
              <span>{t('news.showMoreNews')}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          ) : expandedView && (
            <button
              onClick={collapseNews}
              className={`px-6 py-3 rounded-xl shadow-lg transition-all flex items-center space-x-2 ${
                isLight 
                  ? 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-blue-300' 
                  : 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 hover:border-blue-600'
              }`}
            >
              <span>{t('news.hideNews')}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
      
      {/* Mensaje que muestra cuántas noticias se están mostrando */}
      {allNewsLoaded && regularNews.length > INITIAL_NEWS_COUNT && expandedView && (
        <div className={`text-center mt-4 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
          <p>{t('news.showingAllNews', { count: regularNews.length })}</p>
        </div>
      )}
      
      <div className="mt-10 text-center">
        <p className={`italic ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
          {newsData.contactText} <a href="#contact" className={`underline ${
            isLight ? 'text-blue-600 hover:text-blue-500' : 'text-blue-400 hover:text-blue-300'
          }`}>{t('news.contactMe')}</a>
        </p>
      </div>
    </div>
  );
};

export default News;
