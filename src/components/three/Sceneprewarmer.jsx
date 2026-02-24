import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * ScenePrewarmer - Compiles all shaders and uploads buffers before first interaction
 * This eliminates the "first jump lag" by warming up the WebGL pipeline
 */
export const ScenePrewarmer = ({ onReady }) => {
  const { gl, scene, camera } = useThree()
  const hasPrewarmed = useRef(false)

  useEffect(() => {
    if (hasPrewarmed.current) return

    // Give the scene a moment to fully initialize
    const timer = setTimeout(() => {
      try {
        console.log('🔥 Pre-warming scene...')
        
        // Force compile all materials in the scene
        gl.compile(scene, camera)
        
        // Render once to upload all buffers
        gl.render(scene, camera)
        
        // Mark as complete
        hasPrewarmed.current = true
        console.log('✅ Scene pre-warmed successfully')
        
        // Notify parent that scene is ready
        if (onReady) {
          onReady()
        }
      } catch (error) {
        console.warn('Pre-warming failed:', error)
        // Still notify ready even if pre-warming fails
        if (onReady) {
          onReady()
        }
      }
    }, 100) // Small delay to ensure scene is built

    return () => clearTimeout(timer)
  }, [gl, scene, camera, onReady])

  return null // This component doesn't render anything
}