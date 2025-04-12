import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectStatsProps } from './types';

const ProjectStats: React.FC<ProjectStatsProps> = ({ 
  count,
  allLoaded,
  expandedView,
  theme 
}) => {
  const { t } = useTranslation();
  
  if (!expandedView) {
    return null; // Don't show stats if not in expanded view
  }

  // Show "All projects loaded" message if all projects are loaded
  if (allLoaded) {
    return (
      <div className={`text-center mt-6 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
        <p>{t('projects.allProjectsLoaded', { count })}</p>
      </div>
    );
  }
  
  return (
    <div className={`text-center mt-6 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
      <p>{t('projects.showingProjects', { count })}</p>
      <p className="text-sm italic">{t('projects.scrollForMore')}</p>
    </div>
  );
};

export default ProjectStats;