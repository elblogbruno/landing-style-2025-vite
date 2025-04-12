import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { track } from '../../../utils/umami-analytics';
import { useTranslation } from 'react-i18next';

type ElevatorDoorsProps = {
  isOpen: boolean;
  theme: "dark" | "light";
};

type DoorState = 'closed' | 'opening' | 'closing' | 'open';

const ElevatorDoors: React.FC<ElevatorDoorsProps> = ({ isOpen, theme }) => {
  const { t } = useTranslation();
  const [doorState, setDoorState] = useState<DoorState>(isOpen ? 'open' : 'closed');
  const previousOpenState = useRef(isOpen);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const doorMovementKey = useRef(0);
  const transitionInProgressRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Esta función gestiona los cambios de estado de las puertas con debounce
  const handleDoorStateChange = (newIsOpen: boolean) => {
    // Limpieza de cualquier temporizador de debounce existente
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Solo permitir un cambio de estado si no hay una transición en progreso
    if (transitionInProgressRef.current) {
      return;
    }
    
    // Sólo iniciar una nueva transición si el estado ha cambiado
    if (previousOpenState.current !== newIsOpen) {
      // Marcar que hay una transición en progreso
      transitionInProgressRef.current = true;
      
      // Incrementar key para forzar que Framer Motion recree las animaciones
      doorMovementKey.current += 1;
      
      // Configurar el nuevo estado de las puertas
      if (newIsOpen) {
        setDoorState('opening');
        
        // Configurar un temporizador para completar la animación
        animationTimeoutRef.current = setTimeout(() => {
          setDoorState('open');
          
          // Actualizar el estado previo y marcar que no hay transición en progreso
          previousOpenState.current = newIsOpen;
          transitionInProgressRef.current = false;
        }, 1600); // Duración de la animación
      } else {
        setDoorState('closing');
        
        // Configurar un temporizador para completar la animación
        animationTimeoutRef.current = setTimeout(() => {
          setDoorState('closed');
          
          // Actualizar el estado previo y marcar que no hay transición en progreso
          previousOpenState.current = newIsOpen;
          transitionInProgressRef.current = false;
        }, 1600); // Duración de la animación
      }
    }
  };

  // Controlador para cambios en la prop isOpen con debounce para evitar eventos rápidos repetidos
  useEffect(() => {
    // Aplicar debounce para evitar múltiples transiciones rápidas
    debounceTimerRef.current = setTimeout(() => {
      handleDoorStateChange(isOpen);
    }, 100);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isOpen]);
  
  // Registrar eventos de animación para analíticas
  useEffect(() => {
    track({
      category: 'ElevatorDoors',
      action: `Doors${doorState.charAt(0).toUpperCase() + doorState.slice(1)}`,
      label: `Theme: ${theme}`
    });
  }, [doorState, theme]);
  
  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  const isMoving = doorState === 'opening' || doorState === 'closing';
  const isLight = theme === "light";
  
  // Colores basados en el tema
  const doorBgColor = isLight ? 'bg-gray-200' : 'bg-gray-800';
  const doorBorderColor = isLight ? 'border-gray-300' : 'border-gray-600';
  const doorFrameColor = isLight ? 'bg-gray-400' : 'bg-gray-900';
  const panelBgColor = isLight ? 'bg-gray-100' : 'bg-gray-700';
  
  // Función para determinar la posición de las puertas según el estado
  const getDoorPosition = (side: 'left' | 'right', state: DoorState) => {
    if (side === 'left') {
      return (state === 'opening' || state === 'open') ? "-100%" : "0%";
    } else {
      return (state === 'opening' || state === 'open') ? "100%" : "0%";
    }
  };

  // Texto del estado de las puertas para accesibilidad
  const getDoorStateText = (state: DoorState) => {
    switch (state) {
      case 'closing': return t('elevator.doors.closing');
      case 'opening': return t('elevator.doors.opening');
      case 'closed': return t('elevator.doors.closed');
      case 'open': return t('elevator.doors.open');
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex overflow-hidden pointer-events-none">
      {/* Marco de la puerta */}
      <div className={`absolute inset-0 p-[3px] ${isMoving ? 'frame-glow' : ''}`}>
        <div className="absolute inset-0 flex">
          {/* Bordes del marco */}
          <div className={`absolute top-0 left-0 right-0 h-3 ${doorFrameColor} border-b ${doorBorderColor}`}></div>
          <div className={`absolute bottom-0 left-0 right-0 h-3 ${doorFrameColor} border-t ${doorBorderColor}`}></div>
          <div className={`absolute top-0 bottom-0 left-0 w-2 ${doorFrameColor} border-r ${doorBorderColor}`}></div>
          <div className={`absolute top-0 bottom-0 right-0 w-2 ${doorFrameColor} border-l ${doorBorderColor}`}></div>
          
          {/* Puerta izquierda */}
          <motion.div 
            key={`left-door-${doorMovementKey.current}`}
            className={`w-1/2 h-full ${doorBgColor} border-r ${doorBorderColor} relative shadow-lg`}
            initial={{ x: "0%" }}
            animate={{ x: getDoorPosition('left', doorState) }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          >
            <div className={`absolute inset-[20px] border ${doorBorderColor} ${panelBgColor}`}></div>
          </motion.div>
          
          {/* Puerta derecha */}
          <motion.div
            key={`right-door-${doorMovementKey.current}`} 
            className={`w-1/2 h-full ${doorBgColor} border-l ${doorBorderColor} relative shadow-lg`}
            initial={{ x: "0%" }}
            animate={{ x: getDoorPosition('right', doorState) }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          >
            <div className={`absolute inset-[20px] border ${doorBorderColor} ${panelBgColor}`}></div>
          </motion.div>
          
          {/* Indicador de piso cuando se mueve */}
          {isMoving && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[60]">
              <div className={`text-center p-3 rounded-lg ${isLight ? 'bg-white/90' : 'bg-black/90'} shadow-lg border`}>
                <div className={`text-xs font-mono ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                  {getDoorStateText(doorState)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElevatorDoors;
