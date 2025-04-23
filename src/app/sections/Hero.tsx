import React, { useEffect, useState, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { track } from '../utils/umami-analytics';
import { getCurrentAge } from '../../utils/age-calculator';

interface HeroProps {
  data: {
    title: string;
    subtitle: string;
    description: string;
    profileImage: string;
    coverImage: string;
    resumeUrl?: string;
    buttons?: {
      text: string;
      url: string;
      type: string;
      external?: boolean;
    }[];
  };
  theme: "light" | "dark";
}

// Memo para evitar re-renderizados innecesarios
const Hero: React.FC<HeroProps> = memo(({ data, theme = "dark" }) => {
  const { t } = useTranslation();
  const isLight = theme === "light";
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    // Verificar si la imagen ya está en caché o cargada
    if (imageRef.current?.complete) {
      setImageLoaded(true);
    }
  }, []);
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  const handleButtonClick = (buttonName: string, url: string) => {
    // Ejecutar el tracking de manera diferida para no bloquear el main thread
    setTimeout(() => {
      track({
        category: 'Hero',
        action: 'ButtonClick',
        label: buttonName
      });
    }, 10);
    
    if (url.startsWith('#')) {
      // Internal navigation
      const element = document.querySelector(url);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
 
  const profileImage = data.profileImage;
  
  return (
    <section className="py-4 md:py-32 min-h-[80vh] md:min-h-[90vh] w-full flex items-center justify-center relative">
      {/* Background elements con menor impacto en el rendimiento */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 md:top-1/4 right-1/4 w-[15rem] md:w-[30rem] h-[15rem] md:h-[30rem] rounded-full ${isLight ? 'bg-blue-50/40' : 'bg-blue-900/10'} blur-3xl opacity-30`} style={{willChange: 'auto'}}></div>
        <div className={`absolute bottom-1/3 left-1/3 w-[10rem] md:w-[20rem] h-[10rem] md:h-[20rem] rounded-full ${isLight ? 'bg-green-50/40' : 'bg-green-900/10'} blur-3xl opacity-30`} style={{willChange: 'auto'}}></div>
        <div className={`absolute bottom-1/4 left-1/4 w-[12rem] md:w-[24rem] h-[12rem] md:h-[24rem] rounded-full ${isLight ? 'bg-purple-50/40' : 'bg-indigo-900/10'} blur-3xl opacity-30`} style={{willChange: 'auto'}}></div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto z-10 px-4 md:px-6 pt-4 md:pt-0">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Profile photo optimizada para LCP */}
          <div className="mb-6 md:mb-12 flex flex-col items-center">
            <div className="mb-4 md:mb-7">
              <div className={`overflow-hidden rounded-full w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 border-2 ${isLight ? 'border-gray-200' : 'border-gray-700'} p-0.5`} style={{contain: 'layout paint'}}>
                <picture> 
                  <source
                    type="image/webp"
                    srcSet={`
                      ${profileImage.replace(/\.(jpg|jpeg|png)$/i, '.webp')}?size=144 144w,
                      ${profileImage.replace(/\.(jpg|jpeg|png)$/i, '.webp')}?size=288 288w
                    `}
                    sizes="(max-width: 640px) 7rem, (max-width: 768px) 8rem, 9rem"
                  />
                  <img 
                    ref={imageRef}
                    src={profileImage} 
                    srcSet={`
                      ${profileImage}?size=144 144w,
                      ${profileImage}?size=288 288w
                    `}
                    sizes="(max-width: 640px) 7rem, (max-width: 768px) 8rem, 9rem"
                    alt="Profile" 
                    className={`object-cover w-full h-full rounded-full ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    onLoad={handleImageLoad}
                    width="144" 
                    height="144"
                  />
                </picture>
              </div>
            </div>

            {/* Optimized heading for LCP con valores width/height explícitos */}
            <h1 
              className={`text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-3 md:mb-4 tracking-tight ${isLight ? 'text-gray-800' : 'text-white'}`}
              style={{
                contentVisibility: 'auto',
                containIntrinsicSize: '0 60px',
              }}
              dangerouslySetInnerHTML={{ __html: t('hero.title') }}
            />
            
            <h2 
              className={`text-lg sm:text-xl md:text-2xl lg:text-3xl mb-4 md:mb-6 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}
            >
              {t('hero.subtitle')}
            </h2>
          </div>
          
          {/* Description con mejor rendimiento */}
            <div 
            className={`max-w-3xl mx-auto mb-10 md:mb-16 p-5 sm:p-6 md:p-8 rounded-xl ${isLight ? 'bg-white/60 backdrop-blur-sm border border-gray-100' : 'bg-gray-800/30 backdrop-blur-sm border border-gray-800'}`}
            style={{
              contentVisibility: 'auto',
              containIntrinsicSize: '0 150px',
            }}
            >
            <p className={`text-base sm:text-lg md:text-xl leading-relaxed ${isLight ? 'text-gray-700' : 'text-gray-200'}`}>
              {t('hero.description').replace('{{age}}', String(getCurrentAge()))}
            </p>
            </div>

          {/* Mobile contact & resume buttons con lazy mounting */}
          {typeof window !== 'undefined' && (
            <motion.div
              className="md:hidden w-full flex flex-col mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, type: "tween" }}
            >
              <div className="flex justify-center gap-3">
                <a 
                  href="#contact" 
                  onClick={() => handleButtonClick('Contact', '#contact')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
                    isLight 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                  } shadow-md`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {t('contact.title')}
                </a>
                
                {data.resumeUrl && (
                  <a 
                    href={data.resumeUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={() => handleButtonClick('Resume', data.resumeUrl || '')}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
                    isLight 
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 2H8a2 2 0 00-2 2v16a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2zM8 0h8a4 4 0 014 4v16a4 4 0 01-4 4H8a4 4 0 01-4-4V4a4 4 0 014-4zm2 6h4v2h-4V6zm0 4h4v2h-4v-2zm0 4h4v2h-4v-2z" />
                    </svg>
                    {t('hero.resumeButton')}
                  </a>
                )}
              </div>
            </motion.div>
          )}

          {/* Scroll indicator - solo cargado en cliente para no afectar LCP */}
          {typeof window !== 'undefined' && (
            <motion.div 
              className="md:hidden mt-2 flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8, type: "tween" }}
            >
              <p className={`text-sm mb-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                {t('hero.scrollDown')}
              </p>
              <motion.div
                animate={{ 
                  y: [0, 8, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke={isLight ? "#4B5563" : "#9CA3AF"} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M19 12l-7 7-7-7"/>
                </svg>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
});

// Nombre explícito para React DevTools
Hero.displayName = 'Hero';

export default Hero;
