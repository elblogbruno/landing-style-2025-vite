import React from 'react';
import { useTranslation } from 'react-i18next';

interface ElevatorPlaceholderProps {
  theme: "dark" | "light";
  onLoad?: () => void;
}

const ElevatorPlaceholder: React.FC<ElevatorPlaceholderProps> = ({ theme, onLoad }) => {
  const { t } = useTranslation();
  const isLight = theme === "light";

  // Start loading the real elevator when this component is mounted
  React.useEffect(() => {
    // Simulate checking if the page has fully loaded
    if (document.readyState === 'complete') {
      // If already loaded, wait a short time to ensure smooth UI
      const timer = setTimeout(() => {
        onLoad?.();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // Wait for the page to be fully loaded before loading the elevator
      const handleLoad = () => {
        // Add slight delay to ensure main content is visible first
        const timer = setTimeout(() => {
          onLoad?.();
        }, 1000);
        // Store the timer ID so we can clear it if needed
        return timer;
      };
      
      const timerId = handleLoad();
      window.addEventListener('load', handleLoad);
      
      return () => {
        window.removeEventListener('load', handleLoad);
        // Clear the timer if component unmounts before timer completes
        if (timerId) clearTimeout(timerId);
      };
    }
  }, [onLoad]);

  return (
    <div className={`flex flex-col items-center justify-center h-[600px] w-full ${isLight ? 'bg-gray-100' : 'bg-gray-900'} rounded-lg`}>
      <div className="text-center p-6">
        {/* Elevator icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-16 h-16 mx-auto mb-4 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          <rect x="5" y="3" width="14" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
          <line x1="9" y1="9" x2="9" y2="15" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
          <line x1="15" y1="9" x2="15" y2="15" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        </svg>
        
        {/* Loading indicator */}
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: isLight ? '#3b82f6' : '#60a5fa', borderTopColor: 'transparent' }}></div>
        
        <p className={`text-lg font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} mb-2`}>
          {t('elevator.placeholder.title', 'Elevator Loading')}
        </p>
        <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
          {t('elevator.placeholder.description', 'The interactive elevator will load after the main content')}
        </p>
      </div>
    </div>
  );
};

export default ElevatorPlaceholder;