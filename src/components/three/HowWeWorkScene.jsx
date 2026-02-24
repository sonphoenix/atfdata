import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const HowWeWorkScene = ({ stepIndex = 0 }) => {
  const groupRef = useRef()
  const transitionProgress = useRef(0)
  const prevStepRef = useRef(stepIndex)

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const time = state.clock.elapsedTime

    // Smooth transition between steps
    if (prevStepRef.current !== stepIndex) {
      transitionProgress.current = Math.min(1, transitionProgress.current + delta * 2)
      
      if (transitionProgress.current >= 1) {
        prevStepRef.current = stepIndex
        transitionProgress.current = 0
      }

      // Fade + rotate transition
      const t = transitionProgress.current
      const opacity = t < 0.5 ? 1 - t * 2 : (t - 0.5) * 2
      
      groupRef.current.traverse((child) => {
        if (child.material) {
          child.material.opacity = opacity * 0.9
          child.material.transparent = true
        }
      })

      groupRef.current.rotation.y = Math.PI * t
    } else {
      // Idle rotation
      groupRef.current.rotation.y = time * 0.1
    }

    // Gentle float
    groupRef.current.position.y = Math.sin(time * 0.5) * 0.1
  })

  return (
    <group ref={groupRef} position={[2, 0, 0]}>
      {stepIndex === 0 && <DiscoveryCall />}
      {stepIndex === 1 && <ProposalDoc />}
      {stepIndex === 2 && <Rocket />}
      {stepIndex === 3 && <ProgressBars />}
      {stepIndex === 4 && <LaunchIcon />}
      {stepIndex === 5 && <SupportTools />}
    </group>
  )
}

// Step 1: Discovery Call (Phone icon)
const DiscoveryCall = () => {
  const ref = useRef()

  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.elapsedTime
      ref.current.rotation.z = Math.sin(time * 2) * 0.1
    }
  })

  return (
    <group ref={ref}>
      {/* Phone body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 2, 0.1]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Screen */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[1, 1.6, 0.02]} />
        <meshStandardMaterial
          color="#000000"
          emissive="#00d4ff"
          emissiveIntensity={0.2}
          metalness={1}
          roughness={0}
        />
      </mesh>

      {/* Signal waves */}
      {[0.3, 0.6, 0.9].map((scale, i) => (
        <mesh key={i} position={[0, 1.2, 0]} scale={[scale, scale, 1]}>
          <torusGeometry args={[0.3, 0.05, 8, 32]} />
          <meshStandardMaterial
            color="#00d4ff"
            transparent
            opacity={0.3 - i * 0.1}
            emissive="#00d4ff"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

// Step 2: Proposal (Document)
const ProposalDoc = () => {
  const ref = useRef()

  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.elapsedTime
      ref.current.rotation.y = Math.sin(time * 0.5) * 0.2
    }
  })

  return (
    <group ref={ref}>
      {/* Paper */}
      <mesh>
        <boxGeometry args={[1.5, 2, 0.05]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#6366f1"
          emissiveIntensity={0.1}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Text lines */}
      {[0.6, 0.3, 0, -0.3, -0.6].map((y, i) => (
        <mesh key={i} position={[0, y, 0.03]}>
          <boxGeometry args={[1.2, 0.08, 0.01]} />
          <meshStandardMaterial
            color="#6366f1"
            emissive="#6366f1"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Checkmark */}
      <mesh position={[0.5, -0.8, 0.03]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={0.7}
        />
      </mesh>
    </group>
  )
}

// Step 3: Rocket (Kickoff)
const Rocket = () => {
  const ref = useRef()

  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.elapsedTime
      ref.current.position.y = Math.sin(time * 2) * 0.3
      ref.current.rotation.z = Math.sin(time * 3) * 0.05
    }
  })

  return (
    <group ref={ref}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 1.5, 32]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Nose cone */}
      <mesh position={[0, 0.9, 0]}>
        <coneGeometry args={[0.3, 0.6, 32]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={0.6}
          metalness={1}
          roughness={0}
        />
      </mesh>

      {/* Flames */}
      {[-0.2, 0, 0.2].map((x, i) => (
        <mesh key={i} position={[x, -0.9, 0]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.15, 0.5, 8]} />
          <meshStandardMaterial
            color="#ff6b00"
            emissive="#ff6b00"
            emissiveIntensity={1}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  )
}

// Step 4: Progress Bars (Milestones)
const ProgressBars = () => {
  const barsRef = useRef()

  useFrame((state) => {
    if (barsRef.current) {
      const time = state.clock.elapsedTime
      barsRef.current.children.forEach((bar, i) => {
        const scale = 0.3 + Math.sin(time * 2 + i * 0.5) * 0.1
        bar.scale.x = scale + (i * 0.2)
      })
    }
  })

  return (
    <group ref={barsRef}>
      {[0.6, 0.2, -0.2, -0.6].map((y, i) => (
        <group key={i} position={[0, y, 0]}>
          {/* Background bar */}
          <mesh position={[0, 0, -0.05]}>
            <boxGeometry args={[1.5, 0.2, 0.05]} />
            <meshStandardMaterial
              color="#1e293b"
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>
          
          {/* Progress fill */}
          <mesh position={[-0.375, 0, 0]}>
            <boxGeometry args={[0.1, 0.18, 0.06]} />
            <meshStandardMaterial
              color={i === 0 ? "#00d4ff" : i === 1 ? "#6366f1" : "#8b5cf6"}
              emissive={i === 0 ? "#00d4ff" : i === 1 ? "#6366f1" : "#8b5cf6"}
              emissiveIntensity={0.6}
              metalness={1}
              roughness={0}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Step 5: Launch (Checkmark in circle)
const LaunchIcon = () => {
  const ref = useRef()

  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.elapsedTime
      ref.current.rotation.z = time * 0.5
      ref.current.scale.setScalar(1 + Math.sin(time * 3) * 0.05)
    }
  })

  return (
    <group ref={ref}>
      {/* Circle */}
      <mesh>
        <torusGeometry args={[1, 0.15, 16, 64]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={0.7}
          metalness={1}
          roughness={0}
        />
      </mesh>

      {/* Checkmark */}
      <mesh position={[-0.2, -0.1, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.3, 0.15, 0.1]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={1}
        />
      </mesh>
      <mesh position={[0.3, 0.2, 0]} rotation={[0, 0, 0.6]}>
        <boxGeometry args={[0.8, 0.15, 0.1]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={1}
        />
      </mesh>
    </group>
  )
}

// Step 6: Support (Wrench + Gear)
const SupportTools = () => {
  const ref = useRef()

  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.elapsedTime
      ref.current.rotation.z = time * 0.3
    }
  })

  return (
    <group>
      {/* Gear */}
      <mesh ref={ref}>
        <torusGeometry args={[0.8, 0.15, 8, 8]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Wrench */}
      <mesh position={[0.5, 0.5, 0.2]} rotation={[0, 0, 0.8]}>
        <boxGeometry args={[0.2, 1.2, 0.1]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.5}
          metalness={1}
          roughness={0}
        />
      </mesh>
    </group>
  )
}

export default HowWeWorkScene