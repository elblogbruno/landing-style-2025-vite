import React from 'react';
import { ActiveFilterBadgeProps } from './types';

const ActiveFilterBadge: React.FC<ActiveFilterBadgeProps> = ({ activeFilter, onClearFilter, theme }) => {
  return (
    <div className={`flex items-center mb-6 ${theme === 'light' ? 'bg-white/80 border-gray-200' : 'bg-gray-900/40 border-gray-700/80'} p-4 rounded-xl border shadow-md backdrop-blur-sm`}>
      <span className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-300'} mr-2`}>Currently showing projects with:</span>
      <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg flex items-center shadow-md">
        {activeFilter}
        <button 
          onClick={onClearFilter}
          className="ml-2 hover:text-gray-200 bg-blue-500/30 hover:bg-blue-500/50 p-0.5 rounded-full transition-all"
          aria-label="Clear filter"
          title="Clear filter"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ActiveFilterBadge;