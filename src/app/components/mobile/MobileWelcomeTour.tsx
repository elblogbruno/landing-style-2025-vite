import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { track } from '../../utils/umami-analytics';
import { useTranslation } from 'react-i18next';

interface MobileWelcomeTourProps {
  theme: "dark" | "light";
  onClose: () => void;
}

const MobileWelcomeTour: React.FC<MobileWelcomeTourProps> = ({ theme, onClose }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // Aumentado a 5 pasos
  
  const isLight = theme === "light";
  
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      
      // Solo registramos la compleción de cada paso, no cada transición
      if (currentStep === totalSteps - 1) {
        track({
          category: 'MobileTour',
          action: 'NextStep',
          label: `Last Step Completed`
        });
      }
    } else {
      handleFinish();
    }
  };
  
  const handleFinish = () => {
    // Registramos la finalización completa del tour
    track({
      category: 'MobileTour',
      action: 'Completed',
      label: `Tour completed fully`
    });
    
    // Store that user has seen the tour
    localStorage.setItem('hasSeenMobileTour', 'true');
    onClose();
  };
  
  const handleSkip = () => {
    // Registramos solo cuando el usuario salta el tour completamente
    track({
      category: 'MobileTour',
      action: 'Skipped',
      label: `Skipped at step ${currentStep} of ${totalSteps}`
    });
    
    // Store that user has seen the tour
    localStorage.setItem('hasSeenMobileTour', 'true');
    onClose();
  };

  const handleSwipeDown = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 50) {
      handleSkip();
    }
  };
  
  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] flex items-end justify-center  backdrop-blur-[2px]">
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", damping: 20 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 10 }}
        dragElastic={0.2}
        onDragEnd={handleSwipeDown}
        className={`w-full max-w-sm rounded-t-xl overflow-hidden ${isLight ? 'bg-white/95' : 'bg-gray-900/95'} shadow-lg`}
      >
        {/* Swipe indicator */}
        <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mt-2 mb-1" />
        
        {/* Tour header */}
        <div className={`px-5 pt-2 pb-3 ${isLight ? 'bg-blue-50/70' : 'bg-blue-900/20'}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-medium ${isLight ? 'text-gray-800' : 'text-white'}`}>
              {t('mobileTour.title')}
            </h3>
            <button 
              onClick={handleSkip}
              className={`rounded-full p-1.5 ${isLight ? 'hover:bg-gray-200' : 'hover:bg-gray-700'}`}
              aria-label={t('mobileTour.skipTour')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Progress indicators */}
          <div className="flex justify-center mt-1 gap-1">
            {[...Array(totalSteps)].map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all ${i + 1 === currentStep 
                  ? `w-5 ${isLight ? 'bg-blue-500' : 'bg-blue-400'}` 
                  : `w-2.5 ${isLight ? 'bg-gray-300' : 'bg-gray-600'}`
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Tour content */}
        <div className="px-5 pt-3 pb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              {currentStep === 1 && (
                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-16 h-16 flex items-center justify-center rounded-full bg-blue-100/70 dark:bg-blue-900/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-9 w-9 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="4" y="2" width="16" height="20" rx="2" />
                      <line x1="12" y1="6" x2="12" y2="18" />
                      <path d="M8 10l4-4 4 4" />
                      <path d="M16 14l-4 4-4-4" />
                    </svg>
                  </div>
                  
                  <div>
                    <h4 className={`text-base font-medium mb-1 ${isLight ? 'text-gray-800' : 'text-white'}`}>
                      {t('mobileTour.step1.title')}
                    </h4>
                    
                    <p className={`${isLight ? 'text-gray-600' : 'text-gray-300'} text-sm`}>
                      {t('mobileTour.step1.description')}
                    </p>
                  </div>
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-16 h-16 relative">
                    <div className={`absolute left-0 top-0 w-12 h-12 rounded-full flex items-center justify-center ${isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/30 text-blue-400'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="4" y="2" width="16" height="20" rx="2" />
                        <line x1="12" y1="6" x2="12" y2="18" />
                        <path d="M8 10l4-4 4 4" />
                        <path d="M16 14l-4 4-4-4" />
                      </svg>
                    </div>
                    
                    {/* <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 ${isLight ? 'text-gray-700' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </div> */}
                  </div>
                  
                  <div>
                    <h4 className={`text-base font-medium mb-1 ${isLight ? 'text-gray-800' : 'text-white'}`}>
                      {t('mobileTour.step2.title')}
                    </h4>
                    
                    <p className={`${isLight ? 'text-gray-600' : 'text-gray-300'} text-sm`}>
                      {t('mobileTour.step2.description')}
                    </p>
                  </div>
                </div>
              )}
              
              {currentStep === 3 && (
                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-16 h-16 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 dark:bg-black p-1">
                      {[6, 5, 4, 3].map(num => (
                        <div 
                          key={num} 
                          className={`w-6 h-6 rounded flex items-center justify-center ${
                            num === 6 
                              ? `${isLight ? 'bg-blue-100 ring-1 ring-blue-500 text-blue-800' : 'bg-blue-900 ring-1 ring-blue-500 text-blue-200'}` 
                              : `${isLight ? 'bg-gray-200 text-gray-800' : 'bg-gray-800 text-gray-200'}`
                          }`}
                        >
                          <span className={`text-xs font-mono font-bold`}>
                            {num}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className={`text-base font-medium mb-1 ${isLight ? 'text-gray-800' : 'text-white'}`}>
                      {t('mobileTour.step3.title')}
                    </h4>
                    
                    <p className={`${isLight ? 'text-gray-600' : 'text-gray-300'} text-sm`}>
                      {t('mobileTour.step3.description')}
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-16 h-16 flex items-center justify-center rounded-full bg-green-100/70 dark:bg-green-900/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-9 w-9 ${isLight ? 'text-green-600' : 'text-green-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <polyline points="8 21 12 17 16 21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                      <path d="M6 7h4" />
                      <path d="M14 7h4" />
                      <path d="M6 11h12" />
                    </svg>
                  </div>
                  
                  <div>
                    <h4 className={`text-base font-medium mb-1 ${isLight ? 'text-gray-800' : 'text-white'}`}>
                      {t('mobileTour.step4.title')}
                    </h4>
                    
                    <p className={`${isLight ? 'text-gray-600' : 'text-gray-300'} text-sm`}>
                      {t('mobileTour.step4.description')}
                    </p>
                  </div>
                </div>
              )}
              
              {currentStep === 5 && (
                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-16 h-16 flex items-center justify-center rounded-full bg-purple-100/70 dark:bg-purple-900/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-9 w-9 ${isLight ? 'text-purple-600' : 'text-purple-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                      <path d="M12 22V19" />
                      <path d="M17 20l-1-2" />
                      <path d="M7 20l1-2" />
                    </svg>
                  </div>
                  
                  <div>
                    <h4 className={`text-base font-medium mb-1 ${isLight ? 'text-gray-800' : 'text-white'}`}>
                      {t('mobileTour.step5.title')}
                    </h4>
                    
                    <p className={`${isLight ? 'text-gray-600' : 'text-gray-300'} text-sm`}>
                      {t('mobileTour.step5.description')}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Actions */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex-grow"></div> {/* Espacio vacío para mantener el layout */}
            
            <div className="flex gap-2">
              <button
                onClick={handleSkip}
                className={`px-3 py-1.5 rounded-lg text-xs ${isLight ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-800'}`}
              >
                {t('mobileTour.skipButton')}
              </button>
              
              <button
                onClick={handleNext}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium ${isLight 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {currentStep < totalSteps ? t('mobileTour.nextButton') : t('mobileTour.gotItButton')}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MobileWelcomeTour;