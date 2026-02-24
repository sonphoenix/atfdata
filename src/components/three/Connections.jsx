import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Helper function to determine path color based on node IDs
const getPathColor = (fromId, toId) => {
  // Software Engineer path nodes (top row)
  const softwareNodes = ['proj-2', 'proj-4', 'proj-6', 'proj-8', 'proj-10', 'proj-12', 'proj-14', 'proj-16']
  // Data Analyst path nodes (bottom row)
  const dataNodes = ['proj-3', 'proj-5', 'proj-7', 'proj-9', 'proj-11', 'proj-13']
  
  // Check if both nodes are in software path (including connections to proj-1)
  if (softwareNodes.includes(fromId) && softwareNodes.includes(toId)) {
    return '#a855f7' // Blue for software engineer path
  }
  // Check if both nodes are in data path (including connections to proj-1)
  else if (dataNodes.includes(fromId) && dataNodes.includes(toId)) {
    return '#22d3ee' // Cyan for data analyst path
  }
  // Connection from proj-1 to either path
  else if (fromId === 'proj-1' || toId === 'proj-1') {
    if (softwareNodes.includes(fromId) || softwareNodes.includes(toId)) {
      return '#a855f7' // Software path from start
    } else {
      return '#22d3ee' // Data path from start
    }
  }
  
  return '#cccccc' // Default gray for any cross connections (though there shouldn't be any)
}

// Connection path between nodes
export const ConnectionPath = ({ from, to, fromId, toId, active }) => {
  const ref = useRef()
  const isInitialized = useRef(false)
  
  const points = useMemo(() => {
    const start = new THREE.Vector3(...from)
    const end = new THREE.Vector3(...to)
    const mid = new THREE.Vector3().lerpVectors(start, end, 0.5)
    mid.y += 1.5 // Slight arc
    
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
    return curve.getPoints(50)
  }, [from, to])
  
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    geometry.computeBoundingSphere()
    return geometry
  }, [points])

  const pathColor = useMemo(() => getPathColor(fromId, toId), [fromId, toId])

  // Pre-warm material and force shader compilation
  useEffect(() => {
    if (ref.current && !isInitialized.current) {
      ref.current.material.needsUpdate = true
      isInitialized.current = true
    }
  }, [])
  
  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.elapsedTime
      ref.current.material.opacity = 0.4 + Math.sin(time * 2) * 0.15
    }
  })
  
  return (
    <line ref={ref} geometry={lineGeometry}>
      <lineBasicMaterial
        color={pathColor}
        linewidth={active ? 4 : 2}
        transparent
        opacity={active ? 0.8 : 0.5}
      />
    </line>
  )
}

// Flowing particles along connection - OPTIMIZED
export const ConnectionParticles = ({ from, to, fromId, toId }) => {
  const particlesRef = useRef()
  const count = 15
  const isInitialized = useRef(false)
  const updateCounter = useRef(0)
  
  const curve = useMemo(() => {
    const start = new THREE.Vector3(...from)
    const end = new THREE.Vector3(...to)
    const mid = new THREE.Vector3().lerpVectors(start, end, 0.5)
    mid.y += 1.5
    return new THREE.QuadraticBezierCurve3(start, mid, end)
  }, [from, to])
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const t = i / count
      const point = curve.getPoint(t)
      pos[i * 3] = point.x
      pos[i * 3 + 1] = point.y
      pos[i * 3 + 2] = point.z
    }
    return pos
  }, [curve, count])

  const particleColor = useMemo(() => getPathColor(fromId, toId), [fromId, toId])

  // Pre-warm the geometry and force GPU upload
  useEffect(() => {
    if (particlesRef.current && !isInitialized.current) {
      particlesRef.current.geometry.computeBoundingSphere()
      particlesRef.current.geometry.attributes.position.needsUpdate = true
      particlesRef.current.material.needsUpdate = true
      isInitialized.current = true
    }
  }, [])
  
  useFrame((state) => {
    if (particlesRef.current) {
      if (updateCounter.current < 3) {
        updateCounter.current++
        return
      }

      const time = state.clock.elapsedTime
      const posArray = particlesRef.current.geometry.attributes.position.array
      
      for (let i = 0; i < count; i++) {
        const t = ((time * 0.25 + i / count) % 1)
        const point = curve.getPoint(t)
        posArray[i * 3] = point.x
        posArray[i * 3 + 1] = point.y
        posArray[i * 3 + 2] = point.z
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        color={particleColor}
        transparent
        opacity={0.9}
      />
    </points>
  )
}