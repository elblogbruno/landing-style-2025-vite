"use client";
import { motion } from "framer-motion";
import { useMemo } from "react";

interface AnimatedBackgroundProps {
  theme: "light" | "dark";
}

export default function AnimatedBackground({ theme }: AnimatedBackgroundProps) {
  // Memoizar las configuraciones de animación para evitar recálculos innecesarios
  const orbConfigs = useMemo(() => [
    // Orb 1 - Púrpura/Naranja
    {
      size: "40vw",
      blur: "60px",
      position: { top: "30%", left: "50%" },
      animation: {
        x: ["20vw", "-15vw", "5vw", "-25vw", "20vw"],
        y: ["-10vh", "15vh", "-20vh", "5vh", "-10vh"]
      },
      duration: 120,
      backgroundLight: "linear-gradient(135deg, rgba(255, 128, 77, 0.7), rgba(255, 77, 77, 0.5))",
      backgroundDark: "linear-gradient(135deg, rgba(91, 33, 182, 0.6), rgba(67, 56, 202, 0.3))",
      blendMode: { dark: "screen", light: "color-burn" }
    },
    // Orb 2 - Azul/Púrpura
    {
      size: "35vw",
      blur: "80px",
      position: { top: "50%", left: "40%" },
      animation: {
        x: ["-10vw", "25vw", "-5vw", "15vw", "-10vw"],
        y: ["15vh", "-20vh", "10vh", "-5vh", "15vh"]
      },
      duration: 130,
      backgroundLight: "linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.5))",
      backgroundDark: "linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(37, 99, 235, 0.2))",
      blendMode: { dark: "screen", light: "multiply" }
    },
    // Orb 3 - Púrpura/Amarillo-rojo
    {
      size: "45vw",
      blur: "70px",
      position: { top: "70%", left: "30%" },
      animation: {
        x: ["5vw", "-20vw", "15vw", "-10vw", "5vw"],
        y: ["-15vh", "5vh", "-25vh", "20vh", "-15vh"]
      },
      duration: 110,
      backgroundLight: "linear-gradient(135deg, rgba(255, 193, 7, 0.7), rgba(239, 68, 68, 0.4))",
      backgroundDark: "linear-gradient(135deg, rgba(124, 58, 237, 0.4), rgba(139, 92, 246, 0.2))",
      blendMode: { dark: "screen", light: "soft-light" }
    },
    // Orb 4 - Verde-azul
    {
      size: "30vw",
      blur: "90px",
      position: { top: "25%", left: "25%" },
      animation: {
        x: ["-15vw", "10vw", "-25vw", "5vw", "-15vw"],
        y: ["10vh", "-15vh", "5vh", "-25vh", "10vh"]
      },
      duration: 140,
      backgroundLight: "linear-gradient(135deg, rgba(16, 185, 129, 0.7), rgba(6, 182, 212, 0.5))",
      backgroundDark: "linear-gradient(135deg, rgba(6, 182, 212, 0.4), rgba(14, 165, 233, 0.2))",
      blendMode: { dark: "screen", light: "overlay" }
    },
    // Orb 5 - Índigo-verde
    {
      size: { width: "50vw", height: "20vw" },
      blur: "100px",
      position: { top: "85%", left: "70%" },
      animation: {
        x: ["15vw", "-5vw", "20vw", "-15vw", "15vw"],
        y: ["-5vh", "15vh", "-10vh", "20vh", "-5vh"]
      },
      duration: 125,
      backgroundLight: "linear-gradient(135deg, rgba(79, 70, 229, 0.6), rgba(16, 185, 129, 0.4))",
      backgroundDark: "linear-gradient(135deg, rgba(20, 184, 166, 0.3), rgba(6, 182, 212, 0.15))",
      blendMode: { dark: "screen", light: "color-dodge" }
    }
  ], []);

  // Orbe adicional solo para tema claro
  const lightOnlyOrb = useMemo(() => ({
    size: "25vw",
    blur: "120px",
    position: { top: "15%", left: "80%" },
    animation: {
      x: ["10vw", "-15vw", "5vw", "-20vw", "10vw"],
      y: ["-10vh", "20vh", "-15vh", "5vh", "-10vh"]
    },
    duration: 115,
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

      {/* Renderizar orbes principales con will-change para optimización */}
      {orbConfigs.map((config, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full will-change-transform"
          style={{
            filter: `blur(${config.blur})`,
            background: theme === "dark" ? config.backgroundDark : config.backgroundLight,
            width: typeof config.size === 'string' ? config.size : config.size.width,
            height: typeof config.size === 'string' ? config.size : config.size.height,
            top: config.position.top,
            left: config.position.left,
            mixBlendMode: (theme === "dark" ? config.blendMode.dark : config.blendMode.light) as React.CSSProperties["mixBlendMode"],
          }}
          animate={{
            x: config.animation.x,
            y: config.animation.y,
          }}
          transition={{
            duration: config.duration,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "loop"
          }}
        />
      ))}

      {/* Elemento adicional solo para tema claro */}
      {theme === "light" && (
        <motion.div
          className="absolute rounded-full will-change-transform"
          style={{
            filter: `blur(${lightOnlyOrb.blur})`,
            background: lightOnlyOrb.background,
            width: lightOnlyOrb.size,
            height: lightOnlyOrb.size,
            top: lightOnlyOrb.position.top,
            left: lightOnlyOrb.position.left,
            mixBlendMode: lightOnlyOrb.blendMode as React.CSSProperties["mixBlendMode"],
          }}
          animate={{
            x: lightOnlyOrb.animation.x,
            y: lightOnlyOrb.animation.y,
          }}
          transition={{
            duration: lightOnlyOrb.duration,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "loop"
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
