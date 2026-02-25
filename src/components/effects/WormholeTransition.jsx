import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise'

// Speed lines that radiate from center
const SpeedLines = ({ progress, intensity, reverse }) => {
  const linesRef = useRef()
  
  const { positions, count } = useMemo(() => {
    const count = 100
    const positions = new Float32Array(count * 3 * 2)
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const startRadius = 5 + Math.random() * 5
      const endRadius = 30 + Math.random() * 20
      
      positions[i * 6] = Math.cos(angle) * startRadius
      positions[i * 6 + 1] = Math.sin(angle) * startRadius
      positions[i * 6 + 2] = -10 - Math.random() * 40
      
      positions[i * 6 + 3] = Math.cos(angle) * endRadius
      positions[i * 6 + 4] = Math.sin(angle) * endRadius
      positions[i * 6 + 5] = positions[i * 6 + 2]
    }
    
    return { positions, count }
  }, [])

  useFrame((state) => {
    if (linesRef.current) {
      const positions = linesRef.current.geometry.attributes.position.array
      const speed = (2 + intensity * 8) * (reverse ? -1 : 1)
      
      for (let i = 0; i < count; i++) {
        const i6 = i * 6
        positions[i6 + 2] += speed
        positions[i6 + 5] += speed
        
        if (reverse) {
          if (positions[i6 + 2] < -50) {
            positions[i6 + 2] = 20 + Math.random() * 20
            positions[i6 + 5] = positions[i6 + 2]
          }
        } else {
          if (positions[i6 + 2] > 20) {
            positions[i6 + 2] = -50 - Math.random() * 20
            positions[i6 + 5] = positions[i6 + 2]
          }
        }
      }
      
      linesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count * 2}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#00d4ff"
        transparent
        opacity={progress * intensity * 0.8}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  )
}

// Particle streaks for motion blur effect
const MotionBlurParticles = ({ progress, speed, reverse }) => {
  const particlesRef = useRef()
  
  const { positions, velocities, count } = useMemo(() => {
    const count = 300
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count)
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 8
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = Math.sin(angle) * radius
      positions[i * 3 + 2] = -Math.random() * 100
      velocities[i] = 0.5 + Math.random() * 1.5
    }
    
    return { positions, velocities, count }
  }, [])

  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const direction = reverse ? -1 : 1
        positions[i3 + 2] += velocities[i] * (1 + speed * 4) * direction
        
        if (reverse) {
          if (positions[i3 + 2] < -100) {
            positions[i3 + 2] = 10 + Math.random() * 50
            const angle = Math.random() * Math.PI * 2
            const radius = Math.random() * 8
            positions[i3] = Math.cos(angle) * radius
            positions[i3 + 1] = Math.sin(angle) * radius
          }
        } else {
          if (positions[i3 + 2] > 10) {
            positions[i3 + 2] = -100 - Math.random() * 50
            const angle = Math.random() * Math.PI * 2
            const radius = Math.random() * 8
            positions[i3] = Math.cos(angle) * radius
            positions[i3 + 1] = Math.sin(angle) * radius
          }
        }
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
        size={0.15}
        color="#FFD700"
        transparent
        opacity={progress * 0.7}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

