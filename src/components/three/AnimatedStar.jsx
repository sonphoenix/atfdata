import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { PersonaStarStats } from './PersonaStarStats'

// Animated star component - PERSONA STYLE CLEAN ENTRANCE
export const AnimatedStar = ({ stats, maxValue, animateIn, onFlip }) => {
  const starRef = useRef()
  const starStatsRef = useRef()
  const [animationPhase, setAnimationPhase] = useState('initial')
  const animationStartTime = useRef(0)
  
  useEffect(() => {
    if (animateIn && starRef.current) {
      starRef.current.scale.set(0.01, 0.01, 0.01)
      starRef.current.position.y = 2
      starRef.current.rotation.set(0, 0, 0)
      setAnimationPhase('initial')
      animationStartTime.current = 0
      
      if (starRef.current.children && starRef.current.children[0]) {
        const starMesh = starRef.current.children[0]
        if (starMesh.material) {
          starMesh.material.emissiveIntensity = 0.2
        }
      }
    }
  }, [animateIn])
  
  useFrame((state, delta) => {
    if (starRef.current && animateIn) {
      animationStartTime.current += delta
      const t = animationStartTime.current
      
      if (t < 0.4) {
        const phase1Progress = t / 0.4
        const easeProgress = 1 - Math.pow(1 - phase1Progress, 3)
        
        const scale = easeProgress * 1.35
        starRef.current.scale.set(scale, scale, scale)
        
        starRef.current.position.y = 2 * (1 - easeProgress)
        
        if (starRef.current.children && starRef.current.children[0]) {
          const starMesh = starRef.current.children[0]
          if (starMesh.material) {
            const flashIntensity = 0.8 * (1 - easeProgress) + 0.2
            starMesh.material.emissiveIntensity = flashIntensity
          }
        }
        
        if (t >= 0.39 && animationPhase === 'initial') {
          setAnimationPhase('settle')
        }
      }
      else if (t < 0.65) {
        const phase2Progress = (t - 0.4) / 0.25
        const bounceEase = Math.sin(phase2Progress * Math.PI)
        
        const scale = 1.35 - (0.35 * phase2Progress) + (bounceEase * 0.08)
        starRef.current.scale.set(scale, scale, scale)
        
        starRef.current.position.y = bounceEase * 0.1
        
        if (starRef.current.children && starRef.current.children[0]) {
          const starMesh = starRef.current.children[0]
          if (starMesh.material) {
            starMesh.material.emissiveIntensity = 0.2
          }
        }
        
        if (t >= 0.64 && animationPhase === 'settle') {
          setAnimationPhase('idle')
        }
      }
      else {
        if (animationPhase !== 'idle') {
          setAnimationPhase('idle')
          starRef.current.scale.set(1, 1, 1)
          starRef.current.position.y = 0
        }
        
        const breathScale = 1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.03
        starRef.current.scale.set(breathScale, breathScale, breathScale)
        
        starRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.04
      }
    }
  })
  
  // Handle flip trigger
  const handleFlip = () => {
    if (starStatsRef.current) {
      starStatsRef.current.triggerCoinFlip()
      if (onFlip) {
        onFlip()
      }
    }
  }
  
  return (
    <group 
      ref={starRef}
      onClick={handleFlip}
      onPointerOver={() => {
        if (document.body) {
          document.body.style.cursor = 'pointer'
        }
      }}
      onPointerOut={() => {
        if (document.body) {
          document.body.style.cursor = 'auto'
        }
      }}
    >
      <PersonaStarStats 
        ref={starStatsRef}
        stats={stats} 
        maxValue={maxValue} 
        animateIn={animateIn} 
      />
    </group>
  )
}
