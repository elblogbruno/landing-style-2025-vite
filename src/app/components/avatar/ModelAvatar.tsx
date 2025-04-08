"use client";

import { useEffect, useRef, useState } from "react";
import { GroupProps, extend } from '@react-three/fiber';
import { 
  Group, 
  AnimationAction, 
  AnimationClip, 
  AnimationMixer, 
  Clock, 
  Mesh 
} from 'three';

// Extender los componentes de Three.js que utilizamos
extend({ Group, Mesh });


interface ModelAvatarProps extends GroupProps {
  onLoad?: () => void; 
  visible?: boolean;
  theme?: "dark" | "light";
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
  renderOrder?: number;
  delayLoadingMs?: number; // Optional delay before loading the model
}

const modelName = "bruno-draco.glb"; // Nombre del modelo 3D
const modelPath = `/models/${modelName}`; // Correct path based on your file structure

export default function ModelAvatar({ 
  onLoad, 
  visible = true,
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  scale = 1,
  renderOrder = 0,
  delayLoadingMs = 200, // Default small delay to ensure page has loaded
  ...props 
}: ModelAvatarProps) {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelData, setModelData] = useState<{ scene: Group; animations: AnimationClip[] } | null>(null);
  const model = useRef<Group>(null);
  const groupRef = useRef<Group>(null);
  const animActionsRef = useRef<Record<string, AnimationAction>>({});
  
  // Load model asynchronously after component mounts
  useEffect(() => {
    let isMounted = true;

    console.log("Loading model... " + renderOrder);
    
    // Function to load the model with THREE.js
    const loadModel = async () => {
      try {
        // Dynamically import the GLTFLoader and DRACOLoader to avoid bundling them on initial load
        const [{ GLTFLoader }, { DRACOLoader }] = await Promise.all([
          import('three/examples/jsm/loaders/GLTFLoader.js'),
          import('three/examples/jsm/loaders/DRACOLoader.js')
        ]);
        
        // Create and configure the DRACO loader
        const dracoLoader = new DRACOLoader();
        // Set the path to the Draco decoder (usually in your public folder)
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        
        // Create and configure the GLTF loader
        const loader = new GLTFLoader();
        // Attach the draco loader
        loader.setDRACOLoader(dracoLoader);
        
        // Create a promise to handle the loading
        return new Promise<{ scene: Group; animations: AnimationClip[] }>((resolve, reject) => {
          loader.load(
            modelPath,
            (gltf) => {
              if (isMounted) {
                resolve({
                  scene: gltf.scene,
                  animations: gltf.animations
                });
              }
            },
            (_progress) => {
              // You can track loading progress here if needed
              console.log(`${(_progress.loaded / _progress.total) * 100}% loaded`);
            },
            (error) => {
              console.error("Error loading 3D model:", error);
              reject(error);
            }
          );
        });
      } catch (error) {
        console.error("Failed to load model:", error);
        return null;
      }
    };
    
    // Delay loading to avoid blocking main thread during page load
    const timer = setTimeout(async () => {
      const result = await loadModel();
      if (result && isMounted) {
        setModelData(result);
        setModelLoaded(true);
      }
    }, delayLoadingMs);
    
    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [delayLoadingMs]);
  
  // Handle animations after model is loaded
  useEffect(() => {
    if (!modelLoaded || !modelData || !groupRef.current) return;
    
    // Set up animations
    const mixer = new AnimationMixer(modelData.scene);
    const animationActions: Record<string, AnimationAction> = {};
    
    modelData.animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      animationActions[clip.name] = action;
    });
    
    // Store in ref
    animActionsRef.current = animationActions;
    
    // Play the first animation if available
    const animationNames = Object.keys(animationActions);
    if (animationNames.length > 0 && animationActions[animationNames[0]]) {
      animationActions[animationNames[0]].play();
    }
    
    // Animation loop
    // let lastTime = 0;
    const clock = new Clock();
    
    const animate = () => {
      if (!modelLoaded) return;
      
      const delta = clock.getDelta();
      mixer.update(delta);
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    // Call onLoad callback when model is ready
    onLoad?.();
    
    // Cleanup
    return () => {
      mixer.stopAllAction();
    };
  }, [modelLoaded, modelData, onLoad]);

  // Apply renderOrder to the group
  // useEffect(() => {
  //   if (groupRef.current) {
  //     groupRef.current.traverse((object) => {
  //       if ((object as any).isMesh) {
  //         // Asignar renderOrder a todos los meshes del modelo
  //         (object as Mesh).renderOrder = renderOrder;
  //       }
  //     });
  //   }
  // }, [renderOrder, modelLoaded]);

  // If model isn't loaded yet, render an empty group or placeholder
  if (!modelLoaded || !modelData) {
    return (
      <group 
        ref={groupRef}
        {...props}
        position={position}
        rotation={rotation}
        scale={typeof scale === 'number' ? [scale, scale, scale] : scale}
        visible={visible}
      />
    );
  }

  return (
    <group 
      ref={groupRef}
      {...props} 
      dispose={null} 
      position={position}
      rotation={rotation}
      scale={typeof scale === 'number' ? [scale, scale, scale] : scale}
      visible={visible}
    >
      {/* Modelo 3D */}
      <primitive 
        ref={model} 
        object={modelData.scene} 
        castShadow
      />
    </group>
  );
}
