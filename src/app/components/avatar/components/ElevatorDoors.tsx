import React, { useEffect, useState, useRef, useCallback } from 'react';
// import { useTranslation } from 'react-i18next';

type ElevatorDoorsProps = {
  isOpen: boolean;
  doorsState?: 'closed' | 'opening' | 'closing' | 'open';
  theme: "dark" | "light";
  transitionStatus?: 'inactive' | 'preparing' | 'scrolling' | 'arriving';
};

type DoorState = 'closed' | 'opening' | 'closing' | 'open';

// Modo depuración para ver logs en consola
const DEBUG_MODE = false;

const ElevatorDoors: React.FC<ElevatorDoorsProps> = ({ isOpen, doorsState, theme, transitionStatus = 'inactive' }) => {
  // Estado simplificado: solo posición y estado actual
  const [doorState, setDoorState] = useState<DoorState>(isOpen ? 'open' : 'closed');
  const [leftPosition, setLeftPosition] = useState(isOpen ? "-100%" : "0%");
  const [rightPosition, setRightPosition] = useState(isOpen ? "100%" : "0%");
  
  // Referencias esenciales
  const isAnimatingRef = useRef(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const forcedStateRef = useRef<boolean>(false);
  
  // Función de log para depuración
  const logMessage = useCallback((message: string, important = false) => {
    if (!DEBUG_MODE) return;
    
    const style = important ? 
      'background:#e74c3c;color:white;padding:3px;font-weight:bold' : 
      'background:#2c3e50;color:#2ecc71;padding:2px';
    
    console.log(`%c [ElevatorDoors] ${message}`, style);
  }, []);

  // Función simplificada para animar las puertas
  const animateDoors = useCallback((toOpen: boolean, force = false) => {
    // Cancelar animación actual si hay una en progreso
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    
    // Si es forzado, marcar como tal
    if (force) {
      forcedStateRef.current = true;
      logMessage(`ANIMACIÓN FORZADA: ${toOpen ? 'ABRIR' : 'CERRAR'} PUERTAS`, true);
    }
    
    // Marcar que hay una animación en curso
    isAnimatingRef.current = true;
    
    // Establecer el estado de animación
    const newState: DoorState = toOpen ? 'opening' : 'closing';
    setDoorState(newState);
    
    // Aplicar posiciones inmediatamente
    setLeftPosition(toOpen ? "-100%" : "0%");
    setRightPosition(toOpen ? "100%" : "0%");
    
    // Programar la finalización de la animación
    animationTimeoutRef.current = setTimeout(() => {
      // Establecer el estado final
      const finalState: DoorState = toOpen ? 'open' : 'closed';
      setDoorState(finalState);
      isAnimatingRef.current = false;
      
      // Si se completa la apertura, desactivar el estado forzado
      if (toOpen) {
        forcedStateRef.current = false;
      }
      
      logMessage(`Animación completada: ${toOpen ? 'PUERTAS ABIERTAS' : 'PUERTAS CERRADAS'}`, true);
      
      // Limpiar el timeout
      animationTimeoutRef.current = null;
    }, 1500); // Duración de la animación
  }, [logMessage]);
  
  // Efecto único para escuchar el evento de forzar acción
  useEffect(() => {
    const handleForceDoorAction = (e: CustomEvent) => {
      const { action, source } = e.detail;
      
      logMessage(`Evento FORZADO recibido: ${action} desde ${source}`, true);
      
      if (action === 'force-close') {
        // Forzar cierre inmediato ignorando cualquier otro estado
        animateDoors(false, true);
      } else if (action === 'force-open') {
        // Forzar apertura inmediata
        animateDoors(true, true);
      }
    };
    
    // Suscribirse a un único evento simplificado
    window.addEventListener('elevator-force-door-action', handleForceDoorAction as EventListener);
    
    return () => {
      window.removeEventListener('elevator-force-door-action', handleForceDoorAction as EventListener);
    };
  }, [animateDoors, logMessage]);
  
  // Efecto simplificado para responder a cambios en props - prioridad clara
  useEffect(() => {
    // Si estamos en un estado forzado, ignorar cambios no forzados en props
    if (forcedStateRef.current) {
      logMessage('Ignorando cambio de props - estado forzado activo', true);
      return;
    }
    
    // Si transitionStatus cambia a 'preparing', cerrar puertas
    if (transitionStatus === 'preparing') {
      logMessage('Cerrando puertas - iniciando transición', true);
      animateDoors(false, true);
      return;
    }
    
    // Si hay un doorsState definido, usarlo como fuente principal
    if (doorsState) {
      if ((doorsState === 'closing' || doorsState === 'closed') && doorState !== 'closing' && doorState !== 'closed') {
        logMessage(`doorsState dice cerrar puertas: ${doorsState}`, true);
        animateDoors(false, false);
      } else if ((doorsState === 'opening' || doorsState === 'open') && doorState !== 'opening' && doorState !== 'open') {
        logMessage(`doorsState dice abrir puertas: ${doorsState}`, true);
        animateDoors(true, false);
      }
    } 
    // Si no hay doorsState, usar isOpen como respaldo
    else if (isOpen !== (doorState === 'open' || doorState === 'opening')) {
      logMessage(`isOpen cambió a: ${isOpen}`, true);
      animateDoors(isOpen, false);
    }
  }, [doorsState, isOpen, transitionStatus, doorState, animateDoors, logMessage]);
  
  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);
  
  // Determinar si las puertas están en movimiento
  const isMoving = doorState === 'opening' || doorState === 'closing';
  
  // Estilos según tema
  const isLight = theme === "light";
  const doorBgColor = isLight ? 'bg-slate-300' : 'bg-slate-800'; // Más metálico
  const doorBorderColor = isLight ? 'border-slate-400' : 'border-slate-600'; // Más metálico
  const doorFrameColor = isLight ? 'bg-slate-500' : 'bg-slate-900'; // Marco metálico
  const panelBgColor = isLight ? 'bg-slate-200' : 'bg-slate-700'; // Panel interior
  const accentColor = isLight ? 'bg-amber-500' : 'bg-amber-600'; // Color de acento/indicador

  return (
    <div 
      className="elevator-doors-container" 
      data-door-state={doorState}
      data-transition={transitionStatus}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {/* Marco de puertas */}
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          {/* Bordes del marco - con esquina derecha plana */}
          <div className={`absolute top-0 left-0 right-0 h-5 ${doorFrameColor} border-b-[3px] ${doorBorderColor}`}></div>
          <div className={`absolute bottom-0 left-0 right-0 h-5 ${doorFrameColor} border-t-[3px] ${doorBorderColor}`}></div>
          <div className={`absolute top-0 bottom-0 left-0 w-4 ${doorFrameColor} border-r-[3px] ${doorBorderColor}`}></div>
          
          {/* Borde derecho ajustado para ser plano y conectar con los botones */}
          <div className={`absolute top-0 bottom-0 right-0 w-4 ${doorFrameColor} border-r-[3px] ${doorBorderColor}`}
              style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}></div>
 
          {/* Puerta izquierda */}
          <div 
            className={`door-left ${doorBgColor} border-r-[3px] ${doorBorderColor}`}
            style={{ 
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: '50%',
              transform: `translateX(${leftPosition})`,
              transition: 'transform 1.6s cubic-bezier(0.25, 1, 0.5, 1)',
              boxShadow: isMoving ? '0 0 20px rgba(255, 215, 0, 0.5)' : '0 0 15px rgba(0, 0, 0, 0.5)',
              zIndex: 10000,
              backgroundImage: isLight 
                ? 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.3) 100%)'
            }}
          >
            <div className={`absolute inset-[15px] border-2 ${doorBorderColor} ${panelBgColor}`}
                 style={{
                   backgroundImage: isLight 
                     ? 'linear-gradient(0deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 100%)'
                     : 'linear-gradient(0deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)'
                 }}>
              {/* Líneas verticales decorativas */}
              <div className="absolute inset-1 flex flex-col justify-between">
                <div className={`h-[1px] w-full ${isLight ? 'bg-slate-400/50' : 'bg-slate-500/50'}`}></div>
                <div className={`h-[1px] w-full ${isLight ? 'bg-slate-400/50' : 'bg-slate-500/50'}`}></div>
              </div>
              <div className="absolute top-[15%] bottom-[15%] left-[15%] w-[1px] bg-slate-400/30"></div>
              <div className="absolute top-[15%] bottom-[15%] right-[15%] w-[1px] bg-slate-400/30"></div>
              
              {/* Sensor de seguridad */}
              <div className="absolute bottom-4 right-4 w-3 h-10 flex flex-col space-y-1">
                <div className={`w-full h-2 rounded-full ${accentColor}`}></div>
                <div className={`w-full h-2 rounded-full ${accentColor}`}></div>
                <div className={`w-full h-2 rounded-full ${accentColor}`}></div>
              </div>
              
              {DEBUG_MODE && <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-black bg-white p-1">LEFT</span>}
            </div>
          </div>
          
          {/* Puerta derecha */}
          <div
            className={`door-right ${doorBgColor} border-l-[3px] ${doorBorderColor}`}
            style={{ 
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: '50%',
              transform: `translateX(${rightPosition})`,
              transition: 'transform 1.6s cubic-bezier(0.25, 1, 0.5, 1)',
              boxShadow: isMoving ? '0 0 20px rgba(255, 215, 0, 0.5)' : '0 0 15px rgba(0, 0, 0, 0.5)',
              zIndex: 10000,
              backgroundImage: isLight 
                ? 'linear-gradient(-135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 100%)'
                : 'linear-gradient(-135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.3) 100%)'
            }}
          >
            <div className={`absolute inset-[15px] border-2 ${doorBorderColor} ${panelBgColor}`}
                 style={{
                   backgroundImage: isLight 
                     ? 'linear-gradient(0deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 100%)'
                     : 'linear-gradient(0deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)'
                 }}>
              {/* Líneas verticales decorativas */}
              <div className="absolute inset-1 flex flex-col justify-between">
                <div className={`h-[1px] w-full ${isLight ? 'bg-slate-400/50' : 'bg-slate-500/50'}`}></div>
                <div className={`h-[1px] w-full ${isLight ? 'bg-slate-400/50' : 'bg-slate-500/50'}`}></div>
              </div>
              <div className="absolute top-[15%] bottom-[15%] right-[15%] w-[1px] bg-slate-400/30"></div>
              <div className="absolute top-[15%] bottom-[15%] left-[15%] w-[1px] bg-slate-400/30"></div>
              
              {/* Panel de control del elevador */}
              <div className="absolute bottom-4 left-4 w-8 h-16 bg-slate-800/80 rounded-sm border border-slate-700 flex flex-col justify-center items-center p-1 space-y-1">
                <div className={`w-4 h-4 rounded-full ${isLight ? 'bg-amber-500' : 'bg-amber-600'}`}></div>
                <div className={`w-4 h-4 rounded-full ${isLight ? 'bg-red-500' : 'bg-red-600'}`}></div>
                <div className={`w-4 h-4 rounded-full ${isLight ? 'bg-green-500' : 'bg-green-600'}`}></div>
              </div>
              
              {DEBUG_MODE && <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-black bg-white p-1">RIGHT</span>}
            </div>
          </div>
          
          {/* Línea central cuando las puertas están cerradas (junta) */}
          {(doorState === 'closed' || doorState === 'closing') && (
            <div className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-[6px] pointer-events-none"
                 style={{
                   background: isLight ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.3)',
                   boxShadow: '0 0 5px rgba(0,0,0,0.1)',
                   opacity: doorState === 'closing' ? 0.5 : 1,
                   transition: 'opacity 0.3s ease'
                 }}></div>
          )}
          
          {/* Indicador de estado */}
          {(isMoving || DEBUG_MODE) && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 10001 }}>
              <div className={`text-center p-2 rounded-lg ${isLight ? 'bg-white/80' : 'bg-black/80'} shadow-lg border-2 border-yellow-500`}>
                <div className={`text-sm font-mono ${isLight ? 'text-black' : 'text-white'}`}>
                  {doorState}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Panel de depuración */}
      {DEBUG_MODE && (
        <div 
          style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            zIndex: 10002,
            pointerEvents: 'auto'
          }}
        >
          <div style={{ 
            background: 'rgba(0,0,0,0.9)', 
            color: 'white', 
            padding: '0.5rem', 
            borderRadius: '0.25rem',
            fontSize: '0.75rem'
          }}>
            <div>Estado: <span style={{ fontWeight: 'bold' }}>{doorState}</span></div>
            <div>isOpen: <span style={{ fontWeight: 'bold' }}>{isOpen ? 'true' : 'false'}</span></div>
            <div>Trans: <span style={{ fontWeight: 'bold' }}>{transitionStatus}</span></div>
            <div>hookState: <span style={{ fontWeight: 'bold' }}>{doorsState || 'N/A'}</span></div>
          </div>
          <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
            <button 
              onClick={() => animateDoors(false, true)}
              style={{ 
                background: '#dc2626', 
                color: 'white', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '0.25rem',
                fontSize: '0.75rem'
              }}
            >
              Forzar Cierre
            </button>
            <button 
              onClick={() => animateDoors(true, true)}
              style={{ 
                background: '#16a34a', 
                color: 'white', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '0.25rem',
                fontSize: '0.75rem'
              }}
            >
              Forzar Apertura
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElevatorDoors;