// Radial blur rings
const RadialBlurRings = ({ progress, intensity, reverse }) => {
  const ringsRef = useRef()
  
  useFrame((state) => {
    if (ringsRef.current) {
      const rotationSpeed = (2 + intensity * 3) * (reverse ? -1 : 1)
      ringsRef.current.rotation.z = state.clock.elapsedTime * rotationSpeed
    }
  })

  return (
    <group ref={ringsRef}>
      {[8, 12, 16, 20].map((radius, i) => (
        <mesh key={i} position={[0, 0, -15 - i * 10]}>
          <ringGeometry args={[radius * 0.95, radius, 32]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? "#00d4ff" : "#6366f1"}
            transparent
            opacity={progress * intensity * (0.3 - i * 0.05)}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

const WormholeTransition = ({ 
  isActive, 
  onComplete,
  duration = 5.0,
  onProgressUpdate,
  reverse = false,
  waitForReady = false,
  minDuration = 4.0
}) => {
  const groupRef = useRef()
  const { camera } = useThree()
  const progressRef = useRef(reverse ? 1 : 0)
  const speedRef = useRef(0)
  const isWaitingRef = useRef(false)
  const startTimeRef = useRef(0)
  const fallbackTimeoutRef = useRef(null) // NEW: Fallback timeout
  const initialCameraState = useRef({
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    fov: 50
  })

  // Create the wormhole tunnel geometry
  const { tubeA, tubeB } = useMemo(() => {
    const noise = new ImprovedNoise()
    const radius = 3.5
    const tubeLength = 200
    const tubeGeo = new THREE.CylinderGeometry(radius, radius, tubeLength, 128, 4096, true)
    const tubeVerts = tubeGeo.attributes.position
    const colors = []
    
    const noisefreq = 0.12
    const noiseAmp = 0.6
    const hueNoiseFreq = 0.004
    const color = new THREE.Color()
    const p = new THREE.Vector3()
    const v3 = new THREE.Vector3()

    for (let i = 0; i < tubeVerts.count; i += 1) {
      p.fromBufferAttribute(tubeVerts, i)
      v3.copy(p)
      
      let vertexNoise = noise.noise(
        v3.x * noisefreq,
        v3.y * noisefreq,
        v3.z
      )
      v3.addScaledVector(p, vertexNoise * noiseAmp)
      tubeVerts.setXYZ(i, v3.x, p.y, v3.z)
      
      let colorNoise = noise.noise(
        v3.x * hueNoiseFreq, 
        v3.y * hueNoiseFreq, 
        i * 0.001 * hueNoiseFreq
      )
      
      const hue = 0.55 - colorNoise * 0.4
      const saturation = 0.9 + colorNoise * 0.1
      const lightness = 0.4 + Math.abs(colorNoise) * 0.3
      color.setHSL(hue, saturation, lightness)
      colors.push(color.r, color.g, color.b)
    }

    const mat = new THREE.PointsMaterial({ 
      size: 0.08, 
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    })

    const createTube = (zOffset) => {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', tubeVerts.clone())
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
      const points = new THREE.Points(geo, mat.clone())
      points.rotation.x = Math.PI * 0.5
      points.position.z = -tubeLength * zOffset
      return { points, tubeLength }
    }

    return {
      tubeA: createTube(0),
      tubeB: createTube(1)
    }
  }, [])

  // Store initial camera state when transition starts
  useEffect(() => {
    if (isActive && ((!reverse && progressRef.current === 0) || (reverse && progressRef.current === 1))) {
      initialCameraState.current.position.copy(camera.position)
      initialCameraState.current.rotation.copy(camera.rotation)
      initialCameraState.current.fov = camera.fov
      isWaitingRef.current = false
      startTimeRef.current = performance.now()
      
      // NEW: Set fallback timeout if waiting for scene
      // After 3.5 seconds, force continue even if scene not ready
      if (waitForReady && !reverse) {
        //console.log('⏰ Setting 3.5s fallback timeout for scene load...')
        fallbackTimeoutRef.current = setTimeout(() => {
          //console.log('⚠️ Fallback timeout reached - forcing wormhole to continue')
          isWaitingRef.current = false
        }, 3500)
      }
    }
  }, [isActive, camera, reverse, waitForReady])

  // When waitForReady becomes false, complete the transition
  useEffect(() => {
    if (isWaitingRef.current && !waitForReady) {
      //console.log('🎯 Scene ready! Completing wormhole transition...')
      isWaitingRef.current = false
      
      // Clear fallback timeout if scene loaded in time
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current)
        fallbackTimeoutRef.current = null
      }
    }
  }, [waitForReady])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current)
      }
    }
  }, [])

  useFrame((state, delta) => {
    if (!groupRef.current || !isActive) return

    const elapsedTime = (performance.now() - startTimeRef.current) / 1000
    const hasReachedMinDuration = elapsedTime >= minDuration

    const holdThreshold = 0.75
    
    if (reverse) {
      progressRef.current = Math.max(0, progressRef.current - delta / duration)
    } else {
      if (waitForReady && progressRef.current >= holdThreshold && !isWaitingRef.current) {
        //console.log('⏸️ Reached 75% - holding for scene to load...')
        isWaitingRef.current = true
      }
      
      // Continue if: not waiting OR (scene ready AND min duration passed)
      if (!isWaitingRef.current || (!waitForReady && hasReachedMinDuration)) {
        progressRef.current = Math.min(1, progressRef.current + delta / duration)
      } else {
        // Very slow progress while waiting
        progressRef.current = Math.min(holdThreshold + 0.05, progressRef.current + delta / (duration * 10))
      }
    }
    
    const progress = progressRef.current

    const easeInOutCubic = (t) => {
      return t < 0.5 
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    const easedProgress = easeInOutCubic(progress)
    
    const speedMultiplier = isWaitingRef.current ? 0.3 : 1.0
    const currentSpeed = easedProgress * easedProgress * speedMultiplier
    speedRef.current = currentSpeed

    if (onProgressUpdate) {
      onProgressUpdate(progress)
    }

    const fadeInDuration = 0.15
    const fadeOutStart = 0.9
    let opacity = 1

    if (reverse) {
      if (progress < fadeInDuration) {
        opacity = progress / fadeInDuration
      } else if (progress > fadeOutStart) {
        opacity = 1 - (progress - fadeOutStart) / (1 - fadeOutStart)
      }
    } else {
      if (progress < fadeInDuration) {
        opacity = progress / fadeInDuration
      } else if (progress > fadeOutStart) {
        opacity = 1 - (progress - fadeOutStart) / (1 - fadeOutStart)
      }
    }

    groupRef.current.visible = opacity > 0.01

    const speedIntensity = 1 + currentSpeed * 1.5
    if (tubeA.points.material) {
      tubeA.points.material.opacity = opacity * 0.9
      tubeA.points.material.size = 0.08 * speedIntensity
      tubeB.points.material.opacity = opacity * 0.9
      tubeB.points.material.size = 0.08 * speedIntensity
    }

    const baseSpeed = 0.2
    const maxSpeed = 3.0
    const speed = (baseSpeed + currentSpeed * maxSpeed) * (reverse ? -1 : 1)
    
    tubeA.points.position.z += speed
    tubeB.points.position.z += speed

    if (reverse) {
      if (tubeA.points.position.z < -tubeA.tubeLength) {
        tubeA.points.position.z = tubeA.tubeLength
      }
      if (tubeB.points.position.z < -tubeB.tubeLength) {
        tubeB.points.position.z = tubeB.tubeLength
      }
    } else {
      if (tubeA.points.position.z > tubeA.tubeLength) {
        tubeA.points.position.z = -tubeA.tubeLength
      }
      if (tubeB.points.position.z > tubeB.tubeLength) {
        tubeB.points.position.z = -tubeB.tubeLength
      }
    }

    const rotationSpeed = (0.002 + currentSpeed * 0.015) * (reverse ? -1 : 1)
    tubeA.points.rotation.y += rotationSpeed
    tubeB.points.rotation.y += rotationSpeed * 1.1

    const maxZMovement = 10
    const zMovement = easedProgress * maxZMovement * (reverse ? -1 : 1)
    camera.position.z = initialCameraState.current.position.z - zMovement

    const shakeIntensity = currentSpeed * 0.25
    camera.position.x = initialCameraState.current.position.x + 
      Math.sin(state.clock.elapsedTime * 10) * shakeIntensity
    camera.position.y = initialCameraState.current.position.y + 
      Math.cos(state.clock.elapsedTime * 12) * shakeIntensity

    const fovChange = easedProgress * 35
    camera.fov = initialCameraState.current.fov + fovChange * (reverse ? -1 : 1)
    camera.updateProjectionMatrix()

    camera.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1 * currentSpeed

    // Completion check
    const isComplete = reverse ? progress <= 0 : (progress >= 1 && hasReachedMinDuration)
    if (isComplete && onComplete) {
      //console.log(`✨ Wormhole complete! Duration: ${elapsedTime.toFixed(2)}s`)
      progressRef.current = reverse ? 1 : 0
      speedRef.current = 0
      isWaitingRef.current = false
      
      // Clear fallback timeout
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current)
        fallbackTimeoutRef.current = null
      }
      
      camera.position.copy(initialCameraState.current.position)
      camera.rotation.copy(initialCameraState.current.rotation)
      camera.fov = initialCameraState.current.fov
      camera.updateProjectionMatrix()
      
      onComplete()
    }
  })

  const currentProgress = progressRef.current
  const currentSpeed = speedRef.current

  return (
    <group ref={groupRef} visible={isActive}>
      <primitive object={tubeA.points} />
      <primitive object={tubeB.points} />
      
      <SpeedLines progress={currentProgress} intensity={currentSpeed} reverse={reverse} />
      <MotionBlurParticles progress={currentProgress} speed={currentSpeed} reverse={reverse} />
      <RadialBlurRings progress={currentProgress} intensity={currentSpeed} reverse={reverse} />
      
      <pointLight 
        position={[0, 0, -20]} 
        intensity={2 + currentSpeed * 6}
        distance={60} 
        color="#FFD700" 
      />
      <pointLight 
        position={[0, 0, 0]} 
        intensity={1.5 + currentSpeed * 4}
        distance={40} 
        color="#00d4ff" 
      />
      
      <spotLight
        position={[0, 0, -50]}
        target-position={[0, 0, -200]}
        angle={Math.PI / 3}
        penumbra={0.5}
        intensity={4 + currentSpeed * 10}
        color="#6366f1"
        distance={300}
      />

      <pointLight
        position={[0, 0, -100]}
        intensity={currentSpeed * 15}
        distance={100}
        color="#eeff02"
      />
    </group>
  )
}

export default WormholeTransition