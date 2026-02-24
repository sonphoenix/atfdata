import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// SUPER VISIBLE grid for debugging
export const WireframeDiamondGrid = () => {
  const groupRef = useRef()
  
  console.log('🔷 WireframeDiamondGrid rendering!')
  
  // Create VISIBLE wireframe
  const geometry = useMemo(() => {
    const size = 20
    const divisions = 8
    const vertices = []
    const step = size / divisions
    
    // Horizontal lines
    for (let i = 0; i <= divisions; i++) {
      const y = -size / 2 + i * step
      vertices.push(-size / 2, y, 0)
      vertices.push(size / 2, y, 0)
    }
    
    // Vertical lines (MORE for tall diamonds)
    for (let i = 0; i <= divisions * 2; i++) {
      const x = -size / 2 + (i * step / 2)
      vertices.push(x, -size / 2, 0)
      vertices.push(x, size / 2, 0)
    }
    
    // Diagonal lines
    for (let i = 0; i <= divisions * 2; i++) {
      for (let j = 0; j <= divisions; j++) {
        const x = -size / 2 + (i * step / 2)
        const y = -size / 2 + j * step
        
        if (i < divisions * 2 && j < divisions) {
          // Diagonals
          vertices.push(x, y, 0)
          vertices.push(x + step / 2, y + step, 0)
          
          vertices.push(x, y, 0)
          vertices.push(x + step / 2, y - step, 0)
        }
      }
    }
    
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    
    return geom
  }, [])
  
  useFrame((state) => {
    if (groupRef.current) {
      // Subtle animation
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.03
    }
  })
  
  return (
    <group ref={groupRef} position={[0, 0, -3]}>
      {/* BRIGHT VISIBLE grid */}
      <lineSegments geometry={geometry}>
        <lineBasicMaterial 
          color="#00ffff" 
          transparent={false}
          opacity={1}
          linewidth={2}
        />
      </lineSegments>
      
      {/* Second layer */}
      <lineSegments geometry={geometry} position={[0, 0, -0.5]}>
        <lineBasicMaterial 
          color="#ffffff" 
          transparent={true}
          opacity={0.5}
          linewidth={1}
        />
      </lineSegments>
    </group>
  )
}