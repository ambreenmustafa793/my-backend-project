import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const globalMouse = { x: 0, y: 0 };

function ParticleField() {
  const mesh = useRef<THREE.Points>(null);
  const particleCount = 800;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const cyberViolet = new THREE.Color('#8A2BE2');
    const electricCyan = new THREE.Color('#00FFFF');

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      const color = cyberViolet.clone().lerp(electricCyan, Math.random());
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.getElapsedTime();
    const positionAttribute = mesh.current.geometry.getAttribute('position');

    for (let i = 0; i < particleCount; i++) {
      const ix = i * 3;
      const x = positions[ix];
      const y = positions[ix + 1];
      const z = positions[ix + 2];
      const mouseX = globalMouse.x * 5;
      const mouseY = globalMouse.y * 5;
      const dx = x - mouseX;
      const dy = y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 3) {
        const force = (3 - distance) / 3;
        positionAttribute.setX(i, x + Math.sin(time * 2 + i) * 0.1 + dx * force * 0.3);
        positionAttribute.setY(i, y + Math.cos(time * 2 + i) * 0.1 + dy * force * 0.3);
      } else {
        positionAttribute.setX(i, x + Math.sin(time * 0.5 + i * 0.1) * 0.2);
        positionAttribute.setY(i, y + Math.cos(time * 0.5 + i * 0.1) * 0.2);
      }
      positionAttribute.setZ(i, z + Math.sin(time + i) * 0.5);
    }
    positionAttribute.needsUpdate = true;
    mesh.current.rotation.z = time * 0.02;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.8} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  );
}

function GridMesh() {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.getElapsedTime();
    mesh.current.rotation.x = Math.sin(time * 0.1) * 0.1 + 0.3;
    mesh.current.rotation.y = time * 0.05;
  });

  return (
    <mesh ref={mesh} position={[0, 0, -5]}>
      <planeGeometry args={[30, 30, 40, 40]} />
      <meshBasicMaterial color="#8A2BE2" wireframe transparent opacity={0.1} />
    </mesh>
  );
}

export default function ThreeBackground() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      globalMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      globalMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-0 opacity-60">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }} style={{ background: '#030307' }}>
        <ambientLight intensity={0.5} />
        <ParticleField />
        <GridMesh />
      </Canvas>
    </div>
  );
}
