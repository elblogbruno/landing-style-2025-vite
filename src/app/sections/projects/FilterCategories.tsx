import React from 'react';
import { useTranslation } from 'react-i18next';
import { FilterCategoryProps } from './types';

const FilterCategories: React.FC<FilterCategoryProps> = ({ 
  categories, 
  activeCategory, 
  onCategoryChange, 
  theme 
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto sm:overflow-x-visible no-scrollbar py-1 max-w-full">
      <h3 className={`text-base sm:text-lg font-semibold mr-1 shrink-0 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
        {t('projects.filterBy', 'Categorías:')}
      </h3>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-nowrap sm:flex-wrap">
        {categories.map(category => (
          <button
            key={category.id}
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                try { navigator.vibrate(10); } catch { /* vibration not supported */ }
              }
              onCategoryChange(category.id);
            }}
            className={`shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg transition-all shadow touch-manipulation active:scale-95 ${
              activeCategory === category.id 
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium ring-2 ring-blue-400/30 ring-offset-1 ' + (theme === 'light' ? 'ring-offset-gray-50' : 'ring-offset-gray-900')
                : theme === 'light' 
                  ? 'bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
                  : 'bg-gray-800/80 text-gray-300 hover:bg-gray-800 hover:text-gray-100 border border-gray-700'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterCategories;