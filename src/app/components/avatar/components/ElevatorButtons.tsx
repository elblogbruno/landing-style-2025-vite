import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SectionKey } from '../types';

interface ElevatorButtonsProps {
  sections: SectionKey[];
  currentSection: SectionKey;
  isTransitioning: boolean;
  targetSection: SectionKey;
  floorsInTransition: SectionKey[];
  darkMode: boolean;
  handleElevatorNavigation: (floor: SectionKey) => void;
  getFloorNumber: (section: string) => number;
}

const ElevatorButtons: React.FC<ElevatorButtonsProps> = ({
  sections,
  currentSection,
  isTransitioning,
  targetSection,
  floorsInTransition,
  darkMode,
  handleElevatorNavigation,
  getFloorNumber
}) => {
  const { t } = useTranslation();
  // Referencia para rastrear las transiciones anteriores y evitar reacciones aleatorias
  const previousFloorsRef = useRef<SectionKey[]>([]);
  
  // Efecto para controlar la consistencia de los pisos en transición
  useEffect(() => {
    // Detectar cambios importantes en la transición
    if (isTransitioning) {
      console.log('Pisos en transición:', floorsInTransition);
      previousFloorsRef.current = floorsInTransition;
    } else {
      // Resetear cuando no hay transición
      previousFloorsRef.current = [];
    }
  }, [isTransitioning, floorsInTransition]);

  // Colores coincidentes con la imagen de referencia
  const bgColor = darkMode ? 'bg-slate-400/10' : 'bg-slate-300/80';
  const textColor = darkMode ? 'text-blue-300' : 'text-blue-600';
  
  // Función para determinar si un botón debe estar iluminado
  const shouldButtonHighlight = (floor: SectionKey): boolean => {
    // El botón del piso actual siempre está iluminado
    if (currentSection === floor) {
      return true;
    }
    
    // Durante una transición, iluminar solo el destino y los pisos intermedios específicos
    if (isTransitioning) {
      // Siempre iluminar el piso destino
      if (targetSection === floor) {
        return true;
      }
      
      // Controlar estrictamente qué pisos intermedios se iluminan
      if (floorsInTransition.includes(floor)) {
        return true;
      }
      
      // Evitar iluminaciones aleatorias para cualquier otro caso
      return false;
    }
    
    // Fuera de una transición, ningún otro botón debe estar iluminado
    return false;
  };
  
  // Obtener el número del piso actual y el piso más recientemente iluminado en transición
  const getCurrentDisplayFloor = (): { number: number, letter: string } => {
    if (isTransitioning && floorsInTransition.length > 0) {
      // Durante una transición, mostrar el último piso por el que estamos pasando
      const lastActiveFloor = floorsInTransition[floorsInTransition.length - 1];
      return {
        number: getFloorNumber(lastActiveFloor),
        letter: lastActiveFloor[0].toUpperCase()
      };
    }
    
    // En estado normal, mostrar el piso actual
    return {
      number: getFloorNumber(currentSection),
      letter: currentSection[0].toUpperCase()
    };
  };
  
  // Obtener la información del piso actual para mostrar
  const currentDisplayFloor = getCurrentDisplayFloor();
  
  return (
    <div 
      className={`elevator-buttons-panel ${bgColor} rounded-r-lg overflow-hidden shadow-lg border-t border-r border-b ${darkMode ? 'border-slate-600' : 'border-slate-400'}`}
      style={{
        position: 'absolute',
        top: '0px',
        bottom: '0px',
        right: '-54px',
        width: '54px',
        zIndex: 100,
        backgroundImage: darkMode 
          ? 'linear-gradient(to right, rgba(100,116,139,0.7), rgba(71,85,105,0.8))' 
          : 'linear-gradient(to right, rgba(203,213,225,0.9), rgba(226,232,240,0.95))'
      }}
    >
      {/* Cabecera del panel, opcional */}
      <div className="text-center py-2">
        <span className={`text-xs uppercase tracking-wide font-bold ${textColor}`}>
          {t('elevator.floor')}
        </span>
      </div>
      
      {/* Nuevo indicador de piso actual */}
      <div className={`mx-auto mb-3 w-11 h-11 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'} 
        flex flex-col items-center justify-center transition-all duration-300 font-mono shadow-inner`}>
        <div className="flex items-baseline">
          <span className={`text-xl font-bold ${darkMode ? 'text-amber-500' : 'text-blue-600'} transition-all duration-300`}>
            {currentDisplayFloor.number}
          </span>
          <span className={`text-xs ml-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {currentDisplayFloor.number >= 0 ? 'F' : 'B'}
          </span>
        </div>
        <span className={`text-[10px] mt-0.5 font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-500'}`}>
          {currentDisplayFloor.letter}
        </span>
      </div>
      
      {/* Área de botones - usando flex y espacio automático para distribuir los botones */}
      <div className="flex flex-col items-center justify-evenly h-[calc(100%-110px)] py-2 px-1">
        {sections.map((floor) => {
          // Determinar si este botón debe estar iluminado
          const isHighlighted = shouldButtonHighlight(floor);
          
          return (
            <div className="relative group" key={floor}>
              <button
                onClick={() => handleElevatorNavigation(floor)}
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-300
                  ${isHighlighted
                    ? 'bg-blue-500 text-white ring-2 ring-blue-300/50' 
                    : darkMode 
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-100' 
                      : 'bg-white text-gray-800 hover:bg-gray-100'
                  }`}
                aria-label={`Ir al piso ${floor}`}
                style={{
                  boxShadow: (currentSection === floor) ? '0 0 8px rgba(59, 130, 246, 0.6)' : ''
                }}
                // Añadir un atributo de datos para depuración
                data-floor={floor}
                data-highlighted={isHighlighted}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xs leading-none font-bold">
                    {getFloorNumber(floor)}
                    <span className="text-[8px]">{getFloorNumber(floor) >= 0 ? 'F' : 'B'}</span>
                  </span>
                  <span className="text-[9px] leading-none mt-0.5">
                    {floor[0].toUpperCase()}
                  </span>
                </div>
              </button>
              
              {/* Tooltip que aparece a la izquierda */}
              <div className={`absolute top-1/2 -translate-y-1/2 right-full mr-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 ${darkMode ? 'bg-black text-white' : 'bg-white text-black border border-gray-200'}`}>
                {t(`navigation.${floor}`)}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Elementos decorativos en la parte inferior */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
        <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-amber-500' : 'bg-amber-500'}`}></div>
        <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-red-500' : 'bg-red-500'}`}></div>
      </div>
    </div>
  );
};

export default ElevatorButtons;
