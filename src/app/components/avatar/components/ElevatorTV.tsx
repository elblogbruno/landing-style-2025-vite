import React from 'react';
import { Text } from '@react-three/drei';
import { SectionKey } from '../types';
import { useTranslation } from 'react-i18next';

interface ElevatorTVProps {
  currentSection: SectionKey;
  theme: "dark" | "light";
  pitchLines: Record<SectionKey, string>;
  floorDescription: string;
  currentFloor: number;
  isTransitioning: boolean;
}

const ElevatorTV: React.FC<ElevatorTVProps> = ({ 
  currentSection, 
  theme, 
  pitchLines, 
  floorDescription, 
  currentFloor, 
  isTransitioning 
}) => {
  const { t } = useTranslation();
  
  return (
    <group position={[0, 0.9, -2.4]} rotation={[0, 0, 0]}>
      {/* Marco de la TV más grande */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4, 2, 0.15]} />
        <meshStandardMaterial 
          color={theme === "dark" ? "#0f0f0f" : "#1f1f1f"} 
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      
      {/* Bisel interior */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[3.9, 1.9, 0.05]} />
        <meshStandardMaterial 
          color={theme === "dark" ? "#1c1c1c" : "#2c2c2c"} 
          metalness={0.7}
          roughness={0.1}
        />
      </mesh>
      
      {/* Pantalla del TV más grande - aseguramos que esté detrás del HTML */}
      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={[3.8, 1.8]} />
        <meshBasicMaterial 
          color={theme === "dark" ? "#0c1836" : "#0a617f"} 
          transparent={false}
          opacity={1}
        />
      </mesh>

      {/* Efecto de reflejo en la pantalla - ahora completamente transparente */}
      <mesh position={[0, 0, 0.23]} rotation={[0, 0, 0]} renderOrder={100}>
        <planeGeometry args={[3.8, 1.8]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transparent={true}
          opacity={0.02} // Mucho más sutil para no tapar el contenido
          roughness={0.2}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.2}
          depthTest={false} // Desactivar prueba de profundidad
        />
      </mesh>

      {/* Logo de la compañía o edificio */}
      <mesh position={[-1.7, 0.7, 0.13]} renderOrder={2}>
        <Text
          color={theme === "dark" ? "#60a5fa" : "#0ea5e9"}
          fontSize={0.2}
          font="/fonts/Inter-ExtraBold.woff"
          anchorX="left"
          anchorY="middle"
        >
          GLASSEAR CORP
        </Text>
      </mesh>
      
      {/* Fecha y hora (elemento común en pantallas de elevador) */}
      <mesh position={[1.7, 0.7, 0.12]}>
        <Text
          color="#ffffff"
          fontSize={0.14}
          font="/fonts/Inter-SemiBold.woff"
          anchorX="right"
          anchorY="middle"
        >
          {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </Text>
      </mesh>
      
      {/* Texto del pitch con estilo de TV - más grande y central */}
      <mesh position={[0, 0, 0.12]}>
        <Text
          color="#ffffff"
          fontSize={0.18}
          maxWidth={3.4}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Medium.woff"
          lineHeight={1.3}
          letterSpacing={0.02}
          material-toneMapped={false}
        >
          {pitchLines[currentSection]}
        </Text>
      </mesh>
      
      {/* Ticker de noticias en la parte inferior (como en muchos elevadores) */}
      <mesh position={[0, -0.8, 0.12]}>
        <planeGeometry args={[3.6, 0.15]} />
        <meshBasicMaterial 
          color={theme === "dark" ? "#0f172a" : "#075985"} 
        />
      </mesh>
      
      {/* Información de piso con iconos */}
      <group position={[0, -0.8, 0.13]}>
        {/* Icono de piso */}
        <mesh position={[-1.6, 0, 0]}>
          <planeGeometry args={[0.14, 0.14]} />
          <meshBasicMaterial 
            color="#ffffff"
            transparent={true}
            opacity={0.9}
          />
        </mesh>
        
        {/* Número de piso destacado */}
        <mesh position={[-1.3, 0, 0]}>
          <Text
            color="#ffffff"
            fontSize={0.14}
            font="/fonts/Inter-Bold.woff"
            anchorX="left"
            anchorY="middle"
          >
            {t('elevator.floor')} {currentFloor}
          </Text>
        </mesh>
        
        {/* Descripción del piso */}
        <mesh position={[0.4, 0, 0]}>
          <Text
            color={theme === "dark" ? "#60a5fa" : "#3b82f6"}
            fontSize={0.13}
            font="/fonts/Inter-Medium.woff"
            anchorX="center"
            anchorY="middle"
          >
            {floorDescription}
          </Text>
        </mesh>
      </group>
      
      {/* Indicador visual de transición (cuando el elevador se mueve) */}
      {isTransitioning && (
        <mesh position={[1.6, -0.8, 0.13]}>
          <Text
            color="#ff9900"
            fontSize={0.12}
            font="/fonts/Inter-Bold.woff"
            anchorX="right"
            anchorY="middle"
          >
            {t('elevator.moving')}
          </Text>
        </mesh>
      )}
      
      {/* Efecto de luz ambiental alrededor de la TV */}
      <pointLight
        position={[0, 0, 0.5]}
        distance={1}
        intensity={0.3}
        color={theme === "dark" ? "#3b82f6" : "#0ea5e9"}
      />
      
      {/* Pequeño LED indicador - estilo standby */}
      <mesh position={[-1.85, -0.85, 0.08]}>
        <sphereGeometry args={[0.03, 10, 10]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
    </group>
  );
};

export default ElevatorTV;
