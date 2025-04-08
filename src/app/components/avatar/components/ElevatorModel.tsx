import React, { Suspense } from 'react';
import { Text } from '@react-three/drei';
// import * as THREE from 'three';
import ModelAvatar from "../ModelAvatar";
import TVContent from './TVContent';

type SectionKey = 'hero' | 'about' | 'experience' | 'projects' | 'talks' | 'news' | 'education' | 'contact';

type ElevatorModelProps = {
  currentSection: SectionKey;
  theme: "dark" | "light";
  cameraY: number;
  currentFloor: number;
  floorDescription: string;
  isTransitioning: boolean;
  pitchLines: Record<SectionKey, string>;
  floors: Record<SectionKey, { y: number; floor: number; description: string; pitchLine: string; }>;
  onModelLoaded: () => void;
};

const ElevatorModel: React.FC<ElevatorModelProps> = ({
  currentSection,
  theme,
  cameraY,
  currentFloor,
  floorDescription,
  isTransitioning,
  pitchLines,
  floors,
  onModelLoaded
}) => {
  const colors = {
    background: theme === "dark" ? 'linear-gradient(to bottom, #0f172a, #1e293b)' : 'linear-gradient(to bottom, #e0f2fe, #f1f5f9)',
    fogColor: theme === "dark" ? '#1e293b' : '#e0f2fe',
    walls: theme === "dark" ? '#313b4b' : '#d1d5db',
    floor: theme === "dark" ? '#1e293b' : '#f1f5f9',
    railings: theme === "dark" ? '#b0b0b0' : '#94a3b8',
    ceiling: theme === "dark" ? '#1a2030' : '#f8fafc',
    highlight: theme === "dark" ? '#60a5fa' : '#3b82f6',
    metallic: theme === "dark" ? '#64748b' : '#cbd5e1',
    metalTrim: theme === "dark" ? '#94a3b8' : '#94a3b8'
  };

  return (
    <>
      <fog attach="fog" args={[colors.fogColor, 7, 20]} />
      <ambientLight intensity={theme === "dark" ? 0.6 : 0.8} />
      
      {/* Luz principal */}
      <directionalLight position={[0, 1, 2]} intensity={0.8} castShadow />
      
      {/* Caja del elevador con abertura frontal - esta se mueve entre pisos */}
      <group position={[0, cameraY - floors[currentSection].y, 0]}>
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
        
        {/* TV del elevador - versión más grande y realista */}
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
          
          {/* Pantalla del TV más grande - aseguramos que esté detrás del HTML */}
          <group position={[0, 0, 0.1]}> 
            <TVContent 
              currentSection={currentSection}
              theme={theme}
              pitchLines={pitchLines}
            /> 
          </group>

          {/* Efecto de reflejo en la pantalla - ahora completamente transparente */}
          <mesh position={[0, 0, 0.23]} rotation={[0, 0, 0]} renderOrder={100}>
            <planeGeometry args={[3.8, 1.8]} />
            <meshPhysicalMaterial 
              color="#ffffff"
              transparent={true}
              opacity={0.02}
              roughness={0.2}
              metalness={0.8}
              clearcoat={1}
              clearcoatRoughness={0.2}
              depthTest={false}
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
          <mesh position={[0, -0.3, 0.12]}>
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
                FLOOR {currentFloor}
              </Text>
            </mesh>
            
            {/* Descripción del piso */}
            <mesh position={[0.4, 0, 0]}>
              <Text
                color={colors.highlight}
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
                MOVING...
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
        
        {/* Reposicionamos al avatar para que no bloquee la pantalla */}
        <Suspense fallback={
          <mesh position={[0, -1, 0]}>
            <sphereGeometry args={[0.7, 16, 16]} />
            <meshStandardMaterial color={theme === "dark" ? "#60a5fa" : "#3b82f6"} />
          </mesh>
        }>
          <ModelAvatar 
            onLoad={onModelLoaded}  
            visible={true}
            theme={theme}
            position={[1.2, -2, 0.8]} 
            rotation={[0, -Math.PI/2 + 0.4, 0]} 
            scale={[1.55, 1.55, 1.55]} 
            renderOrder={1}
          />
        </Suspense>
      </group>
      
      {/* Pisos / secciones del edificio - elementos fijos */}
      {Object.entries(floors).map(([key, data]) => (
        <group key={`floor-marker-${key}`} position={[0, data.y, -3]}>
          <mesh position={[3, 0, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial 
              color={currentSection === key ? colors.highlight : "#475569"}
              emissive={currentSection === key ? colors.highlight : "#475569"}
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

export default ElevatorModel;
