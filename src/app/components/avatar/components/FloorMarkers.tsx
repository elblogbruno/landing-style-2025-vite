import React from 'react';
import { Text } from '@react-three/drei';
import { SectionKey } from '../types';

interface FloorMarkersProps {
  currentSection: SectionKey;
  floors: Record<SectionKey, { 
    y: number; 
    floor: number; 
    description: string; 
    pitchLine: string; 
  }>;
  theme: "dark" | "light";
}

const FloorMarkers: React.FC<FloorMarkersProps> = ({ currentSection, floors, theme }) => {
  const highlightColor = theme === "dark" ? '#60a5fa' : '#3b82f6';
  
  return (
    <>
      {Object.entries(floors).map(([key, data]) => (
        <group key={`floor-marker-${key}`} position={[0, data.y, -3]}>
          <mesh position={[3, 0, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial 
              color={currentSection === key ? highlightColor : "#475569"}
              emissive={currentSection === key ? highlightColor : "#475569"}
              emissiveIntensity={currentSection === key ? 0.8 : 0.1}
            />
          </mesh>
          <Text
            position={[4, 0, 0]}
            color={currentSection === key ? "#ffffff" : "#94a3b8"}
            fontSize={0.2}
            anchorX="left"
          >
            {`${data.floor}F: ${data.description}`}
          </Text>
        </group>
      ))}
    </>
  );
};

export default FloorMarkers;
