import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SectionKey } from '../types';
import { getFloorAltitude } from '../../../utils/elevator-altitude';

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
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Referencia para rastrear las transiciones anteriores
  const previousFloorsRef = useRef<SectionKey[]>([]);
  
  // References for each button to position tooltips
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Efecto para controlar la consistencia de los pisos en transición
  useEffect(() => {
    if (isTransitioning) {
      console.log('Pisos en transición:', floorsInTransition);
      previousFloorsRef.current = floorsInTransition;
    } else {
      // Resetear cuando no hay transición
      previousFloorsRef.current = [];
    }
  }, [isTransitioning, floorsInTransition]);

  // Colores más sofisticados y neutrales para un aspecto más profesional
  const bgColor = darkMode ? 'bg-zinc-800/90' : 'bg-zinc-200/90';
  const textColor = darkMode ? 'text-zinc-300' : 'text-zinc-700';
  const borderColor = darkMode ? 'border-zinc-700' : 'border-zinc-300';
  
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
  const getCurrentDisplayFloor = (): { number: number, letter: string, altitude: string } => {
    if (isTransitioning && floorsInTransition.length > 0) {
      // Durante una transición, mostrar el último piso por el que estamos pasando
      const lastActiveFloor = floorsInTransition[floorsInTransition.length - 1];
      return {
        number: getFloorNumber(lastActiveFloor),
        letter: lastActiveFloor[0].toUpperCase(),
        altitude: getFloorAltitude(lastActiveFloor)
      };
    }
    
    // En estado normal, mostrar el piso actual
    return {
      number: getFloorNumber(currentSection),
      letter: currentSection[0].toUpperCase(),
      altitude: getFloorAltitude(currentSection)
    };
  };
  
  // Obtener la información del piso actual para mostrar
  const currentDisplayFloor = getCurrentDisplayFloor();
  
  // Invertir el orden de las secciones para la botonera física del ascensor:
  // Piso 0 (lobby/hero) abajo del todo y el piso más alto arriba del todo.
  const reversedSections = useMemo(() => [...sections].reverse(), [sections]);

  // Dirección de movimiento durante la transición
  const isMovingUp = isTransitioning && targetSection 
    ? getFloorNumber(targetSection) > getFloorNumber(currentSection)
    : false;
  const isMovingDown = isTransitioning && targetSection 
    ? getFloorNumber(targetSection) < getFloorNumber(currentSection)
    : false;

  return (
    <div 
      className={`elevator-buttons-panel ${bgColor} rounded-r-lg overflow-visible shadow-md ${borderColor} border-t border-r border-b`}
      style={{
        position: 'absolute',
        top: '0px',
        bottom: '0px',
        right: '0px',
        width: '80px',
        zIndex: 100,
        backgroundImage: darkMode 
          ? 'linear-gradient(to right, rgba(30,41,59,0.9), rgba(39,49,66,0.95))' 
          : 'linear-gradient(to right, rgba(241,245,249,0.9), rgba(248,250,252,0.95))'
      }}
    >
      {/* Cabecera del panel minimalista */}
      <div className={`text-center py-2 border-b ${borderColor}`}>
        <span className={`text-xs uppercase tracking-wide font-medium ${textColor} opacity-80`}>
          {t('elevator.floor')}
        </span>
      </div>
      
      {/* Indicador de piso actual con estilo de telemetría de ascensor */}
      <div className={`mx-auto my-2.5 w-16 py-1.5 px-1 rounded-lg ${darkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-zinc-300'} 
        flex flex-col items-center justify-center transition-all duration-300 border shadow-md`}>
        <div className="flex items-baseline gap-1">
          {isTransitioning && (isMovingUp || isMovingDown) && (
            <span 
              className={`text-xs font-bold animate-pulse ${
                isMovingUp ? (darkMode ? 'text-emerald-400' : 'text-emerald-600') : (darkMode ? 'text-amber-400' : 'text-amber-600')
              }`}
              title={isMovingUp ? 'Subiendo' : 'Bajando'}
            >
              {isMovingUp ? '▲' : '▼'}
            </span>
          )}
          <span className={`text-2xl font-mono font-black ${darkMode ? 'text-zinc-100' : 'text-zinc-800'} transition-all duration-300`}>
            {currentDisplayFloor.number}
          </span>
          <span className={`text-xs ml-0.5 font-mono font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            {currentDisplayFloor.number >= 0 ? 'F' : 'B'}
          </span>
        </div>
        <span className={`text-[10px] font-mono font-bold tracking-tight mt-0.5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
          {currentDisplayFloor.altitude}
        </span>
      </div>
      
      {/* Área de botones con diseño minimalista (orden realista: 00 abajo, 07 arriba) */}
      <div className="flex flex-col items-center justify-start gap-3 h-[calc(100%-100px)] py-4">
        {reversedSections.map((floor) => {
          // Determinar si este botón debe estar iluminado
          const isHighlighted = shouldButtonHighlight(floor);
          const floorNum = getFloorNumber(floor);
          const isTooltipActive = activeTooltip === floor;
          
          return (
            <div className="relative" key={floor}>
              <button
                ref={el => buttonRefs.current[floor] = el}
                onClick={() => handleElevatorNavigation(floor)}
                onMouseEnter={() => setActiveTooltip(floor)}
                onMouseLeave={() => setActiveTooltip(null)}
                className={`w-9 h-9 rounded-md flex items-center justify-center transition-all duration-300
                  ${isHighlighted
                    ? darkMode 
                      ? 'bg-zinc-700 text-zinc-200 ring-1 ring-zinc-500/30' 
                      : 'bg-zinc-200 text-zinc-800 ring-1 ring-zinc-300/50'
                    : darkMode 
                      ? 'bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800' 
                      : 'bg-white text-zinc-600 hover:bg-zinc-100'
                  } ${borderColor} border`}
                aria-label={`Go to floor ${floor}`}
                data-floor={floor}
                data-highlighted={isHighlighted}
              >
                <div className="flex flex-col items-center">
                  <span className={`text-xs leading-none font-medium ${isHighlighted ? (darkMode ? 'text-zinc-200' : 'text-zinc-800') : ''}`}>
                    {floorNum}
                    <span className="text-[8px] ml-px opacity-70">{floorNum >= 0 ? 'F' : 'B'}</span>
                  </span>
                  <span className={`text-[9px] leading-none mt-1 ${isHighlighted ? 'opacity-90' : 'opacity-70'}`}>
                    {floor[0].toUpperCase()}
                  </span>
                </div>
              </button>
              
              {/* Tooltip positioned next to its corresponding button */}
              {isTooltipActive && (
                <div 
                  className={`absolute px-3 py-1.5 text-xs rounded-md shadow-lg flex items-center gap-2
                    ${darkMode ? 'bg-zinc-900/95 text-zinc-100 border border-zinc-700' : 'bg-white text-zinc-800 border border-zinc-200'}`}
                  style={{
                    zIndex: 20000,
                    right: '46px', // Open toward the cabin, inside the viewport
                    top: '50%',
                    transform: 'translateY(-50%)',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    fontWeight: 'medium',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <span>{t(`navigation.${floor}`)}</span>
                  <span className="text-[10px] font-mono opacity-60 font-semibold">({getFloorAltitude(floor)})</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Indicadores minimalistas de servicio */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${darkMode ? 'bg-zinc-600' : 'bg-zinc-300'}`}></div>
        <div className={`w-1.5 h-1.5 rounded-full ${darkMode ? 'bg-zinc-600' : 'bg-zinc-300'}`}></div>
      </div>
    </div>
  );
};

export default ElevatorButtons;
