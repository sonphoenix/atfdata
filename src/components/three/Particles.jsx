import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

export function Particles() {
  const starsRef = useRef()
  const particlesCnt = 3000
  const [isReady, setIsReady] = useState(false)
  
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particlesCnt * 3)
    for (let i = 0; i < particlesCnt; i++) {
      // Distribute particles in a large sphere
      const radius = 25 + Math.random() * 75 // 25-100 units away
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
    }
    return positions
  }, [])

  // Use the star.png texture from public/textures
  const texture = useTexture('/textures/star.png', (loadedTexture) => {
    // Texture loaded callback
    setIsReady(true)
  })

  useFrame((state) => {
    if (starsRef.current && isReady) {
      starsRef.current.rotation.y += 0.0002
      starsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1
    }
  })

  // Don't render until texture is loaded
  if (!isReady) {
    return null
  }

  return (
    <group ref={starsRef}>
      <points renderOrder={1}>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            count={particlesCnt} 
            array={particlePositions} 
            itemSize={3} 
          />
        </bufferGeometry>
        <pointsMaterial
          color={'#00d4ff'}
          size={1}
          map={texture}
          blending={THREE.AdditiveBlending}
          transparent={true}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </points>
    </group>
  )
}

// Create an additional fast-moving particle layer
export function FastParticles() {
  const particlesRef = useRef()
  const particlesCnt = 1000
  const [isReady, setIsReady] = useState(false)
  
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particlesCnt * 3)
    for (let i = 0; i < particlesCnt; i++) {
      // Closer particles
      const radius = 5 + Math.random() * 20 // 5-25 units away
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
    }
    return positions
  }, [])

  // Small delay to allow main particles to load first
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useFrame((state) => {
    if (particlesRef.current && isReady) {
      particlesRef.current.rotation.y += 0.0005
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2
    }
  })

  if (!isReady) {
    return null
  }

  return (
    <points ref={particlesRef} renderOrder={2}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={particlesCnt} 
          array={particlePositions} 
          itemSize={3} 
        />
      </bufferGeometry>
      <pointsMaterial
        color={'#6366f1'}
        size={0.1}
        blending={THREE.AdditiveBlending}
        transparent={true}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </points>
  )
}