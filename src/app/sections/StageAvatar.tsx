import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, Clone, useGLTF } from '@react-three/drei';

function PresenterModel() {
  const { scene } = useGLTF('/models/bruno-draco.glb');
  return <Bounds fit clip observe margin={1.05}><Clone object={scene} /></Bounds>;
}

export default function StageAvatar() {
  return (
    <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [0, 1, 4], fov: 32 }} gl={{ alpha: true }}>
      <ambientLight intensity={1.8} />
      <directionalLight position={[2, 4, 5]} intensity={2.5} />
      <Suspense fallback={null}><PresenterModel /></Suspense>
    </Canvas>
  );
}
