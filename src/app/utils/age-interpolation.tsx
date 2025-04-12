import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { getCurrentAge } from '../../utils/age-calculator';

/**
 * Componente que agrega la edad actual calculada dinámicamente a las traducciones
 * Esto permite usar la variable {{age}} en los archivos de traducción
 */
const AgeInterpolation = () => {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    // Calculamos la edad actual basada en la fecha de nacimiento
    const currentAge = getCurrentAge();

    console.log(currentAge);
    
    // Añadimos la interpolación de edad a i18next
    i18n.services.formatter?.add('age', () => {
      return currentAge.toString();
    });
    
  }, [i18n]);
  
  // Este componente no renderiza nada, solo configura i18next
  return null;
};

export default AgeInterpolation;