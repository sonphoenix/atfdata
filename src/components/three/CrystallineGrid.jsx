import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Creates a low-poly crystalline mesh plane
const CrystallinePlane = ({ position, rotation, width, height, segments }) => {
  const meshRef = useRef()
  const verticesRef = useRef()
  
  // Create geometry with some randomized vertex heights for that crystal/paper fold effect
  const geometry = new THREE.PlaneGeometry(width, height, segments, segments)
  const positions = geometry.attributes.position.array
  
  // Randomize Z position of vertices slightly for paper fold effect
  for (let i = 0; i < positions.length; i += 3) {
    positions[i + 2] = Math.random() * 0.3 - 0.15
  }
  
  geometry.attributes.position.needsUpdate = true
  geometry.computeVertexNormals()
  
  // Extract vertices for rendering as points
  const vertices = []
  for (let i = 0; i < positions.length; i += 3) {
    vertices.push(
      positions[i],
      positions[i + 1],
      positions[i + 2]
    )
  }
  
  useFrame((state) => {
    if (meshRef.current) {
      // More visible opacity pulse
      meshRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
    if (verticesRef.current) {
      verticesRef.current.material.opacity = 0.8 + Math.sin(state.clock.elapsedTime * 0.8) * 0.2
    }
  })
  
  return (
    <group position={position} rotation={rotation}>
      {/* Wireframe mesh - more visible */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshBasicMaterial
          color="#4a9eff"
          wireframe={true}
          transparent={true}
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Vertex points - bigger and brighter */}
      <points ref={verticesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={vertices.length / 3}
            array={new Float32Array(vertices)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          color="#ffffff"
          transparent={true}
          opacity={0.9}
          sizeAttenuation={true}
        />
      </points>
    </group>
  )
}

export const CrystallineGrid = ({ phase }) => {
  const groupRef = useRef()
  
  useFrame((state) => {
    if (groupRef.current) {
      // Very subtle rotation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05
    }
  })
  
  return (
    <group ref={groupRef}>
      {/* Top left corner - large angular piece */}
      <CrystallinePlane
        position={[-5, 4, 1]}
        rotation={[Math.PI * 0.15, Math.PI * 0.2, -Math.PI * 0.1]}
        width={4}
        height={3}
        segments={2}
      />
      
      {/* Top right corner */}
      <CrystallinePlane
        position={[5, 4, 1]}
        rotation={[Math.PI * 0.15, -Math.PI * 0.2, Math.PI * 0.1]}
        width={4}
        height={3}
        segments={2}
      />
      
      {/* Bottom left corner */}
      <CrystallinePlane
        position={[-5, -4, 1]}
        rotation={[-Math.PI * 0.15, Math.PI * 0.2, Math.PI * 0.1]}
        width={4}
        height={3}
        segments={2}
      />
      
      {/* Bottom right corner */}
      <CrystallinePlane
        position={[5, -4, 1]}
        rotation={[-Math.PI * 0.15, -Math.PI * 0.2, -Math.PI * 0.1]}
        width={4}
        height={3}
        segments={2}
      />
      
      {/* Far left edge piece */}
      <CrystallinePlane
        position={[-6, 0, 0]}
        rotation={[0, Math.PI * 0.35, 0]}
        width={3}
        height={5}
        segments={2}
      />
      
      {/* Far right edge piece */}
      <CrystallinePlane
        position={[6, 0, 0]}
        rotation={[0, -Math.PI * 0.35, 0]}
        width={3}
        height={5}
        segments={2}
      />
    </group>
  )
}