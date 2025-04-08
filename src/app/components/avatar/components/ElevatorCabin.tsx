import React, { Suspense, useEffect } from 'react';
import { SectionKey } from '../types';
import ModelAvatar from "../ModelAvatar";
import ElevatorTV from './ElevatorTV'; 
import { track } from '../../../utils/umami-analytics';

interface ElevatorCabinProps {
  currentSection: SectionKey;
  theme: "dark" | "light";
  floors: Record<SectionKey, { 
    y: number; 
    floor: number; 
    description: string; 
    pitchLine: string; 
  }>;
  currentFloor: number;
  floorDescription: string;
  isTransitioning: boolean;
  onModelLoaded: () => void;
}

const ElevatorCabin: React.FC<ElevatorCabinProps> = ({
  currentSection,
  theme,
  floors,
  currentFloor,
  floorDescription,
  isTransitioning,
  onModelLoaded
}) => {
  // Extraer las pitch lines para pasarlas al componente
  const pitchLines = Object.entries(floors).reduce((acc, [key, value]) => {
    acc[key as SectionKey] = value.pitchLine;
    return acc;
  }, {} as Record<SectionKey, string>);

  // Track section changes and transitions
  useEffect(() => {
    track({
      category: 'ElevatorCabin',
      action: 'SectionChange',
      label: `To ${currentSection}: ${floorDescription}`
    });
  }, [currentSection, floorDescription]);

  useEffect(() => {
    if (isTransitioning) {
      track({
        category: 'ElevatorCabin',
        action: 'TransitionStarted',
        label: `Floor ${currentFloor}: ${floorDescription}`
      });
    }
  }, [isTransitioning, currentFloor, floorDescription]);

  // Track model loading with more detailed info
  const handleModelLoaded = () => {
    track({
      category: 'ElevatorCabin',
      action: 'ModelLoaded',
      label: `Section: ${currentSection}, Theme: ${theme}`
    });
    onModelLoaded();
  };

  // Colores basados en el tema
  const colors = {
    metallic: theme === "dark" ? '#64748b' : '#cbd5e1',
    ceiling: theme === "dark" ? '#1a2030' : '#f8fafc',
    walls: theme === "dark" ? '#313b4b' : '#d1d5db',
    metalTrim: theme === "dark" ? '#94a3b8' : '#94a3b8'
  };

  return (
    <>
      {/* Piso */}
      <mesh position={[0, -2, 0]} receiveShadow>
        <boxGeometry args={[5, 0.2, 5]} />
        <meshPhysicalMaterial 
          color={colors.metallic} 
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>
      
      {/* Techo */}
      <mesh position={[0, 3, 0]} receiveShadow>
        <boxGeometry args={[5, 0.2, 5]} />
        <meshPhysicalMaterial 
          color={colors.ceiling} 
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      
      {/* Luz del techo */}
      <pointLight position={[0, 1.9, 0]} intensity={1} color="#ffffff" />
      
      {/* Paredes laterales */}
      <mesh position={[-2.5, 0, 0]} receiveShadow>
        <boxGeometry args={[0.2, 6, 5]} />
        <meshPhysicalMaterial 
          color={colors.walls} 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      <mesh position={[2.5, 0, 0]} receiveShadow>
        <boxGeometry args={[0.2, 6, 5]} />
        <meshPhysicalMaterial 
          color={colors.walls} 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Pared trasera */}
      <mesh position={[0, 0, -2.5]} receiveShadow>
        <boxGeometry args={[5, 6, 0.2]} />
        <meshPhysicalMaterial 
          color={colors.walls} 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Pasamanos */}
      <mesh position={[0, -0.5, -2.3]} receiveShadow>
        <boxGeometry args={[4, 0.1, 0.1]} />
        <meshStandardMaterial 
          color={colors.metalTrim}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* TV del elevador */}
      <ElevatorTV 
        currentSection={currentSection}
        theme={theme}
        pitchLines={pitchLines}
        floorDescription={floorDescription}
        currentFloor={currentFloor}
        isTransitioning={isTransitioning}
      />
      
      {/* Avatar */}
      <Suspense fallback={
        <mesh position={[0, -1, 0]}>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshStandardMaterial color={theme === "dark" ? "#60a5fa" : "#3b82f6"} />
        </mesh>
      }>
        <ModelAvatar 
          onLoad={handleModelLoaded}  
          visible={true}
          theme={theme}
          position={[1.2, -2, 0.8]} 
          rotation={[0, -Math.PI/2 + 0.4, 0]} 
          scale={[1.55, 1.55, 1.55]} 
          renderOrder={1} // Aseguramos que se renderice antes que el HTML para la oclusión
        />
      </Suspense>
    </>
  );
};

export default ElevatorCabin;
