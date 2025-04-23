import React, { useEffect, useState } from 'react';

interface ElevatorPlaceholderProps {
  theme: "dark" | "light";
  onLoad?: () => void;
}

const ElevatorPlaceholder: React.FC<ElevatorPlaceholderProps> = ({ theme, onLoad }) => {
  // Estado para controlar la animación previa a la carga
  const [loadingPhase, setLoadingPhase] = useState(1);
  
  // Simulación de progreso más realista
  useEffect(() => {
    // Fase 1: Mostrar mensaje inicial
    const phase1 = setTimeout(() => {
      setLoadingPhase(2);
    }, 700);
    
    // Fase 2: Mostrar progreso 
    const phase2 = setTimeout(() => {
      setLoadingPhase(3);
    }, 1400);
    
    // Fase 3: Completar carga
    const phase3 = setTimeout(() => {
      if (onLoad) onLoad();
    }, 1800);
    
    return () => {
      clearTimeout(phase1);
      clearTimeout(phase2);
      clearTimeout(phase3);
    };
  }, [onLoad]);

  // Colores adaptados al tema
  const bgGradient = theme === "dark" 
    ? 'linear-gradient(to bottom, #0f172a, #1e293b)' 
    : 'linear-gradient(to bottom, #e0f2fe, #f1f5f9)';
  
  const doorColor = theme === "dark" ? "bg-gray-700" : "bg-gray-300";
  const panelColor = theme === "dark" ? "bg-gray-800/90" : "bg-white/90";
  const textColor = theme === "dark" ? "text-white" : "text-gray-800";
  const accentColor = theme === "dark" ? "text-amber-500" : "text-blue-600";
  const secondaryTextColor = theme === "dark" ? "text-gray-400" : "text-gray-500";

  // Mensajes de carga según la fase
  const loadingMessages = {
    1: {
      title: "Iniciando elevador...",
      subtitle: "Preparando sistemas"
    },
    2: {
      title: "Calibrando controles...",
      subtitle: "El viaje comenzará en breve"
    },
    3: {
      title: "¡Listo para subir!",
      subtitle: "Cargando interfaz final"
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: bgGradient }}>
      {/* Niebla/Ambiente simulado */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{ 
          background: `radial-gradient(circle at center, transparent 0%, ${theme === "dark" ? "#0f172a" : "#e0f2fe"} 70%)`,
        }}
      ></div>
      
      {/* Cabina del elevador (simulada) */}
      <div className="absolute inset-0 flex flex-col">
        {/* Paredes simuladas */}
        <div className="flex-grow relative">
          {/* Pared del fondo */}
          <div className={`absolute inset-0 ${theme === "dark" ? "bg-gray-800/40" : "bg-gray-200/40"}`}></div>
          
          {/* Líneas de decoración */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-30">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-full h-px ${theme === "dark" ? "bg-gray-600" : "bg-gray-400"}`}></div>
            ))}
          </div>
          
          {/* Puertas simuladas (cerradas) */}
          <div className="absolute inset-0 flex">
            <div className={`w-1/2 h-full ${doorColor} border-r ${theme === "dark" ? "border-gray-600/30" : "border-gray-400/30"} transform animate-pulse`} 
                 style={{ animationDuration: '3s' }}></div>
            <div className={`w-1/2 h-full ${doorColor} border-l ${theme === "dark" ? "border-gray-600/30" : "border-gray-400/30"} transform animate-pulse`}
                 style={{ animationDuration: '3s', animationDelay: '0.3s' }}></div>
          </div>
        </div>
      </div>
      
      {/* Panel de control simulado */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-center">
        <div className={`${panelColor} px-3 py-2 rounded-md border ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}>
          <div className={`text-xs ${accentColor} uppercase tracking-wider animate-pulse`}>Descripción del piso</div>
          <div className={`${textColor} font-bold w-24 h-4 bg-gray-400/20 dark:bg-gray-600/20 rounded animate-pulse mt-1`}></div>
        </div>
        <div className="flex gap-2">
          <div className={`${panelColor} p-2 rounded-md border ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}>
            <div className={`w-5 h-5 ${secondaryTextColor} animate-pulse`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className={`${panelColor} p-2 rounded-md border ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}>
            <div className={`w-5 h-5 ${secondaryTextColor} animate-pulse`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Indicador de piso */}
      <div className={`absolute top-4 right-4 ${panelColor} px-2 py-1 rounded-md border ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}>
        <span className="font-mono text-lg">
          <span className={accentColor}>0</span>
          <span className={secondaryTextColor}>F</span>
        </span>
      </div>
      
      {/* Mensaje de carga con transición suave entre fases */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className={`px-6 py-4 rounded-lg ${theme === "dark" ? "bg-gray-900/95" : "bg-white/95"} flex flex-col items-center gap-3 border ${theme === "dark" ? "border-gray-700" : "border-gray-300"} shadow-lg`}
            style={{transition: 'transform 0.5s ease-out'}}
        >
          <div className="relative w-12 h-12">
            {/* Spinner más elegante */}
            <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
            
            {/* Indicador de progreso */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xs font-mono ${accentColor}`}>
                {Math.floor((loadingPhase / 3) * 100)}%
              </span>
            </div>
          </div>
          
          <span className={`${textColor} font-medium transition-all duration-300`}>
            {loadingMessages[loadingPhase as keyof typeof loadingMessages].title}
          </span>
          
          <div className={`text-xs ${secondaryTextColor} max-w-48 text-center transition-all duration-300`}>
            {loadingMessages[loadingPhase as keyof typeof loadingMessages].subtitle}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElevatorPlaceholder;