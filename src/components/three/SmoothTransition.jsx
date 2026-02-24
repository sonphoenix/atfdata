import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Persona 3 Reload style smooth fade transition with blur
const SmoothFadeShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float progress;
    uniform vec3 colorFrom;
    uniform vec3 colorTo;
    uniform float blurAmount;
    varying vec2 vUv;
    
    // Smooth ease in-out function
    float easeInOutCubic(float t) {
      return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
    }
    
    void main() {
      vec2 uv = vUv;
      float easedProgress = easeInOutCubic(progress);
      
      // Gentle radial blur effect
      vec2 center = vec2(0.5, 0.5);
      vec2 dir = uv - center;
      float dist = length(dir);
      
      // Blur intensity peaks in middle of transition
      float blurIntensity = sin(easedProgress * 3.14159) * blurAmount;
      vec2 offset = normalize(dir) * dist * blurIntensity;
      
      // Smooth color transition
      vec3 color = mix(colorFrom, colorTo, easedProgress);
      
      // Add subtle brightness variation
      float brightness = 1.0 + sin(easedProgress * 3.14159) * 0.1;
      color *= brightness;
      
      // Smooth fade in/out
      float alpha = sin(easedProgress * 3.14159);
      
      gl_FragColor = vec4(color, alpha * 0.6);
    }
  `
}

const SmoothTransition = ({ fromSection, toSection, onComplete }) => {
  const meshRef = useRef()
  const progressRef = useRef(0)
  const startTimeRef = useRef(Date.now())
  
  // Elegant color schemes
  const getColors = (section) => {
    switch(section) {
      case 'hero':
        return { 
          color: new THREE.Color('#1a1f3a'),
          accent: new THREE.Color('#4a5568')
        }
      case 'whatwedo':
        return { 
          color: new THREE.Color('#2d3748'),
          accent: new THREE.Color('#4299e1')
        }
      case 'portal':
        return { 
          color: new THREE.Color('#1a202c'),
          accent: new THREE.Color('#805ad5')
        }
      default:
        return { 
          color: new THREE.Color('#000000'),
          accent: new THREE.Color('#ffffff')
        }
    }
  }
  
  const fromColors = getColors(fromSection)
  const toColors = getColors(toSection)
  
  useEffect(() => {
    startTimeRef.current = Date.now()
    progressRef.current = 0
  }, [fromSection, toSection])
  
  // Smooth easing function
  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }
  
  useFrame(() => {
    if (!meshRef.current) return
    
    const elapsed = Date.now() - startTimeRef.current
    const duration = 1400 // Slower, smoother duration like P3R
    progressRef.current = Math.min(elapsed / duration, 1)
    
    const material = meshRef.current.material
    material.uniforms.progress.value = progressRef.current
    
    // Apply smooth easing
    const easedProgress = easeInOutCubic(progressRef.current)
    
    // Gentle blur that peaks in the middle
    const blurAmount = Math.sin(easedProgress * Math.PI) * 0.03
    material.uniforms.blurAmount.value = blurAmount
    
    // Subtle scale pulse
    const scale = 1 + Math.sin(easedProgress * Math.PI) * 0.02
    meshRef.current.scale.set(scale, scale, 1)
    
    if (progressRef.current >= 1 && onComplete) {
      onComplete()
    }
  })
  
  return (
    <mesh ref={meshRef} position={[0, 0, 8]}>
      <planeGeometry args={[25, 25]} />
      <shaderMaterial
        transparent
        uniforms={{
          progress: { value: 0 },
          colorFrom: { value: fromColors.color },
          colorTo: { value: toColors.color },
          blurAmount: { value: 0 }
        }}
        vertexShader={SmoothFadeShader.vertexShader}
        fragmentShader={SmoothFadeShader.fragmentShader}
      />
    </mesh>
  )
}

export default SmoothTransition