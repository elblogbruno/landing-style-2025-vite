import React from 'react';
import { PaginationControlsProps } from './types';

const PaginationControls: React.FC<PaginationControlsProps> = ({
  filteredProjects,
  initialProjectCount,
  allProjectsLoaded,
  expandedView,
  onLoadMore,
  onCollapse,
  theme
}) => {
  return (
    <>
      {filteredProjects.length > initialProjectCount && (
        <div className="flex justify-center mt-12">
          {!allProjectsLoaded ? (
            <button
              onClick={onLoadMore}
              className={`px-6 py-3 ${theme === 'light' 
                ? 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-blue-300' 
                : 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 hover:border-blue-600'
              } rounded-xl shadow-lg transition-all flex items-center space-x-2 hover:shadow-xl`}
            >
              <span>Show More Projects</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          ) : expandedView && (
            <button
              onClick={onCollapse}
              className={`px-6 py-3 ${theme === 'light' 
                ? 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-blue-300' 
                : 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 hover:border-blue-600'
              } rounded-xl shadow-lg transition-all flex items-center space-x-2 hover:shadow-xl`}
            >
              <span>Hide Projects</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default PaginationControls;