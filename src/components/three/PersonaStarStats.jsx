import { useRef, useMemo, forwardRef, useImperativeHandle, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Create dotted texture for Persona 5 style
const createDottedTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  
  // Fill with base color - updated to match new color scheme
  ctx.fillStyle = '#61dafb'
  ctx.fillRect(0, 0, 512, 512)
  
  // Add random dots for texture
  ctx.fillStyle = 'rgba(34, 211, 238, 0.3)'
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const radius = Math.random() * 3 + 1
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
  
  // Add some darker spots
  ctx.fillStyle = 'rgba(14, 165, 233, 0.5)'
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const radius = Math.random() * 2 + 0.5
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

// Sound effect for flip
const playFlipSound = () => {
  if (typeof window !== 'undefined' && window.AudioContext) {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Coin flip sound
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.4)
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (e) {
      console.log("Audio not supported")
    }
  }
}

export const PersonaStarStats = forwardRef(({ stats, maxValue = 100 }, ref) => {
  const starGroupRef = useRef()
  const glowRef = useRef()
  const shadowRef = useRef()
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipProgress, setFlipProgress] = useState(0)
  const [flipDirection, setFlipDirection] = useState(1)
  const [jumpHeight, setJumpHeight] = useState(0)
  const [jumpForward, setJumpForward] = useState(0) // Z-axis movement
  const [shadowScale, setShadowScale] = useState(1)
  const [shadowOpacity, setShadowOpacity] = useState(0.2)
  const [flipSoundEnabled, setFlipSoundEnabled] = useState(true)
  
  // Create dotted texture
  const dottedTexture = useMemo(() => createDottedTexture(), [])

  // Define the 5 stat positions
  const statPositions = useMemo(() => {
    const angleOffset = Math.PI / 2
    
    return [
      { name: 'Frontend', angle: angleOffset, color: '#61dafb' },
      { name: 'Backend', angle: angleOffset + (Math.PI * 2 / 5) * 1, color: '#68a063' },
      { name: 'Database', angle: angleOffset + (Math.PI * 2 / 5) * 2, color: '#f29111' },
      { name: 'DevOps', angle: angleOffset + (Math.PI * 2 / 5) * 3, color: '#326ce5' },
      { name: 'Features', angle: angleOffset + (Math.PI * 2 / 5) * 4, color: '#ab47bc' }
    ]
  }, [])

  // Calculate dynamic vertices based on stat values
  const starVertices = useMemo(() => {
    const vertices = []
    const statNames = ['frontend', 'backend', 'database', 'devops', 'features']
    
    statPositions.forEach((pos, i) => {
      const statValue = stats[statNames[i]] || 0
      const normalizedValue = statValue / maxValue
      const distance = 0.5 + (normalizedValue * 2.5)
      
      const x = Math.cos(pos.angle) * distance
      const y = Math.sin(pos.angle) * distance
      vertices.push(new THREE.Vector3(x, y, 0))
    })
    
    return vertices
  }, [stats, maxValue, statPositions])

  // Handle click for coin flip animation
  const handleClick = (e) => {
    e.stopPropagation()
    if (!isFlipping) {
      startFlipAnimation()
    }
  }

  const startFlipAnimation = () => {
    setIsFlipping(true)
    setFlipProgress(0)
    setJumpHeight(0)
    setJumpForward(0)
    setFlipDirection(prev => prev * -1)
    
    if (flipSoundEnabled) {
      playFlipSound()
    }
  }

  // Animation frame for coin flip with 3D parabolic jump
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime
    
    // Base glow pulse (always active)
    if (glowRef.current) {
      const baseOpacity = isFlipping ? 0.2 : 0.08
      const pulseSpeed = isFlipping ? 4 : 2
      const pulseAmount = Math.sin(time * pulseSpeed) * (isFlipping ? 0.1 : 0.04)
      glowRef.current.material.opacity = Math.max(0.05, baseOpacity + pulseAmount)
    }
    
    // Shadow effect (follows the star)
    if (shadowRef.current) {
      shadowRef.current.position.z = -jumpForward * 0.5 // Shadow moves with star
      shadowRef.current.scale.set(shadowScale, shadowScale, 1)
      shadowRef.current.material.opacity = shadowOpacity
    }
    
    // Handle coin flip animation with 3D parabolic jump
    if (isFlipping && starGroupRef.current) {
      const totalDuration = 2.5 // Total animation time
      const flipSpeed = (Math.PI * 6) / totalDuration // 3 full rotations * 2
      const newProgress = flipProgress + delta * flipSpeed
      
      if (newProgress >= Math.PI * 2) {
        // Animation complete - smooth landing
        completeFlipAnimation()
      } else {
        setFlipProgress(newProgress)
        
        // Normalized progress (0 to 1)
        const t = newProgress / (Math.PI * 2)
        
        // PARABOLIC JUMP in 3D space (Y and Z axes)
        // Jump curve: up and forward, then down and back
        const jumpCurve = parabolicJump(t)
        
        // Set jump values
        setJumpHeight(jumpCurve.height)
        setJumpForward(jumpCurve.forward)
        
        // Shadow effects based on height
        const shadow = 1 + (jumpCurve.height * 0.4) // Shadow expands when higher
        setShadowScale(Math.max(0.8, Math.min(1.8, shadow)))
        setShadowOpacity(0.3 - (jumpCurve.height * 0.15))
        
        // FLIP ANIMATION: Multiple rotations with dynamic speed
        const rotations = 3 // Total rotations
        const flipRotation = flipDirection * t * Math.PI * 2 * rotations
        
        // Wobble effect (more intense at peak of jump)
        const wobbleIntensity = 0.2 * jumpCurve.height
        const wobble = Math.sin(newProgress * 8) * wobbleIntensity
        
        // SCALE ANIMATION: Coin gets thinner during flip, thicker at edges
        const flipPhase = t * rotations % 1
        const scaleX = 0.9 - Math.abs(Math.sin(flipPhase * Math.PI)) * 0.35
        const scaleY = 0.9 - Math.abs(Math.sin(flipPhase * Math.PI)) * 0.35
        
        // TILT during parabolic arc (leans forward going up, back coming down)
        const tiltAngle = Math.sin(t * Math.PI) * 0.4
        
        // Apply all transformations
        starGroupRef.current.position.y = jumpCurve.height
        starGroupRef.current.position.z = jumpCurve.forward
        starGroupRef.current.rotation.y = flipRotation
        starGroupRef.current.rotation.x = wobble + tiltAngle
        starGroupRef.current.scale.set(scaleX, scaleY, 0.9)
        
        // Enhanced glow during flip with color shift
        if (glowRef.current) {
          const glowIntensity = 0.2 + Math.abs(Math.sin(newProgress * 4)) * 0.4
          glowRef.current.material.opacity = glowIntensity
          
          // Dynamic color based on jump height
          const hue = 0.55 + (jumpCurve.height * 0.1)
          glowRef.current.material.color.setHSL(hue, 0.9, 0.6)
        }
      }
    } else if (starGroupRef.current) {
      // Idle floating animation (only when not flipping)
      const floatHeight = Math.sin(time * 0.8) * 0.1
      const floatRotation = Math.sin(time * 0.3) * 0.08
      const floatBob = Math.sin(time * 1.2) * 0.05
      
      starGroupRef.current.position.y = floatHeight
      starGroupRef.current.rotation.z = floatRotation
      starGroupRef.current.position.x = floatBob
      
      // Subtle scale breathing
      const breath = 1 + Math.sin(time * 0.5) * 0.02
      starGroupRef.current.scale.set(breath * 0.9, breath * 0.9, 0.9)
    }
  })

  // Complete the flip animation
  const completeFlipAnimation = () => {
    setFlipProgress(0)
    setIsFlipping(false)
    setJumpHeight(0)
    setJumpForward(0)
    setShadowScale(1)
    setShadowOpacity(0.2)
    
    // Reset to original position
    if (starGroupRef.current) {
      starGroupRef.current.position.y = 0
      starGroupRef.current.position.z = 0
      starGroupRef.current.rotation.x = 0
      starGroupRef.current.rotation.y = 0
      starGroupRef.current.scale.set(0.9, 0.9, 0.9)
    }
    
    // Final flash effect
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.8
      glowRef.current.material.color.setHSL(0.55, 0.8, 0.5)
      setTimeout(() => {
        if (glowRef.current) {
          glowRef.current.material.opacity = 0.08
        }
      }, 300)
    }
  }

  // Parabolic jump function for 3D motion
  const parabolicJump = (t) => {
    // Break the animation into phases
    const phases = [
      { start: 0.0, end: 0.4, type: 'launch' },    // Launch phase
      { start: 0.4, end: 0.6, type: 'apex' },      // Apex/peak
      { start: 0.6, end: 1.0, type: 'landing' }    // Landing phase
    ]
    
    let height = 0
    let forward = 0
    
    // Find current phase
    const currentPhase = phases.find(p => t >= p.start && t <= p.end)
    
    if (currentPhase) {
      const phaseT = (t - currentPhase.start) / (currentPhase.end - currentPhase.start)
      
      switch (currentPhase.type) {
        case 'launch':
          // Rapid ascent with forward motion
          height = easeOutQuad(phaseT) * 2.5
          forward = easeOutQuad(phaseT) * 1.2
          break
          
        case 'apex':
          // Slow at the top of the arc
          height = 2.5 - easeInQuad(phaseT) * 0.3
          forward = 1.2 + easeInOutSine(phaseT) * 0.3
          break
          
        case 'landing':
          // Fast descent, pulling back
          height = 2.2 - easeInQuad(phaseT) * 2.2
          forward = 1.5 - easeInOutBack(phaseT) * 1.5
          break
      }
    }
    
    return { height, forward }
  }

  // Easing functions
  const easeOutQuad = (x) => 1 - (1 - x) * (1 - x)
  const easeInQuad = (x) => x * x
  const easeInOutSine = (x) => -(Math.cos(Math.PI * x) - 1) / 2
  const easeInOutBack = (x) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    
    return x < 0.5
      ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
      : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
  }

  // Create the solid filled star geometry
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    
    starVertices.forEach((vertex, i) => {
      if (i === 0) {
        shape.moveTo(vertex.x, vertex.y)
      } else {
        shape.lineTo(vertex.x, vertex.y)
      }
    })
    shape.closePath()
    
    return new THREE.ShapeGeometry(shape)
  }, [starVertices])

  // Create outline lines
  const outlineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const positions = []
    
    starVertices.forEach((vertex, i) => {
      const next = starVertices[(i + 1) % starVertices.length]
      positions.push(vertex.x, vertex.y, vertex.z)
      positions.push(next.x, next.y, next.z)
    })
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geometry
  }, [starVertices])

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    triggerCoinFlip: startFlipAnimation,
    toggleSound: () => setFlipSoundEnabled(!flipSoundEnabled),
    getStarVertices: () => starVertices,
    getStatPositions: () => statPositions,
    getDebugInfo: () => ({
      vertices: starVertices.map(v => ({x: v.x, y: v.y, z: v.z})),
      angles: statPositions.map(p => ({name: p.name, angle: p.angle})),
      stats: stats,
      isFlipping,
      flipProgress,
      jumpHeight,
      jumpForward
    })
  }))

  return (
    <group 
      ref={starGroupRef}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        if (!isFlipping && document.body) {
          document.body.style.cursor = 'pointer'
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        if (document.body) {
          document.body.style.cursor = 'auto'
        }
      }}
    >
      {/* Shadow under the star (moves with Z position) */}
      <mesh 
        ref={shadowRef} 
        position={[0, -0.6, 0]} // Initial position
        rotation={[0, 0, 0]}
      >
        <circleGeometry args={[3.2, 24]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>

      {/* Main glow behind star */}
      <mesh position={[0, 0, -0.05]} ref={glowRef}>
        <circleGeometry args={[4, 32]} />
        <meshBasicMaterial 
          color="#61dafb" 
          transparent 
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Secondary glow ring (for depth) */}
      <mesh position={[0, 0, -0.1]}>
        <ringGeometry args={[3.8, 4.2, 32]} />
        <meshBasicMaterial 
          color="#61dafb" 
          transparent 
          opacity={0.05}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Main solid filled star with dotted texture */}
      <mesh geometry={starGeometry} position={[0, 0, 0]}>
        <meshBasicMaterial 
          map={dottedTexture}
          side={THREE.DoubleSide}
          transparent={false}
        />
      </mesh>

      {/* Black outline */}
      <lineSegments geometry={outlineGeometry} position={[0, 0, 0.01]}>
        <lineBasicMaterial color="#000000" linewidth={4} />
      </lineSegments>

      {/* Inner radial lines from center */}
      {starVertices.map((vertex, i) => {
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0.01),
          new THREE.Vector3(vertex.x * 0.95, vertex.y * 0.95, 0.01)
        ])
        return (
          <line key={`radial-${i}`} geometry={lineGeometry}>
            <lineBasicMaterial color="#000000" linewidth={2} transparent opacity={0.3} />
          </line>
        )
      })}

      {/* Small vertex dots with category colors */}
      {starVertices.map((vertex, i) => (
        <mesh key={`dot-${i}`} position={[vertex.x, vertex.y, 0.02]}>
          <circleGeometry args={[0.08, 12]} />
          <meshBasicMaterial color={statPositions[i].color} />
        </mesh>
      ))}

      {/* Center dot */}
      <mesh position={[0, 0, 0.02]}>
        <circleGeometry args={[0.12, 16]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Motion trail particles during flip (emitted from star) */}
      {isFlipping && (
        <group>
          {[...Array(8)].map((_, i) => {
            // Create particles along the path
            const angle = (i / 8) * Math.PI * 2
            const distance = 0.5 + Math.random() * 0.5
            const x = Math.cos(angle) * distance
            const y = Math.sin(angle) * distance
            const z = -jumpForward * 0.8 + Math.random() * 0.5 - 0.25
            
            return (
              <mesh 
                key={`trail-${i}`} 
                position={[x, y, z]}
                scale={[0.08, 0.08, 0.08]}
              >
                <circleGeometry args={[1, 6]} />
                <meshBasicMaterial 
                  color={statPositions[i % 5].color}
                  transparent
                  opacity={0.6}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            )
          })}
        </group>
      )}
    </group>
  )
})