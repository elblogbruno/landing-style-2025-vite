import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { getCurrentAge } from './utils/age-calculator';

// Importaciones de traducciones
import translationES from './locales/es/translation.json';
import translationEN from './locales/en/translation.json';

// Recursos con las traducciones
const resources = {
  es: {
    translation: translationES
  },
  en: {
    translation: translationEN
  }
};

i18n
  // Carga traducciones bajo demanda
  .use(Backend)
  // Detecta el idioma del usuario
  .use(LanguageDetector)
  // Pasa el objeto i18n a react-i18next
  .use(initReactI18next)
  // Inicializa i18next
  .init({
    resources,
    fallbackLng: 'es', // Idioma predeterminado si no se detecta ninguno
    supportedLngs: ['es', 'en'], // Idiomas soportados
    
    // Opciones comunes de i18next
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // No es necesario para React
    },
    
    detection: {
      // Orden de detección del idioma
      order: ['path', 'localStorage', 'navigator'],
      // Mira primero el segmento de ruta (/es, /en)
      lookupFromPathIndex: 0,
      // Cómo almacenar el idioma detectado
      caches: ['localStorage'],
    },
  });

// IMPORTANTE: Añadir formateadores personalizados DESPUÉS de inicializar i18next
// Añadir el formateador de edad
i18n.services.formatter?.add('age', () => {
  return getCurrentAge().toString();
});

export default i18n;