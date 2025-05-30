import React, { memo } from 'react';
import { ProjectCardProps } from './types';

const ProjectCard: React.FC<ProjectCardProps> = ({ project, theme, activeFilter, onSkillClick }) => {
  return (
    <div 
      className={`${
        theme === 'light' 
          ? 'bg-white border-gray-200 hover:border-blue-500/50' 
          : 'bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700/80 hover:border-blue-500/50'
      } rounded-xl overflow-hidden border transition-all duration-300 group shadow-xl`}
    >
      <div className="relative h-48 overflow-hidden">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={`${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'} w-full h-full flex items-center justify-center`}>
            <span className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>No image</span>
          </div>
        )}
        {project.featured && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-yellow-400 text-white text-xs px-3 py-1 rounded-full shadow-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Featured
          </div>
        )}        {project.etsProject && (
          <a 
            href="#education" 
            className="absolute top-2 left-2 bg-white rounded-full p-1 shadow-lg flex items-center justify-center w-10 h-10 hover:scale-110 transition-transform cursor-pointer"
            title="Proyecto realizado durante mi estancia en ÉTS Montreal. Haz clic para más información sobre mi educación."
            aria-label="Ver información de ÉTS Montreal en la sección de Educación"
          >
            <img 
              src="/images-webp/education/ets-montreal-logo.webp" 
              alt="ÉTS Montreal" 
              className="w-8 h-8 object-contain" 
            />
          </a>
        )}
      </div>
      
      <div className="p-6 space-y-5">
        <div>
          <h3 className={`text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{project.title}</h3>
          <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>{project.description}</p>
        </div>
        
        {/* Project timeline */}
        <div className="text-sm text-gray-500 flex flex-wrap gap-x-3 items-center">
          {project.startDate && (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <time 
                dateTime={project.startDate}
                title={new Date(project.startDate).toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'})}
              >
                {new Date(project.startDate).toLocaleDateString(undefined, {year: 'numeric', month: 'short'})}
              </time>
              <span className="mx-2">→</span>
              {project.endDate ? (
                <time 
                  dateTime={project.endDate}
                  title={new Date(project.endDate).toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'})}
                >
                  {new Date(project.endDate).toLocaleDateString(undefined, {year: 'numeric', month: 'short'})}
                </time>
              ) : (
                <span className="text-blue-500 font-medium">Present</span>
              )}
            </div>
          )}
          {!project.startDate && (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <time 
                dateTime={project.date}
                title={new Date(project.date).toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'})}
              >
                {new Date(project.date).toLocaleDateString(undefined, {year: 'numeric', month: 'short'})}
              </time>
            </div>
          )}
        </div>
        
        {/* Skills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {project.skills.map(skill => (
            <span 
              key={skill} 
              className={`px-2 py-1 rounded-full text-xs transition-all ${
                activeFilter === skill 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-md' 
                  : theme === 'light'
                    ? 'bg-gray-100 text-gray-700 border border-gray-200'
                    : 'bg-gray-800 text-gray-300 border border-gray-700/80'
              } hover:bg-blue-600 hover:text-white cursor-pointer`}
              onClick={() => onSkillClick(skill)}
            >
              {skill}
            </span>
          ))}
        </div>
        
        {/* Enlaces */}
        <div className="flex gap-3 mt-auto">
          {project.githubUrl && (
            <a 
              href={project.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`${theme === 'light' ? 'text-gray-700 hover:text-blue-600' : 'text-gray-300 hover:text-blue-400'} transition-colors flex items-center`}
            > 
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.548 9.548 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </a>
          )}
          {project.demoUrl && (
            <a 
              href={project.demoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`${theme === 'light' ? 'text-gray-700 hover:text-blue-600' : 'text-gray-300 hover:text-blue-400'} transition-colors flex items-center`}
            > 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// Exportamos el componente memorizado para evitar re-renderizados innecesarios
// cuando solo cambia el tema y otras props no relacionadas
export default memo(ProjectCard, (prevProps, nextProps) => {
  // Solo re-renderizar si cambian props relevantes para este componente específico
  return prevProps.project === nextProps.project && 
         prevProps.activeFilter === nextProps.activeFilter &&
         prevProps.theme === nextProps.theme;
});