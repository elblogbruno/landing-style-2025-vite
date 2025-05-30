import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionKey } from '../types';

interface WelcomeOverlayProps {
  show: boolean;
  theme: "dark" | "light";
  onStart: () => void;
  handleFloorClick: (section: SectionKey) => void;
}

// Define the button structure from the translation file
interface OverlayButton {
  text: string;
  url: string;
  type: 'work' | 'contact' | 'resume';
  external: boolean;
}

const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ show, theme, onStart, handleFloorClick }) => {
  const { t } = useTranslation();
  const isDark = theme === "dark";
  
  if (!show) return null;
  
  // Modern color scheme
  const overlayBg = isDark 
    ? 'bg-gradient-to-b from-zinc-900/95 to-zinc-900/98' 
    : 'bg-gradient-to-b from-zinc-50/95 to-white/98';
  const textColor = isDark ? 'text-zinc-100' : 'text-zinc-800';
  // const accentColor = isDark ? 'text-sky-400' : 'text-sky-600';
  const buttonBg = isDark ? 'bg-blue-600' : 'bg-blue-600';
  const buttonHoverBg = isDark ? 'hover:bg-blue-500' : 'hover:bg-blue-500';
  const subtitleColor = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const quickButtonBg = isDark ? 'bg-zinc-800/70' : 'bg-white/70';
  const quickButtonHoverBg = isDark ? 'hover:bg-zinc-700/90' : 'hover:bg-zinc-50/90';
  
  // Get the buttons from translation with proper typing
  const buttons = t('elevator.overlay.buttons', { returnObjects: true }) as OverlayButton[];
  
  // Handle navigation for the quick action buttons
  const handleButtonClick = (url: string, external: boolean) => {
    if (external) {
      // Open external links in a new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // Extract section name from the URL (remove the # symbol)
      const sectionName = url.replace('#', '') as SectionKey;
      
      // Use the elevator's navigation function to properly handle door closing animation
      handleFloorClick(sectionName);
    }
  };
  
  // Icons for quick action buttons
  const getButtonIcon = (type: string) => {
    if (type === 'work') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    } else if (type === 'contact') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    } else if (type === 'resume') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    return null;
  };
  
  return (
    <div 
      className={`absolute inset-0 flex flex-col items-center justify-center z-[10001] ${overlayBg} backdrop-blur-sm`}
    >
      <div className="container max-w-md text-center px-6">
        {/* Title with clean typography */}
        <h2 className={`text-3xl font-bold mb-3 ${textColor}`}>
          {t('elevator.overlay.title')}
        </h2>
        
        {/* Subtitle */}
        <p className={`text-base mb-10 ${subtitleColor} leading-relaxed max-w-xs mx-auto`}>
          {t('elevator.overlay.subtitle')}
        </p>
        
        {/* Interactive elements */}
        <div className="flex flex-col items-center space-y-8">
          {/* Main button */}
          <button 
            onClick={onStart}
            className={`w-full max-w-xs ${buttonBg} ${buttonHoverBg} text-white font-medium py-4 px-8 rounded-md shadow-md transition-all duration-300 hover:shadow-lg focus:outline-none text-lg`}
            aria-label={t('elevator.overlay.enterButton')}
          >
            {t('elevator.overlay.enterButton')}
          </button>
          
          {/* Divider with "or" text */}
          <div className="flex items-center w-full max-w-xs">
            <div className="flex-grow border-t border-zinc-600"></div>
            <span className={`px-4 ${subtitleColor} text-sm`}>{t('elevator.overlay.divider')}</span>
            <div className="flex-grow border-t border-zinc-600"></div>
          </div>
          
          {/* Quick action buttons with vertical icons */}
          <div className="flex justify-center gap-4 w-full max-w-xs">
            {buttons.map((button, index) => (
              <button 
                key={index}
                onClick={() => handleButtonClick(button.url, button.external)}
                className={`${quickButtonBg} ${quickButtonHoverBg} 
                  ${textColor} rounded-md py-3 px-2 transition-all hover:shadow flex flex-col items-center flex-1`}
              >
                {getButtonIcon(button.type)}
                <span className="text-sm">{button.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeOverlay;
