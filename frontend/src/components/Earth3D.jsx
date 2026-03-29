import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';

export default function Earth3D() {
  const sphereRef = useRef();

  useFrame(({ clock }) => {
    // Slowly rotate the sphere
    const elapsedTime = clock.getElapsedTime();
    if (sphereRef.current) {
      sphereRef.current.rotation.y = elapsedTime / 4;
      sphereRef.current.rotation.x = elapsedTime / 6;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={2.0} color="#fb923c" />
      <directionalLight position={[-10, -10, -5]} intensity={1.5} color="#fbbf24" />
      
      {/* Glow / core sphere */}
      <Sphere ref={sphereRef} args={[2.5, 64, 64]}>
        <MeshDistortMaterial
          color="#fdfbf7"
          envMapIntensity={0.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.2}
          roughness={0.4}
          wireframe={true}
          emissive="#f59e0b"
          emissiveIntensity={0.4}
          distort={0.4}
          speed={1.5}
        />
      </Sphere>
      
      {/* Outer atmosphere glow */}
      <Sphere args={[2.7, 32, 32]}>
        <meshBasicMaterial color="#fcd34d" transparent opacity={0.15} />
      </Sphere>
    </group>
  );
}
