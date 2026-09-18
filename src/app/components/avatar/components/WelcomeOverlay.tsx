import React from 'react';
import { useTranslation } from 'react-i18next';

interface WelcomeOverlayProps {
  show: boolean;
  theme: "dark" | "light";
  onStart: () => void;
}

const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ show, theme, onStart }) => {
  const { t } = useTranslation();
  if (!show) return null;
  const isDark = theme === 'dark';

  return (
    <div className={`elevator-welcome absolute inset-0 flex flex-col items-center justify-center z-[10001] backdrop-blur-sm ${isDark ? 'bg-zinc-900/95 text-zinc-100' : 'bg-white/95 text-zinc-800'}`}>
      <div className="w-full max-w-md text-center px-6">
        <h2 className="text-3xl font-bold mb-3">{t('elevator.overlay.title')}</h2>
        <p className={`text-base mb-8 leading-relaxed max-w-xs mx-auto ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {t('elevator.overlay.subtitle')}
        </p>
        <button
          onClick={onStart}
          className="w-full max-w-xs bg-blue-600 hover:bg-blue-500 text-white font-medium py-4 px-5 rounded-md shadow-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400 text-lg"
        >
          {t('elevator.overlay.enterButton')}
        </button>
      </div>
    </div>
  );
};

export default WelcomeOverlay;
