import React from 'react';
import { motion } from 'framer-motion';
import { track } from '../../../utils/umami-analytics';
import { useTranslation } from 'react-i18next';

interface WelcomeOverlayProps {
  show: boolean;
  theme: "dark" | "light";
  onStart: () => void;
}

const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ show, theme, onStart }) => {
  const { t } = useTranslation();
  
  if (!show) return null;
  
  const isLight = theme === "light";
  
  // Handle start button click with tracking - Este es un evento importante de usuario
  const handleStartClick = () => {
    track({
      category: 'WelcomeOverlay',
      action: 'StartButtonClick',
      label: 'Open elevator doors'
    });
    onStart();
  };

  // Handle external link click with tracking - Solo registrar clics en enlaces importantes
  const handleLinkClick = (index: number) => {
    // Obtener la información del botón desde las traducciones
    const buttonType = t(`elevator.overlay.buttons.${index}.type`);
    const buttonText = t(`elevator.overlay.buttons.${index}.text`);
    const buttonUrl = t(`elevator.overlay.buttons.${index}.url`);
    const isExternal = t(`elevator.overlay.buttons.${index}.external`) === 'true';
    
    // Estos enlaces son acciones principales del usuario que debemos registrar
    track({
      category: 'WelcomeOverlay',
      action: 'LinkClick',
      label: `${buttonType}: ${buttonText}`
    });
    
    if (!isExternal) {
      window.location.href = buttonUrl;
    }
  };
  
  // Determinar cuántos botones hay en la configuración I18N
  const getButtonCount = (): number => {
    // let count = 0;
    // while (true) {
    //   try {
    //     const buttonExists = t(`elevator.overlay.buttons.${count}.text`, { returnObjects: true });
    //     if (!buttonExists) break;
    //     count++;
    //   } catch {
    //     break;
    //   }
    // }
    // return count;
    return 3;
  };
  
  const buttonCount = getButtonCount();
  const buttons = Array.from({ length: buttonCount }, (_, i) => i);
  
  return (
    <div 
      className={`absolute inset-0 flex flex-col items-center justify-center p-7 ${isLight ? "bg-white" : "bg-gray-900"} z-[100] rounded-tl-[12px] rounded-bl-[12px] pointer-events-auto`}
    >
      {/* Header section with title and subtitle - optimized for LCP */}
      <div className="text-center mb-8">
        <h3 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-3">
          {t('elevator.overlay.title')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base mt-2 font-display">
          {t('elevator.overlay.subtitle')}
        </p>
      </div>
       
      {/* Animation wrapper for non-critical content */}
      <motion.div
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {/* Primary action button */}
        <motion.button 
          onClick={handleStartClick}
          className={`px-8 py-4 font-medium rounded-lg text-base md:text-lg ${isLight ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"} text-white transition-colors shadow-md w-full mb-8 cursor-pointer`}
          whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
          whileTap={{ scale: 0.98 }}
        >
          {t('elevator.overlay.enterButton')}
        </motion.button>
        
        {/* Divider */}
        <div className="w-full mb-6">
          <div className="relative flex items-center">
            <div className={`flex-grow border-t ${isLight ? 'border-gray-200' : 'border-gray-700'}`}></div>
            <span className={`px-4 text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('elevator.overlay.divider')}
            </span>
            <div className={`flex-grow border-t ${isLight ? 'border-gray-200' : 'border-gray-700'}`}></div>
          </div>
        </div>
        
        {/* Alternative navigation options */}
        <div className="flex justify-center gap-3 w-full">
          {buttons.map((index) => {
            const buttonType = t(`elevator.overlay.buttons.${index}.type`);
            const buttonText = t(`elevator.overlay.buttons.${index}.text`);
            const buttonUrl = t(`elevator.overlay.buttons.${index}.url`);
            const isExternal = t(`elevator.overlay.buttons.${index}.external`) === 'true';
            
            return (
              <motion.a 
                key={index}
                href={buttonUrl}
                onClick={(e) => {
                  if (!isExternal) {
                    e.preventDefault();
                    handleLinkClick(index);
                  } else {
                    handleLinkClick(index);
                  }
                }}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className={`flex-1 px-3 py-2 rounded-lg text-center text-xs md:text-sm ${
                  isLight
                    ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                } cursor-pointer`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex flex-col items-center justify-center">
                  <span className="text-lg mb-1">
                    {buttonType === 'work' && '💼'}
                    {buttonType === 'contact' && '📬'}
                    {buttonType === 'resume' && '📄'}
                  </span>
                  <span>{buttonText}</span>
                </span>
              </motion.a>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeOverlay;
