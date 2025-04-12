import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SkillsFilterProps } from './types';
import { getSkillsForCategory } from './utils';

const SkillsFilter: React.FC<SkillsFilterProps> = ({
  skills, 
  activeFilter,
  onSkillClick, 
  categoryFilter,
  categories,
  theme 
}) => {
  const { t } = useTranslation();
  const SKILLS_PER_PAGE = 20; // Limit skills displayed at once
  const [currentPage, setCurrentPage] = useState(1);

  // Filter skills based on the selected category
  const filteredSkills = useMemo(() => {
    return getSkillsForCategory(skills, categoryFilter);
  }, [skills, categoryFilter]);

  // Reset to first page when category changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter]);

  const categoryName = useMemo(() => {
    const category = categories.find(c => c.id === categoryFilter);
    return category ? category.name : '';
  }, [categories, categoryFilter]);

  // Paginate skills to reduce DOM size
  const paginatedSkills = useMemo(() => {
    const startIndex = (currentPage - 1) * SKILLS_PER_PAGE;
    const endIndex = startIndex + SKILLS_PER_PAGE;
    return filteredSkills.slice(startIndex, endIndex);
  }, [filteredSkills, currentPage, SKILLS_PER_PAGE]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredSkills.length / SKILLS_PER_PAGE);

  // Handle page navigation
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className={`${theme === 'light' ? 'bg-white/90 border-gray-200' : 'bg-gray-900/50 border-gray-700/80'} p-5 rounded-xl border mb-6 shadow-lg backdrop-blur-sm`}>
      <div className="flex justify-between items-center mb-3">
        <h4 className={`${theme === 'light' ? 'text-gray-800' : 'text-white'} font-medium`}>
          {categoryFilter !== 'all' 
            ? t('projects.categorySkills', { category: categoryName }) 
            : t('projects.allSkills')}
        </h4>
        {filteredSkills.length > SKILLS_PER_PAGE && (
          <div className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            {t('projects.showingSkills', {
              start: Math.min(filteredSkills.length, currentPage * SKILLS_PER_PAGE - SKILLS_PER_PAGE + 1),
              end: Math.min(currentPage * SKILLS_PER_PAGE, filteredSkills.length),
              total: filteredSkills.length
            })}
          </div>
        )}
      </div>
      
      {/* Skills grid with reduced DOM size */}
      <div className="flex flex-wrap gap-2">
        {paginatedSkills.length > 0 ? (
          paginatedSkills.map(skill => (
            <button
              key={skill.name}
              onClick={() => onSkillClick(skill.name)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                activeFilter === skill.name
                  ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white font-medium shadow-lg shadow-blue-500/20'
                  : theme === 'light'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 hover:border-gray-300'
                    : 'bg-gray-800/90 text-gray-300 hover:bg-gray-700 border border-gray-700/80 hover:border-gray-600'
              }`}
            >
              {skill.name}
            </button>
          ))
        ) : (
          <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} text-sm italic`}>
            {t('projects.noSkillsFound')}
          </p>
        )}
      </div>
      
      {/* Pagination controls - only show if we have multiple pages */}
      {totalPages > 1 && (
        <div className={`flex justify-center mt-4 gap-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
          <button 
            onClick={goToPrevPage} 
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1 
                ? theme === 'light' ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 cursor-not-allowed'
                : theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-800'
            }`}
          >
            {t('projects.prev')}
          </button>
          <span className="px-3 py-1">
            {t('projects.pageInfo', { current: currentPage, total: totalPages })}
          </span>
          <button 
            onClick={goToNextPage} 
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages 
                ? theme === 'light' ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 cursor-not-allowed'
                : theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-800'
            }`}
          >
            {t('projects.next')}
          </button>
        </div>
      )}
    </div>
  );
};

export default SkillsFilter;