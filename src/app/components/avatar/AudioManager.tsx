import { useEffect, useState } from 'react';

const AudioManager = () => {
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    // Comprobar si el audio ya ha sido habilitado
    const isEnabled = localStorage.getItem('audioEnabled') === 'true';
    setAudioEnabled(isEnabled);

    // Inicializar audio al interactuar con la página
    const enableAudio = () => {
      if (!audioEnabled) {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Crear un oscilador silencioso y reproducirlo brevemente para habilitar el audio
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        gainNode.gain.value = 0; // Silenciar el oscilador
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.start(0);
        oscillator.stop(0.001);
        
        // Marcar como habilitado
        setAudioEnabled(true);
        localStorage.setItem('audioEnabled', 'true');
        
        // Eliminar los event listeners una vez habilitado
        document.removeEventListener('click', enableAudio);
        document.removeEventListener('touchstart', enableAudio);
      }
    };

    // Agregar event listeners si el audio no está habilitado
    if (!audioEnabled) {
      document.addEventListener('click', enableAudio);
      document.addEventListener('touchstart', enableAudio);
    }

    return () => {
      // Limpiar event listeners al desmontar
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
    };
  }, [audioEnabled]);

  // Este componente no renderiza nada visible
  return null;
};

export default AudioManager;
