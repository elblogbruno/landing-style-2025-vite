import { useCallback, useEffect, useRef, useState } from 'react';

export const useElevatorSound = (isTransitioning: boolean): { isMuted: boolean; toggleMute: () => void } => {
  const elevatorSound = useRef<HTMLAudioElement | null>(null);
  const dingSound = useRef<HTMLAudioElement | null>(null);
  const soundsLoaded = useRef(false);
  const [isMuted, setIsMuted] = useState(() => {
    // Recuperar preferencia de silencio del localStorage
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('elevatorSoundMuted');
      return savedMute === 'true';
    }
    return false;
  });
  
  // Evitar conflictos entre pause/play
  const isPlayingElevator = useRef(false);
  const isPlayingDing = useRef(false);
  const lastTransitionState = useRef(isTransitioning);
  
  // Función para alternar el estado de silencio
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      // Guardar preferencia en localStorage
      localStorage.setItem('elevatorSoundMuted', String(newMuted));
      
      // Aplicar el silencio a los elementos de audio
      if (elevatorSound.current) {
        elevatorSound.current.muted = newMuted;
      }
      if (dingSound.current) {
        dingSound.current.muted = newMuted;
      }
      
      return newMuted;
    });
  }, []);
  
  // Cargar los sonidos una sola vez
  useEffect(() => {
    if (!soundsLoaded.current) {
      // Crear nuevas instancias de audio solo si no existen
      if (!elevatorSound.current) {
        elevatorSound.current = new Audio('/sounds/elevator-moving.mp3');
        elevatorSound.current.loop = true;
        elevatorSound.current.volume = 0.2;
        // Precarga del audio
        elevatorSound.current.load();
      }
      
      if (!dingSound.current) {
        dingSound.current = new Audio('/sounds/elevator-ding.mp3');
        dingSound.current.volume = 0.3;
        // Precarga del audio
        dingSound.current.load();
      }
      
      soundsLoaded.current = true;
    }
    
    // Aplicar estado de silencio inicial
    if (elevatorSound.current) {
      elevatorSound.current.muted = isMuted;
    }
    if (dingSound.current) {
      dingSound.current.muted = isMuted;
    }
    
    // Limpieza al desmontar
    return () => {
      if (elevatorSound.current) {
        elevatorSound.current.pause();
        elevatorSound.current = null;
      }
      if (dingSound.current) {
        dingSound.current.pause();
        dingSound.current = null;
      }
    };
  }, [isMuted]);
  
  // Gestionar la reproducción del sonido basado en el estado de transición
  useEffect(() => {
    // Si está silenciado, no reproducir nada
    if (isMuted) return;
    
    // Si no hay instancias de audio, no hacer nada
    if (!elevatorSound.current || !dingSound.current) return;
    
    // Detectar cambios reales en la transición
    if (isTransitioning !== lastTransitionState.current) {
      lastTransitionState.current = isTransitioning;
      
      const playElevatorSound = async () => {
        try {
          if (isTransitioning) {
            // Verificar si el sonido de ding está reproduciéndose
            if (isPlayingDing.current) {
              // Esperar un poco antes de intentar pausarlo
              await new Promise(resolve => setTimeout(resolve, 100));
              dingSound.current!.pause();
              dingSound.current!.currentTime = 0;
              isPlayingDing.current = false;
            }
            
            // Reproducir sonido de elevador en movimiento
            if (!isPlayingElevator.current) {
              isPlayingElevator.current = true;
              try {
                await elevatorSound.current!.play();
                console.log('Elevator sound playing');
              } catch (e) {
                console.warn('Could not play elevator sound:', e);
                isPlayingElevator.current = false;
              }
            }
          } else {
            // Detener el sonido del elevador
            if (isPlayingElevator.current) {
              elevatorSound.current!.pause();
              elevatorSound.current!.currentTime = 0;
              isPlayingElevator.current = false;
              
              // Esperar a que termine de pausarse antes de reproducir el ding
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Reproducir el sonido de ding al detenerse
            if (!isPlayingDing.current) {
              isPlayingDing.current = true;
              try {
                // Asegurarse de que el sonido se reproduzca desde el principio
                dingSound.current!.currentTime = 0;
                await dingSound.current!.play();
                console.log('Ding sound playing');
                
                // Cuando termina la reproducción, actualizar el estado
                dingSound.current!.onended = () => {
                  isPlayingDing.current = false;
                };
              } catch (e) {
                console.warn('Could not play ding sound:', e);
                isPlayingDing.current = false;
              }
            }
          }
        } catch (error) {
          console.error('Error managing elevator sounds:', error);
        }
      };
      
      playElevatorSound();
    }
  }, [isTransitioning, isMuted]);
  
  return { isMuted, toggleMute };
};
