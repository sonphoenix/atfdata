import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export const Player = ({ position, rotation }) => {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime
      meshRef.current.position.y = position[1] + Math.sin(time * 3) * 0.15
    }
  })

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={0.8}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.6, 0.06, 8, 32]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={1.5}
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Shadow circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  )
}