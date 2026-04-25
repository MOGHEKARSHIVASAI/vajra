import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, MeshDistortMaterial } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

/**
 * Stylized 3D athlete figure built from primitive geometries.
 * Highlighted muscle groups pulse in primary red.
 */

type MuscleProps = { highlight?: boolean; position: [number, number, number]; args: [number, number, number]; rotation?: [number, number, number] };

function Muscle({ highlight = false, position, args, rotation = [0, 0, 0] }: MuscleProps) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (highlight && ref.current) {
      const m = ref.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.6 + Math.sin(clock.elapsedTime * 2) * 0.4;
    }
  });
  return (
    <mesh ref={ref} position={position} rotation={rotation} castShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={highlight ? "#ef2b2b" : "#1a1a1a"}
        emissive={highlight ? "#ff3b3b" : "#000000"}
        emissiveIntensity={highlight ? 0.8 : 0}
        roughness={0.4}
        metalness={0.3}
      />
    </mesh>
  );
}

function Athlete({ highlights = [] as string[] }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = Math.sin(clock.elapsedTime * 0.3) * 0.4;
  });

  const isHi = (k: string) => highlights.includes(k);

  return (
    <group ref={group} position={[0, -0.5, 0]}>
      {/* Head */}
      <mesh position={[0, 2.4, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Neck */}
      <Muscle position={[0, 1.95, 0]} args={[0.25, 0.2, 0.25]} />

      {/* Chest */}
      <Muscle highlight={isHi("chest")} position={[-0.3, 1.5, 0.05]} args={[0.45, 0.5, 0.4]} />
      <Muscle highlight={isHi("chest")} position={[0.3, 1.5, 0.05]} args={[0.45, 0.5, 0.4]} />

      {/* Shoulders */}
      <mesh position={[-0.75, 1.6, 0]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color={isHi("shoulders") ? "#ef2b2b" : "#1a1a1a"} emissive={isHi("shoulders") ? "#ff3b3b" : "#000"} emissiveIntensity={isHi("shoulders") ? 0.8 : 0} />
      </mesh>
      <mesh position={[0.75, 1.6, 0]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color={isHi("shoulders") ? "#ef2b2b" : "#1a1a1a"} emissive={isHi("shoulders") ? "#ff3b3b" : "#000"} emissiveIntensity={isHi("shoulders") ? 0.8 : 0} />
      </mesh>

      {/* Biceps */}
      <Muscle highlight={isHi("arms")} position={[-0.85, 1.05, 0]} args={[0.28, 0.55, 0.28]} />
      <Muscle highlight={isHi("arms")} position={[0.85, 1.05, 0]} args={[0.28, 0.55, 0.28]} />
      {/* Forearms */}
      <Muscle position={[-0.9, 0.4, 0]} args={[0.22, 0.5, 0.22]} />
      <Muscle position={[0.9, 0.4, 0]} args={[0.22, 0.5, 0.22]} />

      {/* Abs */}
      <Muscle highlight={isHi("core")} position={[0, 1.0, 0.1]} args={[0.55, 0.7, 0.35]} />

      {/* Hips */}
      <Muscle position={[0, 0.45, 0]} args={[0.7, 0.3, 0.4]} />

      {/* Quads */}
      <Muscle highlight={isHi("legs")} position={[-0.22, -0.15, 0.05]} args={[0.32, 0.85, 0.35]} />
      <Muscle highlight={isHi("legs")} position={[0.22, -0.15, 0.05]} args={[0.32, 0.85, 0.35]} />

      {/* Calves */}
      <Muscle position={[-0.22, -1.05, 0]} args={[0.26, 0.7, 0.28]} />
      <Muscle position={[0.22, -1.05, 0]} args={[0.26, 0.7, 0.28]} />

      {/* Glow orb behind */}
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <mesh position={[0, 1, -1.5]}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <MeshDistortMaterial color="#7a0000" transparent opacity={0.25} distort={0.4} speed={2} />
        </mesh>
      </Float>
    </group>
  );
}

interface MuscleModel3DProps {
  highlights?: string[];
  className?: string;
  enableControls?: boolean;
}

export const MuscleModel3D = ({ highlights = ["chest", "arms"], className, enableControls = true }: MuscleModel3DProps) => {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0.5, 5], fov: 45 }} dpr={[1, 2]} shadows>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#ff4444" />
        <pointLight position={[-5, 3, 5]} intensity={0.8} color="#ff8866" />
        <pointLight position={[0, -2, 3]} intensity={0.4} color="#ffffff" />
        <Suspense fallback={null}>
          <Athlete highlights={highlights} />
        </Suspense>
        {enableControls && (
          <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.8} />
        )}
      </Canvas>
    </div>
  );
};

export default MuscleModel3D;
