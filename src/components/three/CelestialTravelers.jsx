import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Single celestial object that travels along a curve path with trail
const CelestialTraveler = ({ 
  type, 
  startPos, 
  endPos, 
  delay, 
  duration,
  size,
  color 
}) => {
  const meshRef = useRef()
  const trailRef = useRef()
  const progress = useRef(0)
  const hasStarted = useRef(false)
  const startTime = useRef(0)
  const trailPoints = useRef([])
  
  // Create curved path using quadratic bezier
  const curve = useMemo(() => {
    const start = new THREE.Vector3(...startPos)
    const end = new THREE.Vector3(...endPos)
    
    // Control point for curve (creates the arc)
    const mid = new THREE.Vector3(
      (start.x + end.x) / 2 + (Math.random() - 0.5) * 8,
      (start.y + end.y) / 2 + (Math.random() - 0.5) * 8,
      (start.z + end.z) / 2 + Math.random() * 2
    )
    
    return new THREE.QuadraticBezierCurve3(start, mid, end)
  }, [startPos, endPos])
  
  // Star geometry
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    const outerRadius = size
    const innerRadius = size * 0.4
    const points = 5
    
    for (let i = 0; i < points * 2; i++) {
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      
      if (i === 0) shape.moveTo(x, y)
      else shape.lineTo(x, y)
    }
    shape.closePath()
    
    const geometry = new THREE.ShapeGeometry(shape)
    return geometry
  }, [size])
  
  // Moon geometry (crescent)
  const moonGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    
    // Outer arc
    shape.absarc(0, 0, size, 0, Math.PI * 2, false)
    
    // Inner cutout for crescent
    const hole = new THREE.Path()
    hole.absarc(size * 0.3, 0, size * 0.7, 0, Math.PI * 2, true)
    shape.holes.push(hole)
    
    const geometry = new THREE.ShapeGeometry(shape)
    return geometry
  }, [size])
  
  // Circle geometry
  const circleGeometry = useMemo(() => {
    return new THREE.CircleGeometry(size, 16)
  }, [size])
  
  const geometry = type === 'star' ? starGeometry : 
                   type === 'moon' ? moonGeometry : 
                   circleGeometry
  
  useFrame((state) => {
    if (!hasStarted.current) {
      if (state.clock.elapsedTime >= delay) {
        hasStarted.current = true
        startTime.current = state.clock.elapsedTime
        //console.log('🚀 Celestial object started traveling:', type)
      }
      return
    }
    
    const elapsed = state.clock.elapsedTime - startTime.current
    const t = Math.min(elapsed / duration, 1)
    
    // Easing function for smooth motion
    const eased = t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2
    
    progress.current = eased
    
    if (meshRef.current && t < 1) {
      // Get position on curve
      const point = curve.getPoint(eased)
      meshRef.current.position.copy(point)
      
      // Rotate slightly as it travels
      meshRef.current.rotation.z = eased * Math.PI * 2
      
      // Add current position to trail
      trailPoints.current.push(point.clone())
      
      // Keep trail length limited
      if (trailPoints.current.length > 30) {
        trailPoints.current.shift()
      }
      
      // Update trail geometry
      if (trailRef.current && trailPoints.current.length > 1) {
        const positions = []
        const opacities = []
        
        trailPoints.current.forEach((pt, i) => {
          positions.push(pt.x, pt.y, pt.z)
          // Fade out towards the back of the trail
          opacities.push(i / trailPoints.current.length)
        })
        
        trailRef.current.geometry.setFromPoints(
          trailPoints.current.map(p => new THREE.Vector3(p.x, p.y, p.z))
        )
        trailRef.current.geometry.attributes.position.needsUpdate = true
      }
    } else if (t >= 1) {
      // Finished traveling - stay at end position
      const endPoint = curve.getPoint(1)
      if (meshRef.current) {
        meshRef.current.position.copy(endPoint)
        
        // Gentle floating motion
        meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.05
      }
      
      // Clear trail
      trailPoints.current = []
    }
  })
  
  return (
    <group>
      {/* The celestial object itself */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshBasicMaterial
          color={color}
          transparent={true}
          opacity={Math.min(progress.current * 2, 1)}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Motion trail */}
      {trailPoints.current.length > 1 && (
        <line ref={trailRef}>
          <bufferGeometry />
          <lineBasicMaterial
            color="#ffffff"
            transparent={true}
            opacity={0.6}
            linewidth={2}
          />
        </line>
      )}
    </group>
  )
}

