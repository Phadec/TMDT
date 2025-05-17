import { Float } from "@react-three/drei";

// 3D Model Component
const Model = () => {
  return (
    <Float rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>
    </Float>
  );
};

export default Model;