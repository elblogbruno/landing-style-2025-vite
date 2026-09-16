import React from 'react';
import { getFloorDisplayCode } from '../utils/elevator-altitude';
import './floor-atmosphere.css';

export type FloorKey = 'hero' | 'experience' | 'projects' | 'about' | 'talks' | 'awards' | 'education' | 'contact' | 'news';

interface FloorAtmosphereProps {
  section: FloorKey;
  theme?: 'light' | 'dark';
  showBadge?: boolean;
}

interface FloorConfig {

  accentColor: string;
  accentBorder: string;
  glowDark: string;
  glowLight: string;
  textureDark: React.CSSProperties;
  textureLight: React.CSSProperties;
}

const FLOOR_CONFIGS: Record<FloorKey, FloorConfig> = {
  hero: {

    accentColor: '#3b82f6',
    accentBorder: 'rgba(59, 130, 246, 0.35)',
    glowDark: 'radial-gradient(ellipse 95% 70% at 50% 0%, rgba(37, 99, 235, 0.22), rgba(99, 102, 241, 0.10) 45%, transparent 75%), radial-gradient(circle 600px at 90% 20%, rgba(56, 189, 248, 0.10), transparent 70%)',
    glowLight: 'radial-gradient(ellipse 95% 60% at 50% 0%, rgba(59, 130, 246, 0.12), rgba(99, 102, 241, 0.05) 45%, transparent 75%)',
    textureDark: {
      backgroundImage: `
        repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.02) 0, rgba(255, 255, 255, 0.02) 1px, transparent 0, transparent 48px),
        repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.02) 0, rgba(255, 255, 255, 0.02) 1px, transparent 0, transparent 48px)
      `,
    },
    textureLight: {
      backgroundImage: `
        repeating-linear-gradient(45deg, rgba(59, 130, 246, 0.025) 0, rgba(59, 130, 246, 0.025) 1px, transparent 0, transparent 48px),
        repeating-linear-gradient(-45deg, rgba(59, 130, 246, 0.025) 0, rgba(59, 130, 246, 0.025) 1px, transparent 0, transparent 48px)
      `,
    }
  },
  experience: {

    accentColor: '#06b6d4',
    accentBorder: 'rgba(6, 182, 212, 0.35)',
    glowDark: 'radial-gradient(ellipse 90% 65% at 90% 20%, rgba(6, 182, 212, 0.24), rgba(14, 165, 233, 0.12) 45%, transparent 75%), radial-gradient(ellipse 80% 65% at 10% 80%, rgba(13, 148, 136, 0.16), transparent 65%)',
    glowLight: 'radial-gradient(ellipse 90% 65% at 90% 20%, rgba(6, 182, 212, 0.12), transparent 70%), radial-gradient(ellipse 80% 65% at 10% 80%, rgba(14, 165, 233, 0.08), transparent 65%)',
    textureDark: {
      backgroundImage: `
        linear-gradient(to right, rgba(6, 182, 212, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(6, 182, 212, 0.04) 1px, transparent 1px),
        linear-gradient(to right, rgba(6, 182, 212, 0.08) 1px, transparent 1px)
      `,
      backgroundSize: '32px 32px, 32px 32px, 160px 100%'
    },
    textureLight: {
      backgroundImage: `
        linear-gradient(to right, rgba(6, 182, 212, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(6, 182, 212, 0.03) 1px, transparent 1px),
        linear-gradient(to right, rgba(6, 182, 212, 0.06) 1px, transparent 1px)
      `,
      backgroundSize: '32px 32px, 32px 32px, 160px 100%'
    }
  },
  projects: {

    accentColor: '#a855f7',
    accentBorder: 'rgba(168, 85, 247, 0.35)',
    glowDark: 'radial-gradient(ellipse 90% 70% at 15% 25%, rgba(168, 85, 247, 0.25), rgba(139, 92, 246, 0.14) 45%, transparent 75%), radial-gradient(ellipse 80% 65% at 85% 75%, rgba(192, 38, 211, 0.16), transparent 65%)',
    glowLight: 'radial-gradient(ellipse 90% 70% at 15% 25%, rgba(168, 85, 247, 0.12), transparent 70%), radial-gradient(ellipse 80% 65% at 85% 75%, rgba(192, 38, 211, 0.08), transparent 65%)',
    textureDark: {
      backgroundImage: `
        radial-gradient(circle, rgba(168, 85, 247, 0.14) 1.2px, transparent 1.2px),
        linear-gradient(to top, rgba(168, 85, 247, 0.04) 0%, transparent 40%)
      `,
      backgroundSize: '30px 30px, 100% 100%'
    },
    textureLight: {
      backgroundImage: `
        radial-gradient(circle, rgba(168, 85, 247, 0.08) 1.2px, transparent 1.2px),
        linear-gradient(to top, rgba(168, 85, 247, 0.02) 0%, transparent 40%)
      `,
      backgroundSize: '30px 30px, 100% 100%'
    }
  },
  about: {

    accentColor: '#f59e0b',
    accentBorder: 'rgba(245, 158, 11, 0.35)',
    glowDark: 'radial-gradient(ellipse 85% 65% at 85% 20%, rgba(245, 158, 11, 0.24), rgba(217, 119, 6, 0.12) 45%, transparent 70%), radial-gradient(ellipse 75% 65% at 15% 85%, rgba(239, 68, 68, 0.12), transparent 65%)',
    glowLight: 'radial-gradient(ellipse 85% 65% at 85% 20%, rgba(245, 158, 11, 0.12), transparent 70%), radial-gradient(ellipse 75% 65% at 15% 85%, rgba(239, 68, 68, 0.06), transparent 65%)',
    textureDark: {
      backgroundImage: `
        repeating-linear-gradient(90deg, transparent 0px, transparent 28px, rgba(245, 158, 11, 0.025) 28px, rgba(245, 158, 11, 0.05) 29px, rgba(245, 158, 11, 0.05) 31px, rgba(245, 158, 11, 0.02) 32px, transparent 32px, transparent 36px)
      `,
    },
    textureLight: {
      backgroundImage: `
        repeating-linear-gradient(90deg, transparent 0px, transparent 28px, rgba(245, 158, 11, 0.015) 28px, rgba(245, 158, 11, 0.035) 29px, rgba(245, 158, 11, 0.035) 31px, rgba(245, 158, 11, 0.01) 32px, transparent 32px, transparent 36px)
      `,
    }
  },
  talks: {

    accentColor: '#38bdf8',
    accentBorder: 'rgba(56, 189, 248, 0.35)',
    glowDark: 'radial-gradient(ellipse 95% 60% at 50% 5%, rgba(56, 189, 248, 0.25), rgba(14, 165, 233, 0.12) 40%, transparent 75%), radial-gradient(circle 500px at 15% 70%, rgba(99, 102, 241, 0.14), transparent 65%)',
    glowLight: 'radial-gradient(ellipse 95% 60% at 50% 5%, rgba(56, 189, 248, 0.12), transparent 70%), radial-gradient(circle 500px at 15% 70%, rgba(99, 102, 241, 0.06), transparent 65%)',
    textureDark: {
      backgroundImage: `
        radial-gradient(ellipse 70% 60% at 20% 0%, rgba(56, 189, 248, 0.12), transparent 70%),
        radial-gradient(ellipse 70% 60% at 80% 0%, rgba(56, 189, 248, 0.12), transparent 70%),
        repeating-linear-gradient(180deg, rgba(56, 189, 248, 0.02) 0, rgba(56, 189, 248, 0.02) 2px, transparent 2px, transparent 48px)
      `,
    },
    textureLight: {
      backgroundImage: `
        radial-gradient(ellipse 70% 60% at 20% 0%, rgba(56, 189, 248, 0.06), transparent 70%),
        radial-gradient(ellipse 70% 60% at 80% 0%, rgba(56, 189, 248, 0.06), transparent 70%),
        repeating-linear-gradient(180deg, rgba(56, 189, 248, 0.015) 0, rgba(56, 189, 248, 0.015) 2px, transparent 2px, transparent 48px)
      `,
    }
  },
  news: {

    accentColor: '#38bdf8',
    accentBorder: 'rgba(56, 189, 248, 0.35)',
    glowDark: 'radial-gradient(ellipse 95% 60% at 50% 5%, rgba(56, 189, 248, 0.25), rgba(14, 165, 233, 0.12) 40%, transparent 75%), radial-gradient(circle 500px at 15% 70%, rgba(99, 102, 241, 0.14), transparent 65%)',
    glowLight: 'radial-gradient(ellipse 95% 60% at 50% 5%, rgba(56, 189, 248, 0.12), transparent 70%), radial-gradient(circle 500px at 15% 70%, rgba(99, 102, 241, 0.06), transparent 65%)',
    textureDark: {
      backgroundImage: `
        radial-gradient(ellipse 70% 60% at 20% 0%, rgba(56, 189, 248, 0.12), transparent 70%),
        radial-gradient(ellipse 70% 60% at 80% 0%, rgba(56, 189, 248, 0.12), transparent 70%),
        repeating-linear-gradient(180deg, rgba(56, 189, 248, 0.02) 0, rgba(56, 189, 248, 0.02) 2px, transparent 2px, transparent 48px)
      `,
    },
    textureLight: {
      backgroundImage: `
        radial-gradient(ellipse 70% 60% at 20% 0%, rgba(56, 189, 248, 0.06), transparent 70%),
        radial-gradient(ellipse 70% 60% at 80% 0%, rgba(56, 189, 248, 0.06), transparent 70%),
        repeating-linear-gradient(180deg, rgba(56, 189, 248, 0.015) 0, rgba(56, 189, 248, 0.015) 2px, transparent 2px, transparent 48px)
      `,
    }
  },
  awards: {

    accentColor: '#eab308',
    accentBorder: 'rgba(234, 179, 8, 0.35)',
    glowDark: 'radial-gradient(ellipse 90% 65% at 85% 30%, rgba(234, 179, 8, 0.25), rgba(202, 138, 4, 0.12) 40%, transparent 75%), radial-gradient(circle 550px at 15% 75%, rgba(245, 158, 11, 0.14), transparent 65%)',
    glowLight: 'radial-gradient(ellipse 90% 65% at 85% 30%, rgba(234, 179, 8, 0.12), transparent 70%), radial-gradient(circle 550px at 15% 75%, rgba(245, 158, 11, 0.06), transparent 65%)',
    textureDark: {
      backgroundImage: `
        linear-gradient(to top, rgba(234, 179, 8, 0.08) 0%, rgba(234, 179, 8, 0.02) 40%, transparent 100%),
        repeating-linear-gradient(60deg, rgba(234, 179, 8, 0.02) 0, rgba(234, 179, 8, 0.02) 1px, transparent 0, transparent 72px),
        repeating-linear-gradient(-60deg, rgba(234, 179, 8, 0.02) 0, rgba(234, 179, 8, 0.02) 1px, transparent 0, transparent 72px)
      `,
    },
    textureLight: {
      backgroundImage: `
        linear-gradient(to top, rgba(234, 179, 8, 0.04) 0%, transparent 50%),
        repeating-linear-gradient(60deg, rgba(234, 179, 8, 0.015) 0, rgba(234, 179, 8, 0.015) 1px, transparent 0, transparent 72px),
        repeating-linear-gradient(-60deg, rgba(234, 179, 8, 0.015) 0, rgba(234, 179, 8, 0.015) 1px, transparent 0, transparent 72px)
      `,
    }
  },
  education: {

    accentColor: '#10b981',
    accentBorder: 'rgba(16, 185, 129, 0.35)',
    glowDark: 'radial-gradient(ellipse 90% 65% at 20% 30%, rgba(16, 185, 129, 0.24), rgba(5, 150, 105, 0.12) 45%, transparent 75%), radial-gradient(ellipse 80% 65% at 85% 75%, rgba(20, 184, 166, 0.14), transparent 65%)',
    glowLight: 'radial-gradient(ellipse 90% 65% at 20% 30%, rgba(16, 185, 129, 0.12), transparent 70%), radial-gradient(ellipse 80% 65% at 85% 75%, rgba(20, 184, 166, 0.06), transparent 65%)',
    textureDark: {
      backgroundImage: `
        linear-gradient(rgba(16, 185, 129, 0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(16, 185, 129, 0.035) 1px, transparent 1px),
        linear-gradient(rgba(16, 185, 129, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(16, 185, 129, 0.08) 1px, transparent 1px)
      `,
      backgroundSize: '24px 24px, 24px 24px, 120px 120px, 120px 120px'
    },
    textureLight: {
      backgroundImage: `
        linear-gradient(rgba(16, 185, 129, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(16, 185, 129, 0.02) 1px, transparent 1px),
        linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)
      `,
      backgroundSize: '24px 24px, 24px 24px, 120px 120px, 120px 120px'
    }
  },
  contact: {

    accentColor: '#22c55e',
    accentBorder: 'rgba(34, 197, 94, 0.35)',
    glowDark: 'radial-gradient(ellipse 95% 65% at 50% 20%, rgba(34, 197, 94, 0.22), rgba(59, 130, 246, 0.14) 45%, transparent 75%), radial-gradient(circle 550px at 50% 90%, rgba(16, 185, 129, 0.12), transparent 65%)',
    glowLight: 'radial-gradient(ellipse 95% 65% at 50% 20%, rgba(34, 197, 94, 0.12), transparent 70%), radial-gradient(circle 550px at 50% 90%, rgba(59, 130, 246, 0.06), transparent 65%)',
    textureDark: {
      backgroundImage: `
        repeating-linear-gradient(-45deg, rgba(34, 197, 94, 0.03) 0, rgba(34, 197, 94, 0.03) 16px, transparent 16px, transparent 32px),
        linear-gradient(to right, transparent 49.5%, rgba(34, 197, 94, 0.08) 50%, transparent 50.5%)
      `,
    },
    textureLight: {
      backgroundImage: `
        repeating-linear-gradient(-45deg, rgba(34, 197, 94, 0.02) 0, rgba(34, 197, 94, 0.02) 16px, transparent 16px, transparent 32px),
        linear-gradient(to right, transparent 49.5%, rgba(34, 197, 94, 0.05) 50%, transparent 50.5%)
      `,
    }
  },
};

