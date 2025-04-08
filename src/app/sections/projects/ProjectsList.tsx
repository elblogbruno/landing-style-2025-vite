import React from 'react';
import { ProjectsListProps } from './types';
import ProjectCard from './ProjectCard';
import FeaturedProject from './FeaturedProject';

const ProjectsList: React.FC<ProjectsListProps> = ({
  featuredProjects,
  regularProjects,
  activeFilter,
  currentlyVisibleProjects,
  applySkillFilter,
  theme
}) => {
  return (
    <>
      {/* Sección de proyectos destacados (visualización mejorada) */}
      {featuredProjects.length > 0 && !activeFilter && (
        <div className="mb-12">
          <h3 className={`text-2xl font-bold mb-6 flex items-center ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Featured Projects
          </h3>
          
          {/* Proyectos destacados en formato especial (más grandes) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredProjects.slice(0, 2).map(project => (
              <FeaturedProject 
                key={project.id}
                project={project}
                theme={theme}
                // activeFilter={activeFilter}
                onSkillClick={applySkillFilter}
              />
            ))}
          </div>
          
          {/* Otros proyectos destacados en formato normal (si hay más de 2) */}
          {featuredProjects.length > 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {featuredProjects.slice(2).map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  theme={theme} 
                  activeFilter={activeFilter}
                  onSkillClick={applySkillFilter}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Título de "All Projects" o "Other Projects" dependiendo si hay destacados */}
      {regularProjects.length > 0 && !activeFilter && featuredProjects.length > 0 && (
        <h3 className={`text-2xl font-bold mb-6 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
          Other Projects
        </h3>
      )}
      
      {/* Lista de proyectos regulares */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeFilter ? currentlyVisibleProjects : regularProjects).map(project => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            theme={theme} 
            activeFilter={activeFilter}
            onSkillClick={applySkillFilter}
          />
        ))}
      </div>
    </>
  );
};

export default ProjectsList;