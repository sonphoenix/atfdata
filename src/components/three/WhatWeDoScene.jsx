import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'

// Preload models
useGLTF.preload('/models/terminal/terminal.glb')
useGLTF.preload('/models/chart/chart.glb')

const TerminalModel = () => {
  const { scene } = useGLTF('/models/terminal/terminal.glb')
  const ref = useRef()
  
  useFrame((state) => {
    if (ref.current) {
      // Subtle floating animation
      const time = state.clock.elapsedTime
      ref.current.position.y = Math.sin(time * 0.5) * 0.05
    }
  })
  
  return (
    <primitive 
      ref={ref}
      object={scene} 
      scale={[0.5, 0.5, 0.5]} // Smaller terminal
      position={[0, -0.3, 0]}
    />
  )
}

const ChartModel = () => {
  const { scene } = useGLTF('/models/chart/chart.glb')
  const ref = useRef()
  
  useFrame((state) => {
    if (ref.current) {
      // Subtle floating animation
      const time = state.clock.elapsedTime
      ref.current.position.y = Math.sin(time * 0.5) * 0.05
    }
  })
  
  return (
    <primitive 
      ref={ref}
      object={scene} 
      scale={[1.0, 1.0, 1.0]} // Normal chart size
      position={[0, 0, 0]}
    />
  )
}

const WhatWeDoScene = ({ serviceIndex = 0 }) => {
  const groupRef = useRef()

  useFrame((state) => {
    if (!groupRef.current) return
    
    // Auto-rotation only (no user control)
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
  })

  return (
    <>
      <group ref={groupRef} position={[0, 0, 0]}>
        {serviceIndex === 0 ? (
          <TerminalModel />
        ) : (
          <ChartModel />
        )}
      </group>
      
      {/* Basic lighting */}
      <ambientLight intensity={0.7} />
      <pointLight position={[5, 5, 5]} intensity={0.8} />
      <Environment preset="studio" />
    </>
  )
}

export default WhatWeDoScene