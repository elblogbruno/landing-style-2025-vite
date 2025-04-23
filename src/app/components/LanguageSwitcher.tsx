import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  theme: "dark" | "light";
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = React.memo(({ theme }) => {
  const { i18n, t } = useTranslation();
  const isLight = theme === 'light';
  
  // Memoizar las clases para evitar recalcularlas en cada render
  const classes = useMemo(() => {
    const containerClass = isLight 
      ? 'bg-gray-100 shadow-sm border border-gray-200' 
      : 'bg-gray-800 border border-gray-700';
    
    const baseButtonClass = 'py-1.5 px-3 text-sm font-medium transition-all duration-200 relative z-10';
    
    const activeClass = isLight 
      ? 'text-blue-600 font-semibold' 
      : 'text-blue-400 font-semibold';
    
    const inactiveClass = isLight 
      ? 'text-gray-600 hover:text-gray-800' 
      : 'text-gray-400 hover:text-gray-200';
    
    return {
      container: `flex items-center rounded-full p-1 relative ${containerClass}`,
      indicator: isLight 
        ? 'bg-white rounded-full shadow-md absolute transition-all duration-300 ease-in-out' 
        : 'bg-gray-700 rounded-full shadow-inner absolute transition-all duration-300 ease-in-out',
      es: `${baseButtonClass} ${i18n.language === 'es' ? activeClass : inactiveClass}`,
      en: `${baseButtonClass} ${i18n.language === 'en' ? activeClass : inactiveClass}`
    };
  }, [i18n.language, isLight]);
  
  // Usar useCallback para evitar recrear estas funciones en cada render
  const changeToSpanish = useCallback(() => {
    if (i18n.language !== 'es') {
      i18n.changeLanguage('es');
      
      // Actualizar la URL para reflejar el idioma
      const currentPath = window.location.pathname;
      const basePath = currentPath.replace(/^\/(es|en)/, '');
      
      window.history.pushState({}, '', basePath || '/');
    }
  }, [i18n]);
  
  const changeToEnglish = useCallback(() => {
    if (i18n.language !== 'en') {
      i18n.changeLanguage('en');
      
      // Actualizar la URL para reflejar el idioma
      const currentPath = window.location.pathname;
      const basePath = currentPath.replace(/^\/(es|en)/, '');
      const newPath = `/en${basePath}`;
      
      window.history.pushState({}, '', newPath);
    }
  }, [i18n]);
  
  // Calcular la posición del indicador de una manera más confiable
  const indicatorStyle = {
    width: 'calc(50% - 4px)',
    height: 'calc(100% - 8px)',
    top: '4px',
    left: i18n.language === 'es' ? '4px' : 'calc(50% + 0px)',
    transform: i18n.language === 'en' ? 'translateX(-4px)' : 'none'
  };
  
  return (
    <div className={classes.container}>
      {/* Indicador visual de selección */}
      <div 
        className={classes.indicator} 
        style={indicatorStyle}
      ></div>
      
      <button
        onClick={changeToSpanish}
        className={classes.es}
        aria-label={t('language.switchToSpanish')}
      >
        ES
      </button>
      <button
        onClick={changeToEnglish}
        className={classes.en}
        aria-label={t('language.switchToEnglish')}
      >
        EN
      </button>
    </div>
  );
});

// Nombre para DevTools
LanguageSwitcher.displayName = 'LanguageSwitcher';

export default LanguageSwitcher;