/**
 * Componente FloorAtmosphere
 * Aplica una ambientación lumínica y de textura física muy sutil y natural
 * en el fondo de cada sección, sin invadir ni repetir placas de contenido.
 */
export const FloorAtmosphere: React.FC<FloorAtmosphereProps> = ({ 
  section, 
  theme = 'dark'
}) => {
  const config = FLOOR_CONFIGS[section] || FLOOR_CONFIGS.hero;

  const backgroundGradient = theme === 'dark' ? config.glowDark : config.glowLight;
  const textureStyle = theme === 'dark' ? config.textureDark : config.textureLight;

  return (
    <div 
      className={`floor-room floor-room--${section} floor-room--${theme} absolute inset-0 z-0 pointer-events-none overflow-hidden`}
      aria-hidden="true"
    >
      <div className="floor-room__architecture" />
      <div className="floor-room__ceiling" />
      <div className="floor-room__number">{getFloorDisplayCode(section)}</div>
      <div className="floor-room__ground" />
      {/* Halo ambiental cromático suave */}
      <div 
        className="absolute inset-0 transition-all duration-700" 
        style={{ 
          backgroundImage: backgroundGradient,
          willChange: 'background-image'
        }}
      />

      {/* Textura física sutil de material de planta */}
      <div 
        className="absolute inset-0 opacity-60 dark:opacity-75 transition-opacity pointer-events-none"
        style={textureStyle}
      />

      {/* Delicado corte estructural de piso al pie de sección */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none opacity-40 dark:opacity-30"
        style={{
          background: `linear-gradient(to right, transparent 10%, ${config.accentColor} 50%, transparent 90%)`
        }}
      />
    </div>
  );
};

export default FloorAtmosphere;
