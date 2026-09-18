import './talks-stage.css';
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from 'framer-motion';

const StageAvatar = React.lazy(() => import('./StageAvatar'));

interface Talk {
  postUrl?: string;
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

interface NewsItem {
  videoId?: string;
  postUrl?: string;
  id: number;
  title: string;
  source: string;
  date: string;
  description: string;
  url: string;
  image?: string;
  featured?: boolean;
}

interface TalksProps {
  theme?: 'dark' | 'light';
}

const Talks: React.FC<TalksProps> = React.memo(({ theme = 'dark' }) => {
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const stageRef = React.useRef<HTMLDivElement>(null);
  const stageVisible = useInView(stageRef, { margin: '200px' });

  // Paginación
  const INITIAL_COUNT = 3;
  const LOAD_MORE_COUNT = 3;

  const [visibleTalkCount, setVisibleTalkCount] = useState(INITIAL_COUNT);
  const [visibleNewsCount, setVisibleNewsCount] = useState(INITIAL_COUNT);
  const [expandedTalks, setExpandedTalks] = useState(false);
  const [expandedNews, setExpandedNews] = useState(false);


  // Datos de Charlas
  const talksData = useMemo(() => {
    return {
      title: t('talks.unifiedTitle', 'Charlas & Medios'),
      subtitle: t('talks.unifiedSubtitle', 'Conferencias técnicas, ponencias magistrales y cobertura en medios'),
      items: (t('talks.items', { returnObjects: true }) as Talk[]) || [],
      contactText: t('talks.contactText', '¿Interesado en una charla o entrevista?')
    };
  }, [t]);

  // Datos de Noticias / Prensa
  const newsData = useMemo(() => {
    return {
      items: (t('news.items', { returnObjects: true }) as NewsItem[]) || []
    };
  }, [t]);

  // Charlas ordenadas y filtradas
  const sortedTalks = useMemo(() => {
    return [...talksData.items].sort((a, b) => {
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      return dateB - dateA;
    });
  }, [talksData.items]);

  const featuredTalks = useMemo(() => sortedTalks.filter(t => t.featured), [sortedTalks]);
  const regularTalks = useMemo(() => sortedTalks.filter(t => !t.featured), [sortedTalks]);
  const visibleRegularTalks = useMemo(() => regularTalks.slice(0, visibleTalkCount), [regularTalks, visibleTalkCount]);
  const allTalksLoaded = visibleTalkCount >= regularTalks.length;

  // Noticias ordenadas y filtradas
  const sortedNews = useMemo(() => {
    return [...newsData.items].sort((a, b) => {
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      return dateB - dateA;
    });
  }, [newsData.items]);

  const featuredNews = useMemo(() => sortedNews.filter(n => n.featured), [sortedNews]);
  const regularNews = useMemo(() => sortedNews.filter(n => !n.featured), [sortedNews]);
  const visibleRegularNews = useMemo(() => regularNews.slice(0, visibleNewsCount), [regularNews, visibleNewsCount]);
  const allNewsLoaded = visibleNewsCount >= regularNews.length;

  // Estilos temáticos
  const themeStyles = useMemo(() => {
    return isDark ? {
      mainHeading: 'text-white',
      subHeading: 'text-gray-400',
      featureHeading: 'text-blue-400',
      regularHeading: 'text-gray-200',
      description: 'text-gray-300',
      cardBg: 'bg-gray-900/70 border-gray-800 hover:border-blue-500/50',
      featuredCardBg: 'bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border-blue-600/40',
      buttonBg: 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700',
      tagBg: 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
    } : {
      mainHeading: 'text-gray-900',
      subHeading: 'text-gray-600',
      featureHeading: 'text-blue-700',
      regularHeading: 'text-gray-800',
      description: 'text-gray-600',
      cardBg: 'bg-white border-gray-200 hover:border-blue-400/60 shadow-sm',
      featuredCardBg: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300',
      buttonBg: 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-50',
      tagBg: 'bg-blue-100 text-blue-800 border border-blue-200'
    };
  }, [isDark]);

  // Handlers de paginación
  const loadMoreTalks = useCallback(() => {
    setVisibleTalkCount(prev => {
      const next = prev + LOAD_MORE_COUNT;
      if (next >= regularTalks.length) setExpandedTalks(true);
      return next;
    });
  }, [regularTalks.length, LOAD_MORE_COUNT]);

  const collapseTalks = useCallback(() => {
    setVisibleTalkCount(INITIAL_COUNT);
    setExpandedTalks(false);
    const el = document.getElementById('talks');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, [INITIAL_COUNT]);

  const loadMoreNews = useCallback(() => {
    setVisibleNewsCount(prev => {
      const next = prev + LOAD_MORE_COUNT;
      if (next >= regularNews.length) setExpandedNews(true);
      return next;
    });
  }, [regularNews.length, LOAD_MORE_COUNT]);

  const collapseNews = useCallback(() => {
    setVisibleNewsCount(INITIAL_COUNT);
    setExpandedNews(false);
    const el = document.getElementById('news');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, [INITIAL_COUNT]);

  return (
    <div className={`talks-stage talks-stage--${theme} py-12`}>

      {/* Cabecera de Sección Unificada */}
      <div className="talks-stage__header flex flex-col gap-5">
        <div>
          <span className="text-xs font-mono font-semibold tracking-wider uppercase text-blue-500 mb-1.5 block">
            // 04 · {t('talks.unifiedTitle', 'Charlas & Medios')}
          </span>
          <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${themeStyles.mainHeading}`}>
            {t('talks.unifiedTitle', 'Charlas & Medios')}
          </h2>
          <p className={`text-sm sm:text-base max-w-2xl mt-1.5 ${themeStyles.subHeading}`}>
            {t('talks.unifiedSubtitle', 'Conferencias técnicas, ponencias magistrales y apariciones en prensa tecnológica')}
          </p>
        </div>



          <div ref={stageRef} className="talks-stage__presentation">
            <div className="talks-stage__main-screen">
              <iframe
                src="https://www.youtube-nocookie.com/embed/fsGnN_xTAxQ"
                title={t('talks.mainPresentation', 'Charla principal')}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
              <a href="https://youtu.be/fsGnN_xTAxQ" target="_blank" rel="noopener noreferrer">
                {t('talks.mainPresentation', 'Charla principal')} · YouTube ↗
              </a>
            </div>
            <div className="talks-stage__presenter" aria-hidden="true">
              <div className="talks-stage__avatar">{stageVisible && <React.Suspense fallback={null}><StageAvatar /></React.Suspense>}</div>
              <div className="talks-stage__podium">
                <span className="talks-stage__podium-mic" />
                <span className="talks-stage__podium-top" />
                <span className="talks-stage__podium-front">BM</span>
                <span className="talks-stage__podium-foot" />
              </div>
            </div>
          </div>
      </div>

      {/* VISTA DE CHARLAS */}
        <div className="space-y-8 animate-fadeIn">
          {/* Charlas destacadas */}
          {featuredTalks.length > 0 && (
            <div className="space-y-4">
              <h3 className={`text-lg font-bold uppercase tracking-wider ${themeStyles.featureHeading}`}>
                {t('talks.featuredTalks', 'Charlas Destacadas')}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4">
                {featuredTalks.map(talk => (
                  <div
                    key={talk.id}
                    className={`talks-stage__screen rounded-xl p-5 shadow-lg border backdrop-blur-sm transition-all duration-300 md:col-span-2 lg:col-span-3 ${themeStyles.featuredCardBg}`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] gap-5">
                      {talk.image ? (
                        <div className="talks-stage__projection rounded-lg overflow-hidden h-[240px] bg-black/40">
                          <img 
                            src={talk.image} 
                            alt={talk.title} 
                            className="w-full h-full object-cover transform hover:scale-[1.02] duration-300"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="rounded-lg flex items-center justify-center p-4 h-[180px] bg-blue-900/30">
                          <svg className="w-12 h-12 text-blue-400 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}

                      <div className="flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-blue-400 mb-1">
                            <span>{talk.date}</span>
                            <span>•</span>
                            <span>{talk.location}</span>
                            <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-600 text-white">
                              {t('talks.featured', 'Destacada')}
                            </span>
                          </div>

                          <h4 className={`text-xl md:text-2xl font-bold ${themeStyles.mainHeading} mb-1`}>
                            {talk.title}
                          </h4>
                          <p className="text-sm font-semibold text-blue-400 mb-2">{talk.event}</p>
                          <p className={`text-sm leading-relaxed ${themeStyles.description}`}>
                            {talk.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-700/40">
                          {talk.postUrl && (
                            <a href={talk.postUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium">
                              {t('news.viewPost')}
                            </a>
                          )}
                          {talk.videoUrl && (
                            <a 
                              href={talk.videoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                              </svg>
                              <span>{t('talks.watchVideo', 'Ver Vídeo')}</span>
                            </a>
                          )}

                          {talk.slidesUrl && (
                            <a 
                              href={talk.slidesUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600/90 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                              </svg>
                              <span>{t('talks.viewSlides', 'Ver Diapositivas')}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charlas regulares */}
          {regularTalks.length > 0 && (
            <div>
              <h3 className={`text-base font-bold uppercase tracking-wider mb-4 ${themeStyles.regularHeading}`}>
                {featuredTalks.length > 0 ? t('talks.otherTalks', 'Otras Conferencias') : t('talks.allTalks', 'Todas las Charlas')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleRegularTalks.map(talk => (
                  <div 
                    key={talk.id} 
                    className={`talks-stage__card rounded-xl p-5 border backdrop-blur-sm transition-all duration-300 flex flex-col justify-between ${themeStyles.cardBg}`}
                  >
                    <div>
                      {talk.image && <img src={talk.image} alt={talk.title} loading="lazy" className="w-full aspect-video object-contain rounded-lg mb-4" />}
                      <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-2">
                        <span>{talk.date}</span>
                        <span>•</span>
                        <span>{talk.location}</span>
                      </div>
                      <h4 className={`text-lg font-bold mb-1 ${themeStyles.mainHeading}`}>{talk.title}</h4>
                      <p className="text-xs font-semibold text-blue-400 mb-2">{talk.event}</p>
                      <p className={`text-xs sm:text-sm leading-relaxed line-clamp-3 mb-4 ${themeStyles.description}`}>
                        {talk.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-800/60 mt-auto">
                      {talk.postUrl && (
                            <a href={talk.postUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium">
                              {t('news.viewPost')}
                            </a>
                          )}
                          {talk.videoUrl && (
                        <a 
                          href={talk.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 px-3 py-1 bg-red-600/80 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          <span>{t('talks.watchVideo', 'Vídeo')}</span>
                        </a>
                      )}
                      {talk.slidesUrl && (
                        <a 
                          href={talk.slidesUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/80 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          <span>{t('talks.viewSlides', 'Diapositivas')}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paginación de charlas */}
          {regularTalks.length > INITIAL_COUNT && (
            <div className="flex justify-center mt-6">
              {!allTalksLoaded ? (
                <button
                  onClick={loadMoreTalks}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${themeStyles.buttonBg}`}
                >
                  {t('talks.showMoreTalks', 'Mostrar más charlas')}
                </button>
              ) : expandedTalks && (
                <button
                  onClick={collapseTalks}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${themeStyles.buttonBg}`}
                >
                  {t('talks.hideTalks', 'Colapsar')}
                </button>
              )}
            </div>
          )}
        </div>
      {/* VISTA DE NOTICIAS & PRENSA */}
        <section id="news" className="talks-newspaper mt-16 scroll-mt-24 space-y-8" aria-labelledby="news-heading">
          <header className="talks-newspaper__masthead"><h3 id="news-heading">{t('talks.tabNews', 'Noticias & Prensa')}</h3><p>{t('news.featuredNews', 'Apariciones Destacadas')}</p></header>
          {/* Noticias destacadas */}
          {featuredNews.length > 0 && (
            <div className="space-y-4">
              <h3 className={`text-lg font-bold uppercase tracking-wider ${themeStyles.featureHeading}`}>
                {t('news.featuredNews', 'Apariciones Destacadas')}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {featuredNews.map(item => (
                  <div
                    key={item.id}
                    className={`talks-stage__screen rounded-xl p-6 border backdrop-blur-sm shadow-lg transition-all ${themeStyles.featuredCardBg}`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[1fr,1.8fr] gap-6">
                      {item.videoId ? (
                        <iframe
                          className="w-full aspect-video rounded-lg self-center"
                          src={`https://www.youtube-nocookie.com/embed/${item.videoId}`}
                          title={item.title}
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      ) : item.image && (
                        <div className="talks-stage__projection rounded-lg overflow-hidden h-[240px] bg-black/40">
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-1.5">
                            <span className="font-semibold">{item.source}</span>
                            {item.date && <><span>•</span><span>{item.date}</span></>}
                          </div>
                          <h4 className={`text-xl sm:text-2xl font-bold mb-2 ${themeStyles.mainHeading}`}>
                            {item.title}
                          </h4>
                          <p className={`text-sm leading-relaxed mb-4 ${themeStyles.description}`}>
                            {item.description}
                          </p>
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors self-start"
                        >
                          <span>{item.videoId ? t('news.watchReport') : t('news.readFullArticle', 'Leer artículo completo')}</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                        {item.postUrl && (
                          <a href={item.postUrl} target="_blank" rel="noopener noreferrer" className="mt-3 text-sm underline underline-offset-4 self-start">
                            {t('news.viewPost')}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Noticias regulares */}
          {regularNews.length > 0 && (
            <div>
              <h3 className={`text-base font-bold uppercase tracking-wider mb-4 ${themeStyles.regularHeading}`}>
                {t('news.otherNews', 'Otras Coberturas en Prensa')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleRegularNews.map(item => (
                  <div
                    key={item.id}
                    className={`talks-stage__card rounded-xl p-5 border backdrop-blur-sm transition-all duration-300 flex flex-col justify-between ${themeStyles.cardBg}`}
                  >
                    <div>
                      {item.image && <img src={item.image} alt={item.title} loading="lazy" className="w-full aspect-video object-contain rounded-lg mb-4" />}
                      <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-2">
                        <span className="font-semibold">{item.source}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                      <h4 className={`text-base sm:text-lg font-bold mb-2 ${themeStyles.mainHeading}`}>
                        {item.title}
                      </h4>
                      <p className={`text-xs sm:text-sm leading-relaxed line-clamp-3 mb-4 ${themeStyles.description}`}>
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-800/60 mt-auto">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <span>{t('news.readArticle', 'Leer en fuente original')}</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paginación de noticias */}
          {regularNews.length > INITIAL_COUNT && (
            <div className="flex justify-center mt-6">
              {!allNewsLoaded ? (
                <button
                  onClick={loadMoreNews}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${themeStyles.buttonBg}`}
                >
                  {t('news.showMoreNews', 'Mostrar más noticias')}
                </button>
              ) : expandedNews && (
                <button
                  onClick={collapseNews}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${themeStyles.buttonBg}`}
                >
                  {t('news.hideNews', 'Colapsar')}
                </button>
              )}
            </div>
          )}
        </section>
      {/* Footer de sección */}
      <div className="mt-12 text-center">
        <p className={`text-xs sm:text-sm italic ${themeStyles.subHeading}`}>
          {talksData.contactText}{' '}
          <a href="#contact" className="text-blue-500 hover:underline font-medium">
            {t('talks.contactMe', 'Contáctame')}
          </a>
        </p>
      </div>
    </div>
  );
});

export default Talks;
