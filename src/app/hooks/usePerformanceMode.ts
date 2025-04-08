"use client";

import { useState, useEffect } from 'react';

export const usePerformanceMode = () => {
  const [isLowPerformanceMode, setIsLowPerformanceMode] = useState(false);
  
  useEffect(() => {
    // Detectar dispositivos móviles o de bajo rendimiento
    const checkPerformance = () => {
      // Comprobación de dispositivo móvil
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Comprobación de memoria (cuando está disponible)
      const hasLowMemory = 'deviceMemory' in navigator && 
        (navigator as any).deviceMemory < 4;
      
      // Comprobación de núcleos de CPU (cuando está disponible)
      const hasLowCPU = 'hardwareConcurrency' in navigator && 
        navigator.hardwareConcurrency < 4;
      
      // Velocidad de conexión
      const hasLowBandwidth = 'connection' in navigator && 
        (navigator as any).connection && 
        ((navigator as any).connection.effectiveType === '2g' || 
        (navigator as any).connection.effectiveType === 'slow-2g');
      
      setIsLowPerformanceMode(isMobile || hasLowMemory || hasLowCPU || hasLowBandwidth);
    };
    
    checkPerformance();
    
    // También podríamos comprobar FPS con un monitor de rendimiento
    // pero eso es más complejo y no lo implementamos aquí
    
  }, []);
  
  return { isLowPerformanceMode };
};
