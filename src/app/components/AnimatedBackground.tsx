"use client";
import { useMemo, useState, useEffect } from "react";
import styles from './AnimatedBackground.module.css';

interface AnimatedBackgroundProps {
  theme: "light" | "dark";
}

// Definimos la estructura de la propiedad animation
interface AnimationValues {
  x: string[];
  y: string[];
}

export default function AnimatedBackground({ theme }: AnimatedBackgroundProps) {
  // Detectar si es mobile para simplificar animaciones
  const [isMobile, setIsMobile] = useState(false);
  
  // Efecto para detectar dispositivo móvil y reducir complejidad en esos casos
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
      
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      window.addEventListener('resize', handleResize, { passive: true });
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
  // Memoizar las configuraciones de los orbes para evitar recálculos innecesarios
  const orbConfigs = useMemo(() => [
    // Orb 1 - Púrpura/Naranja
    {
      size: "40vw",
      blur: "60px",
      position: { top: "30%", left: "50%" },
      animationClass: styles.orb1,
      backgroundLight: "linear-gradient(135deg, rgba(255, 128, 77, 0.7), rgba(255, 77, 77, 0.5))",
      backgroundDark: "linear-gradient(135deg, rgba(91, 33, 182, 0.6), rgba(67, 56, 202, 0.3))",
      blendMode: { dark: "screen", light: "color-burn" },
      animation: { x: ['0%', '3%', '-3%', '0%'], y: ['0%', '-3%', '3%', '0%'] } as AnimationValues
    },
    // Orb 2 - Azul/Púrpura
    {
      size: "35vw",
      blur: "80px",
      position: { top: "50%", left: "40%" },
      animationClass: styles.orb2,
      backgroundLight: "linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.5))",
      backgroundDark: "linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(37, 99, 235, 0.2))",
      blendMode: { dark: "screen", light: "multiply" },
      animation: { x: ['0%', '3%', '-3%', '0%'], y: ['0%', '-3%', '3%', '0%'] } as AnimationValues
    },
    // Orb 3 - Púrpura/Amarillo-rojo
    {
      size: "45vw",
      blur: "70px",
      position: { top: "70%", left: "30%" },
      animationClass: styles.orb3,
      backgroundLight: "linear-gradient(135deg, rgba(255, 193, 7, 0.7), rgba(239, 68, 68, 0.4))",
      backgroundDark: "linear-gradient(135deg, rgba(124, 58, 237, 0.4), rgba(139, 92, 246, 0.2))",
      blendMode: { dark: "screen", light: "soft-light" },
      animation: { x: ['0%', '3%', '-3%', '0%'], y: ['0%', '-3%', '3%', '0%'] } as AnimationValues
    },
    // Orb 4 - Verde-azul
    {
      size: "30vw",
      blur: "90px",
      position: { top: "25%", left: "25%" },
      animationClass: styles.orb4,
      backgroundLight: "linear-gradient(135deg, rgba(16, 185, 129, 0.7), rgba(6, 182, 212, 0.5))",
      backgroundDark: "linear-gradient(135deg, rgba(6, 182, 212, 0.4), rgba(14, 165, 233, 0.2))",
      blendMode: { dark: "screen", light: "overlay" },
      animation: { x: ['0%', '3%', '-3%', '0%'], y: ['0%', '-3%', '3%', '0%'] } as AnimationValues
    },
    // Orb 5 - Índigo-verde
    {
      size: { width: "50vw", height: "20vw" },
      blur: "100px",
      position: { top: "85%", left: "70%" },
      animationClass: styles.orb5,
      backgroundLight: "linear-gradient(135deg, rgba(79, 70, 229, 0.6), rgba(16, 185, 129, 0.4))",
      backgroundDark: "linear-gradient(135deg, rgba(20, 184, 166, 0.3), rgba(6, 182, 212, 0.15))",
      blendMode: { dark: "screen", light: "color-dodge" },
      animation: { x: ['0%', '3%', '-3%', '0%'], y: ['0%', '-3%', '3%', '0%'] } as AnimationValues
    }
  ], []);

  // Orbe adicional solo para tema claro
  const lightOnlyOrb = useMemo(() => ({
    size: "25vw",
    blur: "120px",
    position: { top: "15%", left: "80%" },
    animationClass: styles.orb6,
    background: "linear-gradient(135deg, rgba(244, 63, 94, 0.4), rgba(251, 113, 133, 0.2))",
    blendMode: "overlay"
  }), []);

  // Memoizar el fondo base para evitar recálculos
  const baseBackground = useMemo(() => 
    theme === "dark"
      ? "linear-gradient(145deg, #0f0f1a 0%, #121212 100%)"
      : "linear-gradient(145deg, #f5f8ff 0%, #e4ecff 50%, #dce6ff 100%)",
  [theme]);

  return (
    <div
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

      {/* Renderizar orbes con animaciones CSS */}
      {!isMobile && orbConfigs.map((config, index) => (
        <div
          key={index}
          className={`absolute rounded-full ${config.animationClass}`}
          style={{
            filter: `blur(${config.blur})`,
            background: theme === "dark" ? config.backgroundDark : config.backgroundLight,
            width: typeof config.size === 'string' ? config.size : config.size.width,
            height: typeof config.size === 'string' ? config.size : config.size.height,
            top: config.position.top,
            left: config.position.left,
            mixBlendMode: (theme === "dark" ? config.blendMode.dark : config.blendMode.light) as React.CSSProperties["mixBlendMode"],
            transform: `translate(${config.animation?.x?.[0] || '0%'}, ${config.animation?.y?.[0] || '0%'})`,
          }}
        />
      ))}

      {/* Versión simplificada de orbes para móviles */}
      {isMobile && orbConfigs.map((config, index) => (
        <div
          key={index}
          className="absolute rounded-full"
          style={{
            filter: `blur(${parseInt(config.blur) * 0.7}px)`,
            background: theme === "dark" ? config.backgroundDark : config.backgroundLight,
            width: typeof config.size === 'string' ? config.size : config.size.width,
            height: typeof config.size === 'string' ? config.size : config.size.height,
            top: config.position.top,
            left: config.position.left,
            opacity: 0.7,
            mixBlendMode: (theme === "dark" ? config.blendMode.dark : config.blendMode.light) as React.CSSProperties["mixBlendMode"],
          }}
        />
      ))}

      {/* Elemento adicional solo para tema claro */}
      {theme === "light" && !isMobile && (
        <div
          className={`absolute rounded-full ${lightOnlyOrb.animationClass}`}
          style={{
            filter: `blur(${lightOnlyOrb.blur})`,
            background: lightOnlyOrb.background,
            width: lightOnlyOrb.size,
            height: lightOnlyOrb.size,
            top: lightOnlyOrb.position.top,
            left: lightOnlyOrb.position.left,
            mixBlendMode: lightOnlyOrb.blendMode as React.CSSProperties["mixBlendMode"],
          }}
        />
      )}

      {/* Versión estática para tema claro en móviles */}
      {theme === "light" && isMobile && (
        <div
          className="absolute rounded-full"
          style={{
            filter: `blur(${parseInt(lightOnlyOrb.blur) * 0.7}px)`,
            background: lightOnlyOrb.background,
            width: lightOnlyOrb.size,
            height: lightOnlyOrb.size,
            top: lightOnlyOrb.position.top,
            left: lightOnlyOrb.position.left,
            opacity: 0.7,
            mixBlendMode: lightOnlyOrb.blendMode as React.CSSProperties["mixBlendMode"],
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
