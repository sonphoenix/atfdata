import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// SUPER VISIBLE elliptical loop for debugging
const VisibleEllipticalLoop = ({ 
  radiusX = 6, 
  radiusY = 4, 
  radiusZ = 1,
  rotation = [0, 0, 0],
  position = [0, 0, 0],
  color = '#00ff00' // Bright green for visibility
}) => {
  const lineRef = useRef()
  const lightRef = useRef()
  const progress = useRef(0)
  
  // Create closed elliptical path
  const curve = useMemo(() => {
    const points = []
    const segments = 64
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const x = Math.cos(angle) * radiusX
      const y = Math.sin(angle) * radiusY
      const z = Math.sin(angle) * radiusZ
      points.push(new THREE.Vector3(x, y, z))
    }
    return new THREE.CatmullRomCurve3(points, true) // CLOSED LOOP
  }, [radiusX, radiusY, radiusZ])
  
  const lineGeometry = useMemo(() => {
    const points = curve.getPoints(64)
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [curve])
  
  useFrame((state) => {
    // Travel around the loop
    progress.current = (state.clock.elapsedTime * 0.2) % 1
    
    if (lightRef.current && curve) {
      const point = curve.getPoint(progress.current)
      lightRef.current.position.copy(point)
    }
  })
  
  return (
    <group position={position} rotation={rotation}>
      {/* The loop path - THICK and BRIGHT for visibility */}
      <line ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial
          color={color}
          transparent={false}
          linewidth={3}
        />
      </line>
      
      {/* Traveling light - BIG and BRIGHT */}
      <mesh ref={lightRef}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
        <pointLight color="#ffffff" intensity={2} distance={5} />
      </mesh>
    </group>
  )
}

// VISIBLE star on loop
const VisibleStarOnLoop = ({ 
  radiusX = 6, 
  radiusY = 4, 
  radiusZ = 1,
  rotation = [0, 0, 0],
  position = [0, 0, 0],
  size = 1.5, // BIGGER
  speed = 0.15,
  delay = 0,
  color = '#FFD700'
}) => {
  const meshRef = useRef()
  const progress = useRef(0)
  const startTime = useRef(null)
  
  // 5-pointed star
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    const outerRadius = size
    const innerRadius = size * 0.38
    
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 - Math.PI / 2
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      
      if (i === 0) shape.moveTo(x, y)
      else shape.lineTo(x, y)
    }
    shape.closePath()
    return new THREE.ShapeGeometry(shape)
  }, [size])
  
  const curve = useMemo(() => {
    const points = []
    const segments = 64
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const x = Math.cos(angle) * radiusX
      const y = Math.sin(angle) * radiusY
      const z = Math.sin(angle) * radiusZ
      points.push(new THREE.Vector3(x, y, z))
    }
    return new THREE.CatmullRomCurve3(points, true)
  }, [radiusX, radiusY, radiusZ])
  
  // Apply rotation to curve
  const rotatedCurve = useMemo(() => {
    const matrix = new THREE.Matrix4()
    matrix.makeRotationFromEuler(new THREE.Euler(...rotation))
    const rotatedPoints = curve.points.map(p => p.clone().applyMatrix4(matrix))
    return new THREE.CatmullRomCurve3(rotatedPoints, true)
  }, [curve, rotation])
  
  useFrame((state) => {
    if (!startTime.current) {
      if (state.clock.elapsedTime >= delay) {
        startTime.current = state.clock.elapsedTime
      }
      return
    }
    
    const elapsed = state.clock.elapsedTime - startTime.current
    progress.current = (elapsed * speed) % 1
    
    if (meshRef.current && rotatedCurve) {
      const point = rotatedCurve.getPoint(progress.current)
      meshRef.current.position.copy(point)
      meshRef.current.position.add(new THREE.Vector3(...position))
      
      // Face camera
      meshRef.current.quaternion.copy(state.camera.quaternion)
    }
  })
  
  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial 
        color={color}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// DEBUG VERSION - Everything VISIBLE
export const PersonaCelestialSystem = () => {
  console.log('🌟 PersonaCelestialSystem rendering!')
  
  return (
    <group>
      {/* Loop 1 - Bright GREEN horizontal */}
      <VisibleEllipticalLoop 
        radiusX={6} 
        radiusY={4} 
        radiusZ={1}
        rotation={[0, 0, 0]}
        position={[0, 0, 0]}
        color="#00ff00"
      />
      
      {/* Loop 2 - Bright RED tilted */}
      <VisibleEllipticalLoop 
        radiusX={5} 
        radiusY={5} 
        radiusZ={0.8}
        rotation={[Math.PI * 0.3, 0, 0]}
        position={[0, 0, -1]}
        color="#ff0000"
      />
      
      {/* Loop 3 - Bright BLUE */}
      <VisibleEllipticalLoop 
        radiusX={7} 
        radiusY={3} 
        radiusZ={1.2}
        rotation={[0, Math.PI * 0.3, 0]}
        position={[0, 0, -0.5]}
        color="#0080ff"
      />
      
      {/* LARGE visible stars on the loops */}
      <VisibleStarOnLoop
        radiusX={6}
        radiusY={4}
        radiusZ={1}
        rotation={[0, 0, 0]}
        position={[0, 0, 0]}
        size={1.5}
        speed={0.15}
        delay={0}
        color="#FFD700"
      />
      
      <VisibleStarOnLoop
        radiusX={5}
        radiusY={5}
        radiusZ={0.8}
        rotation={[Math.PI * 0.3, 0, 0]}
        position={[0, 0, -1]}
        size={1.3}
        speed={0.18}
        delay={0.5}
        color="#FFA500"
      />
    </group>
  )
}

export { VisibleEllipticalLoop, VisibleStarOnLoop }