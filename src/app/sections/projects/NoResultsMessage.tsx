import React from 'react';
import { useTranslation } from 'react-i18next';
import { NoResultsMessageProps } from './types';

const NoResultsMessage: React.FC<NoResultsMessageProps> = ({ onClearFilter, theme }) => {
  const { t } = useTranslation();
  
  return (
    <div className={`${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900/40 border-gray-700/80'} p-8 rounded-xl text-center border shadow-lg backdrop-blur-sm`}> 
      <p className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-300'} mb-4`}>{t('projects.noResults')}</p>
      <button 
        onClick={onClearFilter}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/20"
      >
        {t('projects.clearFilter')}
      </button>
    </div>
  );
};

export default NoResultsMessage;