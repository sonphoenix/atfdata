import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise'

// Speed lines that radiate from center
const SpeedLines = ({ progress, intensity, reverse }) => {
  const linesRef = useRef()
  
  const { positions, count } = useMemo(() => {
    const count = 100
    const positions = new Float32Array(count * 3 * 2) // 2 points per line
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const startRadius = 5 + Math.random() * 5
      const endRadius = 30 + Math.random() * 20
      
      // Start point
      positions[i * 6] = Math.cos(angle) * startRadius
      positions[i * 6 + 1] = Math.sin(angle) * startRadius
      positions[i * 6 + 2] = -10 - Math.random() * 40
      
      // End point (further out)
      positions[i * 6 + 3] = Math.cos(angle) * endRadius
      positions[i * 6 + 4] = Math.sin(angle) * endRadius
      positions[i * 6 + 5] = positions[i * 6 + 2]
    }
    
    return { positions, count }
  }, [])

  useFrame((state) => {
    if (linesRef.current) {
      const positions = linesRef.current.geometry.attributes.position.array
      const time = state.clock.elapsedTime
      
      for (let i = 0; i < count; i++) {
        const i6 = i * 6
        // Move lines backward to create rushing effect (or forward if reverse)
        const speed = (2 + intensity * 8) * (reverse ? -1 : 1)
        positions[i6 + 2] += speed
        positions[i6 + 5] += speed
        
        // Reset when too far (adjust bounds for reverse)
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
        // Move particles forward/backward based on reverse
        const direction = reverse ? -1 : 1
        positions[i3 + 2] += velocities[i] * (1 + speed * 4) * direction
        
        // Reset when particle passes camera
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
  duration = 4.0,
  onProgressUpdate, // Callback to update portal fade
  reverse = false // NEW: If true, plays animation in reverse (exit wormhole)
}) => {
  const groupRef = useRef()
  const { camera } = useThree()
  const progressRef = useRef(reverse ? 1 : 0) // Start at 1 if reversing
  const speedRef = useRef(0)
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

    // Apply noise distortion and colors to vertices
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
      
      // Enhanced color palette with more variation
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

    // Create two tubes for seamless looping
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
    }
  }, [isActive, camera, reverse])

  useFrame((state, delta) => {
    if (!groupRef.current || !isActive) return

    // Update progress (forward or reverse)
    if (reverse) {
      progressRef.current = Math.max(0, progressRef.current - delta / duration)
    } else {
      progressRef.current = Math.min(1, progressRef.current + delta / duration)
    }
    
    const progress = progressRef.current

    // Advanced easing with acceleration
    const easeInOutQuart = (t) => {
      return t < 0.5 
        ? 8 * t * t * t * t
        : 1 - Math.pow(-2 * t + 2, 4) / 2
    }

    const easedProgress = easeInOutQuart(progress)
    
    // Speed increases dramatically (or decreases if reversing)
    const currentSpeed = easedProgress * easedProgress
    speedRef.current = currentSpeed

    // Notify parent about progress for portal fade
    if (onProgressUpdate) {
      onProgressUpdate(progress)
    }

    // Fade in/out wormhole
    const fadeInDuration = 0.15
    const fadeOutStart = 0.9
    let opacity = 1

    if (reverse) {
      // Reverse fade: fade out as progress goes to 0
      if (progress < fadeInDuration) {
        opacity = progress / fadeInDuration
      } else if (progress > fadeOutStart) {
        opacity = 1 - (progress - fadeOutStart) / (1 - fadeOutStart)
      }
    } else {
      // Normal fade
      if (progress < fadeInDuration) {
        opacity = progress / fadeInDuration
      } else if (progress > fadeOutStart) {
        opacity = 1 - (progress - fadeOutStart) / (1 - fadeOutStart)
      }
    }

    groupRef.current.visible = opacity > 0.01

    // Update material opacity with speed-based intensity
    const speedIntensity = 1 + currentSpeed * 2
    if (tubeA.points.material) {
      tubeA.points.material.opacity = opacity * 0.9
      tubeA.points.material.size = 0.08 * speedIntensity
      tubeB.points.material.opacity = opacity * 0.9
      tubeB.points.material.size = 0.08 * speedIntensity
    }

    // Accelerating tunnel movement (reversed if going back)
    const baseSpeed = 0.3
    const maxSpeed = 4.5
    const speed = (baseSpeed + currentSpeed * maxSpeed) * (reverse ? -1 : 1)
    
    tubeA.points.position.z += speed
    tubeB.points.position.z += speed

    // Reset tube positions for seamless loop (adjust for reverse)
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

    // Accelerating rotation for dizzying effect (reverse direction)
    const rotationSpeed = (0.003 + currentSpeed * 0.02) * (reverse ? -1 : 1)
    tubeA.points.rotation.y += rotationSpeed
    tubeB.points.rotation.y += rotationSpeed * 1.1

    // Dramatic camera movement (reverse direction)
    const maxZMovement = 12
    const zMovement = easedProgress * maxZMovement * (reverse ? -1 : 1)
    camera.position.z = initialCameraState.current.position.z - zMovement

    // Intense camera shake at high speeds
    const shakeIntensity = currentSpeed * 0.4
    camera.position.x = initialCameraState.current.position.x + 
      Math.sin(state.clock.elapsedTime * 10) * shakeIntensity
    camera.position.y = initialCameraState.current.position.y + 
      Math.cos(state.clock.elapsedTime * 12) * shakeIntensity

    // Extreme FOV increase for speed effect (or decrease if reversing)
    const fovChange = easedProgress * 45
    camera.fov = initialCameraState.current.fov + fovChange * (reverse ? -1 : 1)
    camera.updateProjectionMatrix()

    // Camera roll for disorientation
    camera.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.15 * currentSpeed

    // When animation completes
    const isComplete = reverse ? progress <= 0 : progress >= 1
    if (isComplete && onComplete) {
      // Reset for next time
      progressRef.current = reverse ? 1 : 0
      speedRef.current = 0
      
      // Reset camera
      camera.position.copy(initialCameraState.current.position)
      camera.rotation.copy(initialCameraState.current.rotation)
      camera.fov = initialCameraState.current.fov
      camera.updateProjectionMatrix()
      
      // Call completion callback
      onComplete()
    }
  })

  const currentProgress = progressRef.current
  const currentSpeed = speedRef.current

  return (
    <group ref={groupRef} visible={isActive}>
      <primitive object={tubeA.points} />
      <primitive object={tubeB.points} />
      
      {/* Speed effects */}
      <SpeedLines progress={currentProgress} intensity={currentSpeed} reverse={reverse} />
      <MotionBlurParticles progress={currentProgress} speed={currentSpeed} reverse={reverse} />
      <RadialBlurRings progress={currentProgress} intensity={currentSpeed} reverse={reverse} />
      
      {/* Enhanced lighting that pulses with speed */}
      <pointLight 
        position={[0, 0, -20]} 
        intensity={3 + currentSpeed * 8} 
        distance={60} 
        color="#FFD700" 
      />
      <pointLight 
        position={[0, 0, 0]} 
        intensity={2 + currentSpeed * 6} 
        distance={40} 
        color="#00d4ff" 
      />
      
      {/* Forward spotlight that intensifies */}
      <spotLight
        position={[0, 0, -50]}
        target-position={[0, 0, -200]}
        angle={Math.PI / 3}
        penumbra={0.5}
        intensity={5 + currentSpeed * 15}
        color="#6366f1"
        distance={300}
      />

      {/* Pulsing center glow */}
      <pointLight
        position={[0, 0, -100]}
        intensity={currentSpeed * 20}
        distance={100}
        color="#eeff02"
      />
    </group>
  )
}

export default WormholeTransition