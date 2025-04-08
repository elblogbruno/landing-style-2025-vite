import React from 'react';
import { FilterCategoryProps } from './types';

const FilterCategories: React.FC<FilterCategoryProps> = ({ 
  categories, 
  activeCategory, 
  onCategoryChange, 
  theme 
}) => {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <h3 className={`text-xl font-semibold self-center mr-2 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Filter by:</h3>
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 rounded-lg transition-all shadow ${
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
  );
};

export default FilterCategories;