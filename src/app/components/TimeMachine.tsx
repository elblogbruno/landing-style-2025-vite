import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { track } from '../utils/umami-analytics';

interface PortfolioVersion {
  name: string;
  year: string;
  image: string;
  url: string;
  description: string;
}

interface TimeMachineProps {
  theme: 'dark' | 'light';
  portfolioVersions?: PortfolioVersion[];
}

// Memo-ized TimeMachine component to prevent unnecessary re-renders
const TimeMachine: React.FC<TimeMachineProps> = React.memo(({ theme, portfolioVersions }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [portalActive, setPortalActive] = useState(false);
  
  // Obtener datos desde las traducciones
  const timeMachineData = t('timemachine', { returnObjects: true }) as PortfolioVersion[];
  
  // Usar los datos de las traducciones o los props si están disponibles
  const portfolioData = portfolioVersions || timeMachineData;

  // Uso de useCallback para evitar recreación de funciones
  const handleOpen = useCallback(() => {
    setIsOpen(true);
    
    // Track uso del TimeMachine
    try {
      track({
        category: 'TimeMachine',
        action: 'Open',
        label: 'User opened TimeMachine'
      });
    } catch (_) {
      // Ignore tracking errors
    }
    
    // Activar portal después de un breve retraso para mejor rendimiento
    // Minimiza el solapamiento de animaciones
    setTimeout(() => setPortalActive(true), 300);
  }, []);

  const handleClose = useCallback(() => {
    setPortalActive(false);
    
    // Track cierre del TimeMachine
    try {
      track({
        category: 'TimeMachine',
        action: 'Close',
        label: 'User closed TimeMachine'
      });
    } catch (_) {
      // Ignore tracking errors
    }
    
    setTimeout(() => setIsOpen(false), 300);
  }, []);

  const handleVersionClick = useCallback((url: string) => {
    // Track click en versión específica
    try {
      track({
        category: 'TimeMachine',
        action: 'VersionClick',
        label: url
      });
    } catch (_) {
      // Ignore tracking errors
    }
    
    // Usar un pequeño retraso para permitir que el tracking termine
    setTimeout(() => {
      window.location.href = url;
    }, 50);
  }, []);

  // Portal rings - reducido a solo 2 anillos para mejorar rendimiento
  const portalRings = [
    { delay: 0, duration: 30, size: '90%', opacity: 0.8 },
    { delay: 0.3, duration: 20, size: '60%', opacity: 0.6 }
  ];

  // Manejo optimizado del bloqueo/desbloqueo del scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      // Pequeño retraso antes de restaurar el scroll para evitar parpadeos
      const timer = setTimeout(() => {
        document.body.style.overflow = '';
      }, 200);
      return () => clearTimeout(timer);
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    try {
      localStorage.setItem('timeMachine.visited', 'true');
    } catch (_) {
      // Silenciar error si localStorage no está disponible
    }
  }, []);

  // Renderizado del botón y modal con AnimatePresence
  return (
    <>
      {/* Botón de TimeMachine con animación más simple */}
      <motion.button
        className="fixed bottom-4 md:bottom-12 right-6 md:right-12 z-40 overflow-visible bg-transparent border-none p-0 outline-none"
        onClick={handleOpen}
        whileHover={{ scale: 1.05 }} // Animación reducida
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: { delay: 1, duration: 0.5 }
        }}
      >
        <div className="relative">
          {/* Halo con animación reducida para mejorar rendimiento */}
          <div className={`absolute -inset-3 bg-gradient-to-r 
            ${theme === 'dark' 
              ? 'from-purple-600/30 via-blue-500/30 to-indigo-600/30' 
              : 'from-purple-400/30 via-blue-400/30 to-indigo-400/30'
            } rounded-full blur-md opacity-60`}></div>
          
          {/* Imagen del icono */}
          <img 
            src="/images-webp/time-machine/icon.webp" 
            alt={t('timeMachine.altText')} 
            className="relative w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-md" 
          />
          
          {/* Texto solo visible en desktop */}
          <span className="hidden md:block absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-medium px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/70 to-purple-500/70 text-white whitespace-nowrap">
            {t('timeMachine.buttonLabel')}
          </span>
        </div>
      </motion.button>

      {/* Modal con AnimatePresence - optimizado para rendimiento */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          >
            {/* Background overlay con blur optimizado */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 ${
                theme === 'dark' ? 'bg-black/80' : 'bg-white/70'
              } backdrop-blur`} // Reducido el nivel de blur para mejor rendimiento
              onClick={handleClose}
            />

            {/* Portal effect optimizado */}
            <div className="relative flex items-center justify-center w-full h-full">
              {/* Renderizado condicional de anillos para reducir carga cuando no son visibles */}
              {portalActive && portalRings.map((ring, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{
                    opacity: ring.opacity,
                    rotate: 360,
                    transition: {
                      opacity: { duration: 0.5, delay: ring.delay },
                      rotate: {
                        duration: ring.duration,
                        repeat: Infinity,
                        ease: "linear"
                      }
                    }
                  }}
                  exit={{ opacity: 0 }}
                  style={{ width: ring.size, height: ring.size }}
                  className={`absolute rounded-full border-4 ${
                    theme === 'dark'
                      ? 'border-orange-500/50' 
                      : 'border-purple-600/50'
                  }`}
                />
              ))}

              {/* Partículas mágicas reducidas */}
              {portalActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 0.8,
                    transition: { duration: 0.5 }
                  }}
                  exit={{ opacity: 0 }}
                  className={`absolute w-96 h-96 bg-gradient-radial ${
                    theme === 'dark'
                      ? 'from-blue-500/20 via-purple-500/10 to-transparent'
                      : 'from-blue-400/20 via-purple-400/10 to-transparent'
                  } rounded-full`}
                />
              )}

              {/* Modal principal con optimizaciones */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  transition: { delay: 0.2, duration: 0.4 }
                }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`relative z-10 max-w-5xl w-full mx-4 rounded-2xl overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-black/70 text-white'
                    : 'bg-white/50 text-zinc-800'
                } backdrop-blur-md border border-opacity-30 ${
                  theme === 'dark' 
                    ? 'border-blue-500/30' 
                    : 'border-blue-400/30'
                }`}
              >
                {/* Reducido el uso de overlays decorativos para mejorar rendimiento */}
                
                {/* Shadow border */}
                <div className={`absolute inset-0 rounded-2xl pointer-events-none ${
                  theme === 'dark'
                    ? 'shadow-[inset_0_0_30px_rgba(59,130,246,0.2)]'
                    : 'shadow-[inset_0_0_20px_rgba(96,165,250,0.2)]'
                }`}></div>
                
                {/* Content */}
                <div className="relative z-10 p-6 md:p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-center mb-6">
                    <div className={`flex items-center gap-3 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      <span className="flex h-4 w-4 relative">
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
                      </span>
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                        {t('timeMachine.title')}
                      </h2>
                    </div>
                    
                    <button
                      className={`p-2 rounded-full grid place-items-center ${
                        theme === 'dark'
                          ? 'bg-zinc-800/80 hover:bg-zinc-700/80 text-blue-400 border border-blue-500/30'
                          : 'bg-white/80 hover:bg-blue-50/80 text-blue-600 border border-blue-400/30'
                      } transition-colors`}
                      onClick={handleClose}
                      title={t('timeMachine.closeButtonTitle')}
                      aria-label={t('timeMachine.closeButtonTitle')}
                    >
                      <FaTimes />
                    </button>
                  </div>
                  
                  <div className={`mb-6 pb-6 border-b ${
                    theme === 'dark' ? 'border-zinc-700/50' : 'border-zinc-300/50'
                  }`}>
                    <p className={`text-lg ${
                      theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                    }`}>
                      {t('timeMachine.description')}
                    </p>
                  </div>

                  {/* Portfolio versions grid con optimizaciones */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {portfolioData.map((version, index) => (
                      <div
                        key={index}
                        className={`relative cursor-pointer rounded-xl overflow-hidden flex flex-col h-full ${
                          theme === 'dark'
                            ? 'bg-zinc-900/70 hover:bg-zinc-800/80'
                            : 'bg-white/70 hover:bg-blue-50/80'
                        } backdrop-blur-sm transition-all duration-300 border ${
                          theme === 'dark' ? 'border-blue-500/20' : 'border-blue-400/30'
                        }`}
                        onClick={() => handleVersionClick(version.url)}
                      >
                        {/* Hero portfolio image section - optimizado */}
                        <div className="relative w-full pt-[56.25%] overflow-hidden">
                          {/* Usar loading="lazy" para mejorar rendimiento inicial */}
                          <img
                            loading="lazy"
                            src={version.image}
                            alt={version.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                          />
                          
                          {/* Gradient overlay para mejor texto */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                          
                          {/* Timeline indicator */}
                          <div className={`absolute top-3 right-3 z-10 px-2 py-1 rounded-full text-xs font-bold ${
                            theme === 'dark' 
                              ? 'bg-blue-600/40 text-blue-100 border border-blue-500/50' 
                              : 'bg-blue-500/70 text-white border border-blue-400/50'
                          }`}>
                            {version.year}
                          </div>
                          
                          {/* Version title overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h3 className="text-base font-bold text-white drop-shadow-md line-clamp-1">
                              {version.name}
                            </h3>
                          </div>
                        </div>
                        
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <p 
                            className={`text-xs md:text-sm ${
                              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                            } line-clamp-2`}
                            title={version.description}
                          >
                            {version.description}
                          </p>
                          
                          <div className={`mt-3 pt-2 border-t flex justify-between items-center ${
                            theme === 'dark' ? 'border-zinc-700/40' : 'border-zinc-300/40'
                          }`}>
                            <span className={`text-xs uppercase tracking-wider font-medium ${
                              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                            }`}>
                              {t('timeMachine.viewButton')}
                            </span>
                            
                            <div className={`flex items-center justify-center h-5 w-5 rounded-full ${
                              theme === 'dark' 
                                ? 'bg-blue-500/20 text-blue-300' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              <svg className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className={`mt-8 pt-6 border-t ${
                    theme === 'dark' ? 'border-zinc-700/50' : 'border-zinc-300/50'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div className={`text-xs uppercase tracking-wider font-medium ${
                        theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
                      }`}>
                        {t('timeMachine.coordinatesText')}
                      </div>
                      
                      <div className={`text-xs ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        {t('timeMachine.versionText')}
                      </div>
                    </div>
                    
                    {/* Credits */}
                    <div className={`mt-4 pt-4 border-t border-dashed ${
                      theme === 'dark' ? 'border-zinc-700/30' : 'border-zinc-300/50'
                    }`}>
                      <div className={`flex flex-col gap-1 text-xs ${
                        theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
                      }`}>
                        <p>{t('timeMachine.inspiredBy')} <a 
                          href="https://brittanychiang.com/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`${
                            theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                          } transition-colors`}
                        >
                          Brittany Chiang
                        </a></p>
                        <p>{t('timeMachine.portalEffectCredit')} <a 
                          href="https://codepen.io/jasesmith/pen/qqgvZe" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`${
                            theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                          } transition-colors`}
                        >
                          {t('timeMachine.portalEffectAuthor')}
                        </a></p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

export default TimeMachine;