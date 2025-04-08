import React from 'react';
import { ProjectStatsProps } from './types';

const ProjectStats: React.FC<ProjectStatsProps> = ({ 
  count,
  allLoaded,
  expandedView,
  theme 
}) => {
  if (!expandedView) {
    return null; // Don't show stats if not in expanded view
  }

  // Show "All projects loaded" message if all projects are loaded
  if (allLoaded) {
    return (
      <div className={`text-center mt-6 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
        <p>All {count} projects loaded</p>
      </div>
    );
  }
  
  return (
    <div className={`text-center mt-6 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
      <p>Showing all {count} projects</p>
      <p className="text-sm italic">Scroll down to load more</p>
    </div>
  );
};

export default ProjectStats;