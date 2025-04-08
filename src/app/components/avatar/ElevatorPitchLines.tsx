import React, { useState, useEffect } from 'react';

type SectionKey = 'hero' | 'about' | 'experience' | 'projects' | 'talks' | 'news' | 'education' | 'contact';

interface ElevatorPitchLinesProps {
  currentSection: SectionKey;
  pitchLines: Record<SectionKey, string>;
  theme: "dark" | "light";
}

const ElevatorPitchLines: React.FC<ElevatorPitchLinesProps> = ({
  currentSection,
  pitchLines,
  theme
}) => {
  const [line, setLine] = useState(pitchLines[currentSection]);
  const [isChanging, setIsChanging] = useState(false);
  
  useEffect(() => {
    setIsChanging(true);
    
    // Usar un timeout para crear una transición suave
    const timeout = setTimeout(() => {
      setLine(pitchLines[currentSection]);
      
      // Esperar a que la nueva línea se establezca antes de remover la clase de transición
      const endTransition = setTimeout(() => {
        setIsChanging(false);
      }, 300);
      
      return () => clearTimeout(endTransition);
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [currentSection, pitchLines]);

  return (
    <div className={`absolute top-[100px] left-0 right-0 mx-auto max-w-[80%] z-30 pitch-speech-bubble ${isChanging ? 'opacity-0 transform -translate-y-2' : 'opacity-100 transform translate-y-0'}`}>
      <div className={`
        relative 
        ${theme === "dark" ? "bg-gray-800/90" : "bg-white/90"} 
        ${theme === "dark" ? "text-white" : "text-gray-800"} 
        text-center 
        p-3 
        rounded-lg 
        shadow-lg
        ${theme === "dark" ? "border border-gray-700" : "border border-gray-200"}
        elevator-text 
        transition-all 
        duration-300
      `}>
        <div className="text-sm font-light italic">
          &quot;{line}&quot;
        </div>
        
        {/* Triángulo para el bocadillo de diálogo */}
        <div className={`
          absolute 
          -bottom-2 
          left-1/2 
          -translate-x-1/2 
          w-4 
          h-4 
          ${theme === "dark" ? "bg-gray-800" : "bg-white"} 
          transform rotate-45
          ${theme === "dark" ? "border-r border-b border-gray-700" : "border-r border-b border-gray-200"}
        `}></div>
      </div>
    </div>
  );
};

export default ElevatorPitchLines;
