import React from 'react';
import { SectionKey } from './types';

interface ElevatorButtonsPlaceholderProps {
  theme: "dark" | "light";
  sections: SectionKey[];
  currentSection: SectionKey;
}

const ElevatorButtonsPlaceholder: React.FC<ElevatorButtonsPlaceholderProps> = ({ 
  theme, 
  sections,
  currentSection
}) => {
  // Función para obtener el número de piso
  const getFloorNumber = (section: string): number => {
    const floorMap: Record<string, number> = {
      hero: 6,
      about: 5,
      experience: 4,
      projects: 3,
      talks: 2,
      news: 1,
      awards: 0,
      education: -1,
      contact: -2
    };
    return floorMap[section] || 0;
  };

  // Calcular la posición del piso actual para el indicador de línea
  const currentIndex = sections.indexOf(currentSection);
  const indicatorPosition = currentIndex / (sections.length - 1) * 100;

  return (
    <div className="relative mt-4">
      {/* Línea indicadora lateral */}
      <div 
        className={`absolute -left-6 h-full w-4 bg-gray-800/70 dark:bg-gray-700/70 rounded-full flex flex-col justify-between py-2`}
        style={{ 
          boxShadow: '0 0 8px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Indicador dinámico de piso actual */}
        <div 
          className="absolute w-3 h-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 shadow-glow transform transition-all duration-500 ease-out"
          style={{
            top: `${indicatorPosition}%`,
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: theme === "dark" 
              ? '0 0 8px rgba(59, 130, 246, 0.6)' 
              : '0 0 8px rgba(29, 78, 216, 0.6)'
          }}
        ></div>
        
        {/* Puntos indicadores de pisos */}
        {sections.map((section) => (
          <div 
            key={section}
            className={`w-3 h-3 mx-auto rounded-full transition-all duration-300 ${
              currentSection === section
                ? 'opacity-0' // Invisible cuando es el piso actual (reemplazado por el indicador dinámico)
                : 'bg-gray-400 dark:bg-gray-500'
            }`}
            style={{
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          />
        ))}
      </div>
      
      {/* Botones de piso */}
      <div className="flex flex-col gap-2 pl-4">
        {sections.map((section) => {
          const isCurrentSection = currentSection === section;
          const floorNumber = getFloorNumber(section);
          const sectionNames = {
            hero: "Inicio",
            about: "Sobre mí",
            experience: "Experiencia",
            projects: "Proyectos",
            talks: "Charlas",
            news: "Noticias",
            awards: "Premios",
            education: "Educación",
            contact: "Contacto"
          };
          
          return (
            <button
              key={section}
              disabled
              className={`flex items-center p-2 px-3 rounded-lg transition-colors duration-300 ${
                isCurrentSection
                  ? theme === "dark"
                    ? 'bg-blue-500/30 text-white border border-blue-500/50' 
                    : 'bg-blue-500/20 text-blue-800 border border-blue-500/50'
                  : theme === "dark"
                    ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                    : 'bg-gray-200/70 text-gray-700 hover:bg-gray-300/50 border border-gray-300/50'
              }`}
            >
              <span className="w-8 text-right font-mono">
                {floorNumber}
              </span>
              <div className="ml-3 flex-1">
                <div className={`font-medium ${isCurrentSection ? (theme === "dark" ? "text-white" : "text-blue-800") : ""}`}>
                  {sectionNames[section] || section}
                </div>
                <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"} opacity-80`}>
                  {isCurrentSection ? "Piso actual" : ""}
                </div>
              </div>
              <span className="ml-2">
                {isCurrentSection && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ElevatorButtonsPlaceholder;
