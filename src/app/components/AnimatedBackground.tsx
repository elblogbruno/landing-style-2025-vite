"use client";
import { useMemo, useState, useEffect, memo, useRef } from "react";
import styles from './AnimatedBackground.module.css';

interface AnimatedBackgroundProps {
  theme: "light" | "dark";
  onLoad?: () => void; // Añadimos la prop onLoad
} 

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ theme, onLoad }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  // Detectar si es mobile para simplificar animaciones
  const [isMobile, setIsMobile] = useState(false);
  // Usar state para detectar prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Efecto para detectar dispositivo móvil y reducir complejidad en esos casos
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
      
      // Check if user prefers reduced motion
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      const handleReducedMotionChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      window.addEventListener('resize', handleResize, { passive: true });
      mediaQuery.addEventListener('change', handleReducedMotionChange);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        mediaQuery.removeEventListener('change', handleReducedMotionChange);
      };
    }
  }, []);
  
  // Memoizar las configuraciones de los orbes para evitar recálculos innecesarios
  const orbConfigs = useMemo(() => [
    // Reduced number of orbs and simplified positioning
    // Orb 1 - Púrpura/Naranja
    {
      size: "40vw" as string | { width: string; height: string },
      blur: "60px",
      position: { top: "30%", left: "50%" },
      animationClass: !prefersReducedMotion && !isMobile ? styles.orb1 : '',
      backgroundLight: "linear-gradient(135deg, rgba(255, 128, 77, 0.7), rgba(255, 77, 77, 0.5))",
      backgroundDark: "linear-gradient(135deg, rgba(91, 33, 182, 0.6), rgba(67, 56, 202, 0.3))",
      blendMode: { dark: "screen", light: "color-burn" },
    },
    // Orb 2 - Azul/Púrpura
    {
      size: "35vw" as string | { width: string; height: string },
      blur: "80px",
      position: { top: "50%", left: "40%" },
      animationClass: !prefersReducedMotion && !isMobile ? styles.orb2 : '',
      backgroundLight: "linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.5))",
      backgroundDark: "linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(37, 99, 235, 0.2))",
      blendMode: { dark: "screen", light: "multiply" },
    },
    // Orb 3 - Púrpura/Amarillo-rojo
    {
      size: "45vw" as string | { width: string; height: string },
      blur: "70px",
      position: { top: "70%", left: "30%" },
      animationClass: !prefersReducedMotion && !isMobile ? styles.orb3 : '',
      backgroundLight: "linear-gradient(135deg, rgba(255, 193, 7, 0.7), rgba(239, 68, 68, 0.4))",
      backgroundDark: "linear-gradient(135deg, rgba(124, 58, 237, 0.4), rgba(139, 92, 246, 0.2))",
      blendMode: { dark: "screen", light: "soft-light" },
    }
  ], [isMobile, prefersReducedMotion]);

  // Orbe adicional solo para tema claro
  const lightOnlyOrb = useMemo(() => ({
    size: "25vw",
    blur: "120px",
    position: { top: "15%", left: "80%" },
    animationClass: !prefersReducedMotion && !isMobile ? styles.orb6 : '',
    background: "linear-gradient(135deg, rgba(244, 63, 94, 0.4), rgba(251, 113, 133, 0.2))",
    blendMode: "overlay"
  }), [isMobile, prefersReducedMotion]);

  // Memoizar el fondo base para evitar recálculos
  const baseBackground = useMemo(() => 
    theme === "dark"
      ? "linear-gradient(145deg, #0f0f1a 0%, #121212 100%)"
      : "linear-gradient(145deg, #f5f8ff 0%, #e4ecff 50%, #dce6ff 100%)",
  [theme]);

  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      
      // Notificar que el componente está listo para ser mostrado
      if (onLoad) {
        // Pequeño retraso para permitir que los estilos se apliquen
        setTimeout(onLoad, 100);
      }
    }
    
    // Asegurar que el fondo permanezca con la opacidad correcta
    const container = containerRef.current;
    if (container) {
      container.style.opacity = '1';
    }
    
    return () => {
      // No desmontamos el componente de fondo - solo cambiamos su tema
    };
  }, [theme, onLoad, isInitialized]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{
        background: baseBackground,
        width: "100vw",
        height: "100vh",
      }}
    >
      {/* Leve efecto de brillo */}
      <div
        className={`absolute inset-0 ${
          theme === "dark"
            ? "bg-[radial-gradient(circle_at_50%_50%,rgba(50,50,120,0.1),transparent_70%)]"
            : "bg-[radial-gradient(ellipse_at_top,rgba(120,150,255,0.3),transparent_70%)]"
        }`}
      />
      
      {/* Degradado adicional para tema claro */}
      {theme === "light" && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,200,150,0.2),transparent_70%)]" />
      )}

      {/* Renderizar orbes con animaciones CSS condicionalmente */}
      {orbConfigs.map((config, index) => (
        <div
          key={index}
          className={`absolute rounded-full ${config.animationClass}`}
          style={{
            filter: `blur(${isMobile ? parseInt(config.blur) * 0.7 : config.blur})`,
            background: theme === "dark" ? config.backgroundDark : config.backgroundLight,
            width: typeof config.size === 'string' ? config.size : config.size.width,
            height: typeof config.size === 'string' ? config.size : config.size.height,
            top: config.position.top,
            left: config.position.left,
            opacity: isMobile ? 0.7 : 1,
            mixBlendMode: (theme === "dark" ? config.blendMode.dark : config.blendMode.light) as React.CSSProperties["mixBlendMode"],
            willChange: !prefersReducedMotion && !isMobile ? 'transform' : 'auto',
          }}
        />
      ))}

      {/* Elemento adicional solo para tema claro */}
      {theme === "light" && (
        <div
          className={`absolute rounded-full ${lightOnlyOrb.animationClass}`}
          style={{
            filter: `blur(${isMobile ? parseInt(lightOnlyOrb.blur) * 0.7 : lightOnlyOrb.blur})`,
            background: lightOnlyOrb.background,
            width: lightOnlyOrb.size,
            height: lightOnlyOrb.size,
            top: lightOnlyOrb.position.top,
            left: lightOnlyOrb.position.left,
            opacity: isMobile ? 0.7 : 1,
            mixBlendMode: lightOnlyOrb.blendMode as React.CSSProperties["mixBlendMode"],
            willChange: !prefersReducedMotion && !isMobile ? 'transform' : 'auto',
          }}
        />
      )}

      {/* Textura de ruido con opacidad adaptada al tema */}
      <div
        className={`absolute inset-0 pointer-events-none ${theme === "dark" ? "opacity-[0.03]" : "opacity-[0.015]"}`}
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          backgroundRepeat: "repeat",
        }}
      />
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(AnimatedBackground);
