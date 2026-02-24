import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'

// Animation wrapper component for 3D models - PERSONA STYLE
export const AnimatedModelWrapper = ({ children, animateIn, delay = 0 }) => {
  const groupRef = useRef()
  const [animationPhase, setAnimationPhase] = useState('initial')
  const animationStartTime = useRef(0)
  
  useEffect(() => {
    if (animateIn && groupRef.current) {
      groupRef.current.scale.set(0.01, 0.01, 0.01)
      groupRef.current.position.set(0, -3, -5)
      groupRef.current.rotation.set(Math.PI * 0.3, Math.PI * 1.5, Math.PI * 0.2)
      setAnimationPhase('initial')
      animationStartTime.current = 0
    }
  }, [animateIn])
  
  useFrame((state, delta) => {
    if (groupRef.current && animateIn) {
      animationStartTime.current += delta
      const t = animationStartTime.current
      
      if (t < 0.3) {
        const phase1Progress = t / 0.3
        const easeProgress = 1 - Math.pow(1 - phase1Progress, 4)
        
        const scale = easeProgress * 1.4
        groupRef.current.scale.set(scale, scale, scale)
        
        groupRef.current.rotation.y = Math.PI * 1.5 * (1 - easeProgress)
        groupRef.current.rotation.x = Math.PI * 0.3 * (1 - easeProgress)
        groupRef.current.rotation.z = Math.PI * 0.2 * (1 - easeProgress)
        
        groupRef.current.position.y = -3 + (3 * easeProgress)
        groupRef.current.position.z = -5 + (5 * easeProgress)
        
        if (t >= 0.29 && animationPhase === 'initial') {
          setAnimationPhase('impact')
        }
      }
      else if (t < 0.5) {
        const phase2Progress = (t - 0.3) / 0.2
        const bounceEase = Math.sin(phase2Progress * Math.PI)
        
        const scale = 1.4 - (0.4 * phase2Progress) + (bounceEase * 0.15)
        groupRef.current.scale.set(scale, scale, scale)
        
        groupRef.current.position.y = bounceEase * 0.15
        groupRef.current.rotation.y = bounceEase * 0.05
        
        if (t >= 0.49 && animationPhase === 'impact') {
          setAnimationPhase('settle')
        }
      }
      else if (t < 0.7) {
        const phase3Progress = (t - 0.5) / 0.2
        const settleEase = 1 - Math.pow(1 - phase3Progress, 3)
        
        const currentScale = groupRef.current.scale.x
        const targetScale = 1.0
        groupRef.current.scale.set(
          currentScale + (targetScale - currentScale) * settleEase * 0.5,
          currentScale + (targetScale - currentScale) * settleEase * 0.5,
          currentScale + (targetScale - currentScale) * settleEase * 0.5
        )
        
        groupRef.current.position.y *= (1 - settleEase * 0.5)
        groupRef.current.rotation.y *= (1 - settleEase * 0.5)
        
        if (t >= 0.69 && animationPhase === 'settle') {
          setAnimationPhase('idle')
        }
      }
      else {
        if (animationPhase !== 'idle') {
          setAnimationPhase('idle')
          groupRef.current.scale.set(1, 1, 1)
          groupRef.current.position.set(0, 0, 0)
          groupRef.current.rotation.set(0, 0, 0)
        }
        
        const breathTime = state.clock.elapsedTime * 0.6
        const breathScale = 1.0 + Math.sin(breathTime) * 0.02
        groupRef.current.scale.set(breathScale, breathScale, breathScale)
        
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.08
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
      }
    }
  })
  
  return <group ref={groupRef}>{children}</group>
}
