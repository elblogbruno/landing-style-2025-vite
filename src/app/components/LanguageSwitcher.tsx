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
    const activeClass = isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white';
    const inactiveClass = isLight ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-gray-800 text-gray-200 hover:bg-gray-700';
    
    return {
      es: `px-2 py-1 text-sm rounded-md transition-colors ${i18n.language === 'es' ? activeClass : inactiveClass}`,
      en: `px-2 py-1 text-sm rounded-md transition-colors ${i18n.language === 'en' ? activeClass : inactiveClass}`
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
  
  return (
    <div className="flex items-center space-x-2">
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