// Generate random celestial objects with paths (local space - relative to project)
const generateCelestialPaths = () => {
  const objects = []
  
  // Stars - coming from various edges, closer range
  for (let i = 0; i < 12; i++) {
    const side = Math.floor(Math.random() * 4) // 0=top, 1=right, 2=bottom, 3=left
    
    let startPos
    if (side === 0) { // from top
      startPos = [Math.random() * 6 - 3, 8, Math.random() * 2]
    } else if (side === 1) { // from right
      startPos = [8, Math.random() * 6 - 3, Math.random() * 2]
    } else if (side === 2) { // from bottom
      startPos = [Math.random() * 6 - 3, -8, Math.random() * 2]
    } else { // from left
      startPos = [-8, Math.random() * 6 - 3, Math.random() * 2]
    }
    
    const endPos = [
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      Math.random() * 1 - 0.5
    ]
    
    objects.push({
      type: 'star',
      startPos,
      endPos,
      delay: Math.random() * 0.5,
      duration: 0.8 + Math.random() * 0.4,
      size: 0.5 + Math.random() * 0.3,  // BIGGER
      color: '#FFD700'
    })
  }
  
  // Moons
  for (let i = 0; i < 6; i++) {
    const side = Math.floor(Math.random() * 4)
    
    let startPos
    if (side === 0) {
      startPos = [Math.random() * 6 - 3, 8, Math.random() * 2]
    } else if (side === 1) {
      startPos = [8, Math.random() * 6 - 3, Math.random() * 2]
    } else if (side === 2) {
      startPos = [Math.random() * 6 - 3, -8, Math.random() * 2]
    } else {
      startPos = [-8, Math.random() * 6 - 3, Math.random() * 2]
    }
    
    const endPos = [
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      Math.random() * 1 - 0.5
    ]
    
    objects.push({
      type: 'moon',
      startPos,
      endPos,
      delay: Math.random() * 0.6,
      duration: 1.0 + Math.random() * 0.5,
      size: 0.4 + Math.random() * 0.25,  // BIGGER
      color: '#FFA500'
    })
  }
  
  // Circles
  for (let i = 0; i < 8; i++) {
    const side = Math.floor(Math.random() * 4)
    
    let startPos
    if (side === 0) {
      startPos = [Math.random() * 6 - 3, 8, Math.random() * 2]
    } else if (side === 1) {
      startPos = [8, Math.random() * 6 - 3, Math.random() * 2]
    } else if (side === 2) {
      startPos = [Math.random() * 6 - 3, -8, Math.random() * 2]
    } else {
      startPos = [-8, Math.random() * 6 - 3, Math.random() * 2]
    }
    
    const endPos = [
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      Math.random() * 1 - 0.5
    ]
    
    objects.push({
      type: 'circle',
      startPos,
      endPos,
      delay: Math.random() * 0.4,
      duration: 0.6 + Math.random() * 0.3,
      size: 0.35 + Math.random() * 0.2,  // BIGGER
      color: '#FFEB3B'
    })
  }
  
  return objects
}

export const CelestialTravelers = ({ phase }) => {
  const objects = useMemo(() => {
    const generated = generateCelestialPaths()
    //console.log('✨ Generated celestial objects:', generated.length)
    return generated
  }, [])
  
  if (phase === 'exiting') return null
  
  //console.log('🌠 Rendering', objects.length, 'celestial travelers')
  
  return (
    <group>
      {objects.map((obj, i) => (
        <CelestialTraveler
          key={i}
          {...obj}
        />
      ))}
    </group>
  )
}