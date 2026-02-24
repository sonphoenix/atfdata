import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const FloatingParticles = ({ isActive, count = 40 }) => {
  const pointsRef = useRef()
  
  // Create particle geometry
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      
      // Random positions in a sphere
      positions[i3] = (Math.random() - 0.5) * 15
      positions[i3 + 1] = (Math.random() - 0.5) * 10
      positions[i3 + 2] = (Math.random() - 0.5) * 8
      
      // Gentle velocities
      velocities[i3] = (Math.random() - 0.5) * 0.02
      velocities[i3 + 1] = Math.random() * 0.03
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01
      
      // Random sizes
      scales[i] = Math.random() * 0.5 + 0.3
    }
    
    return { positions, velocities, scales }
  }, [count])
  
  useFrame((state) => {
    if (!pointsRef.current || !isActive) return
    
    const positions = pointsRef.current.geometry.attributes.position.array
    const time = state.clock.elapsedTime
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      
      // Gentle floating motion
      positions[i3] += particles.velocities[i3]
      positions[i3 + 1] += particles.velocities[i3 + 1]
      positions[i3 + 2] += particles.velocities[i3 + 2]
      
      // Add wave motion
      positions[i3] += Math.sin(time + i) * 0.001
      positions[i3 + 1] += Math.cos(time + i * 0.5) * 0.002
      
      // Wrap around boundaries
      if (positions[i3] > 7.5) positions[i3] = -7.5
      if (positions[i3] < -7.5) positions[i3] = 7.5
      if (positions[i3 + 1] > 5) positions[i3 + 1] = -5
      if (positions[i3 + 2] > 4) positions[i3 + 2] = -4
      if (positions[i3 + 2] < -4) positions[i3 + 2] = 4
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true
    
    // Smooth fade in/out
    const targetOpacity = isActive ? 0.6 : 0
    pointsRef.current.material.opacity += (targetOpacity - pointsRef.current.material.opacity) * 0.05
  })
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#a0c4ff"
        transparent
        opacity={0}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

export default FloatingParticles