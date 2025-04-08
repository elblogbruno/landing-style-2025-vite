import { Html } from '@react-three/drei'; 
import React, { lazy } from 'react';

const ElevatorSlides = lazy(() => import('../ElevatorSlides'));

type SectionKey = 'hero' | 'about' | 'experience' | 'projects' | 'talks' | 'news' | 'education' | 'contact';

type TVContentProps = {
  currentSection: SectionKey;
  theme: "dark" | "light";
  pitchLines: Record<SectionKey, string>;
};

const TVContent: React.FC<TVContentProps> = ({ currentSection, theme, pitchLines }) => {
  return (
    <Html
      transform
      occlude
      position={[0, 0, 0.1]}
    >
      <div style={{
          width: '1600px',
          height: '600px',
          transform: 'scale(2.55)',
          transformOrigin: 'center center',
          willChange: 'transform' // Mejora de rendimiento
      }}>
          <ElevatorSlides
              currentSection={currentSection}
              theme={theme}
              pitchLines={pitchLines}
          />
      </div>
    </Html>
  );
};

export default TVContent;
