import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import HeroScene from './HeroScene'
import WhatWeDoScene from './WhatWeDoScene'
import Portal3DScene from './Portal3DScene'
import WormholeTransition from '../effects/WormholeTransition'
import SmoothTransition from './SmoothTransition'

const SceneManager = ({ 
  currentSection, 
  whatWeDoServiceIndex = 0, 
  portalOpenProgress = 0,
  sectionCenterProgress = { hero: 1, whatwedo: 0, portal: 0 },
  isZooming = false,
  onWormholeComplete,
  onSceneReady
}) => {
  const heroRef = useRef()
  const whatWeDoRef = useRef()
  const portalRef = useRef()
  const transitionProgress = useRef({ hero: 1, whatwedo: 0, portal: 0 })
  const [wormholeProgress, setWormholeProgress] = useState(0)
  const { camera } = useThree()
  
  // Smooth P3R style transitions
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionFrom, setTransitionFrom] = useState('hero')
  const [transitionTo, setTransitionTo] = useState('hero')
  const previousSection = useRef('hero')

  // Hide 3D objects when scrolled past portal
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const portalSection = document.getElementById('portal')
      const contactSection = document.getElementById('contact')
      
      if (portalSection) {
        const portalRect = portalSection.getBoundingClientRect()
        const windowHeight = window.innerHeight
        
        let inContactOrFooter = false
        if (contactSection) {
          const contactRect = contactSection.getBoundingClientRect()
          inContactOrFooter = contactRect.top < windowHeight * 0.5
        }
        
        const shouldHide = inContactOrFooter || portalRect.bottom < 0
        setShouldRender(!shouldHide)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Store initial camera position
  const initialCameraPos = useRef({ x: 0, y: 0, z: 5 })

  // Detect section changes and trigger smooth transitions
  useEffect(() => {
    if (currentSection !== previousSection.current && !isZooming) {
      setTransitionFrom(previousSection.current)
      setTransitionTo(currentSection)
      setIsTransitioning(true)
      previousSection.current = currentSection
    }
  }, [currentSection, isZooming])

  // Smooth easing functions
  const easeInOutQuart = (t) => {
    return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2
  }

  const easeOutCubic = (t) => {
    return 1 - Math.pow(1 - t, 3)
  }

  useFrame((state, delta) => {
    if (isZooming) return

    // Slower, smoother transition speed
    const speed = isTransitioning ? 0.06 : 0.04

    // Update base transition progress
    if (currentSection === 'hero') {
      transitionProgress.current.hero = Math.min(1, transitionProgress.current.hero + speed)
      transitionProgress.current.whatwedo = Math.max(0, transitionProgress.current.whatwedo - speed)
      transitionProgress.current.portal = Math.max(0, transitionProgress.current.portal - speed)
    } else if (currentSection === 'whatwedo') {
      transitionProgress.current.hero = Math.max(0, transitionProgress.current.hero - speed)
      transitionProgress.current.whatwedo = Math.min(1, transitionProgress.current.whatwedo + speed)
      transitionProgress.current.portal = Math.max(0, transitionProgress.current.portal - speed)
    } else if (currentSection === 'portal') {
      transitionProgress.current.hero = Math.max(0, transitionProgress.current.hero - speed)
      transitionProgress.current.whatwedo = Math.max(0, transitionProgress.current.whatwedo - speed)
      transitionProgress.current.portal = Math.min(1, transitionProgress.current.portal + speed)
    }

    // Gentle camera motion during transitions
    if (isTransitioning) {
      // Very subtle float
      const float = Math.sin(state.clock.elapsedTime * 0.8) * 0.01
      camera.position.y = initialCameraPos.current.y + float
      
      // Gentle zoom
      const zoomFloat = Math.sin(state.clock.elapsedTime * 0.6) * 0.3
      camera.fov = 50 + zoomFloat
      camera.updateProjectionMatrix()
    } else {
      // Smooth return to position
      camera.position.x += (initialCameraPos.current.x - camera.position.x) * 0.05
      camera.position.y += (initialCameraPos.current.y - camera.position.y) * 0.05
      camera.position.z += (initialCameraPos.current.z - camera.position.z) * 0.05
      camera.fov += (50 - camera.fov) * 0.05
      camera.updateProjectionMatrix()
    }

    // Hero scene - elegant slide with smooth easing
    if (heroRef.current) {
      const heroProgress = transitionProgress.current.hero
      const easedProgress = easeOutCubic(heroProgress)
      
      heroRef.current.visible = heroProgress > 0.01 && shouldRender
      
      // Smooth horizontal slide with gentle vertical float
      heroRef.current.position.x = 2 - (1 - easedProgress) * 3
      heroRef.current.position.y = (1 - easedProgress) * -0.3
      
      // Subtle rotation
      heroRef.current.rotation.y = (1 - easedProgress) * 0.15
      
      // Add gentle breathing motion when active
      if (heroProgress > 0.95) {
        const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.02
        heroRef.current.position.y += breathe
      }
      
      if (heroProgress < 1) {
        heroRef.current.traverse((child) => {
          if (child.material && !child.material.userData?.introHandled) {
            child.material.opacity = easedProgress
            child.material.transparent = true
          }
        })
      }
    }

    // WhatWeDo scene - smooth entrance with elegant motion
    if (whatWeDoRef.current) {
      const baseProgress = transitionProgress.current.whatwedo
      const easedProgress = easeInOutQuart(baseProgress)
      const finalOpacity = baseProgress * sectionCenterProgress.whatwedo
      
      whatWeDoRef.current.visible = finalOpacity > 0.01 && shouldRender
      
      // Smooth slide from right with gentle arc
      whatWeDoRef.current.position.x = 2 + (1 - easedProgress) * 3.5
      whatWeDoRef.current.position.y = Math.sin((1 - easedProgress) * Math.PI * 0.5) * 0.5
      
      // Gentle rotation
      whatWeDoRef.current.rotation.z = (1 - easedProgress) * -0.1
      
      // Smooth scale transition
      const scale = 0.7 + easedProgress * 0.3
      whatWeDoRef.current.scale.set(scale, scale, scale)
      
      // Add gentle floating when active
      if (baseProgress > 0.95) {
        const float = Math.sin(state.clock.elapsedTime * 0.7 + 1) * 0.03
        whatWeDoRef.current.position.y += float
        whatWeDoRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
      }
      
      whatWeDoRef.current.traverse((child) => {
        if (child.material) {
          child.material.opacity = finalOpacity
          child.material.transparent = true
        }
      })
    }

    // Portal scene - elegant zoom with smooth motion
    if (portalRef.current) {
      const baseProgress = transitionProgress.current.portal
      const easedProgress = easeInOutQuart(baseProgress)
      let finalOpacity = baseProgress * sectionCenterProgress.portal
      
      // STRICT CHECK: Only show portal if we're actually in portal section
      // This prevents it from appearing at the end of whatwedo section
      if (currentSection !== 'portal') {
        finalOpacity = 0
      }
      
      if (isZooming || wormholeProgress > 0) {
        const fadeOutProgress = Math.min(wormholeProgress * 5, 1)
        finalOpacity = finalOpacity * (1 - fadeOutProgress)
      }
      
      portalRef.current.visible = finalOpacity > 0.01 && shouldRender
      
      // Smooth zoom from distance
      portalRef.current.position.z = -10 + easedProgress * 8
      portalRef.current.position.x = (1 - easedProgress) * -1.5
      portalRef.current.position.y = (1 - easedProgress) * 1
      
      // Gentle rotation during entrance
      portalRef.current.rotation.x = (1 - easedProgress) * 0.3
      portalRef.current.rotation.y = (1 - easedProgress) * 0.4
      
      // Smooth scale
      const shrinkScale = 1 - wormholeProgress * 0.3
      const transitionScale = (0.5 + easedProgress * 0.5) * shrinkScale
      portalRef.current.scale.set(transitionScale, transitionScale, transitionScale)
      
      // Gentle rotation when active
      if (baseProgress > 0.95 && !isZooming) {
        portalRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.05
      }
      
      portalRef.current.traverse((child) => {
        if (child.material) {
          child.material.opacity = finalOpacity
          child.material.transparent = true
        }
      })
    }
  })

  const handleWormholeProgress = (progress) => {
    setWormholeProgress(progress)
  }

  const handleTransitionComplete = () => {
    setIsTransitioning(false)
  }

  if (!shouldRender && !isZooming) return null

  return (
    <group>
      <group ref={heroRef}>
        <HeroScene onReady={onSceneReady} />
      </group>
      
      <group ref={whatWeDoRef}>
        <WhatWeDoScene serviceIndex={whatWeDoServiceIndex} />
      </group>
      
      <group ref={portalRef}>
        <Portal3DScene 
          openProgress={portalOpenProgress} 
          isZooming={isZooming}
        />
      </group>

      {/* Persona 3 Reload smooth transition overlay */}
      {isTransitioning && (
        <SmoothTransition 
          fromSection={transitionFrom}
          toSection={transitionTo}
          onComplete={handleTransitionComplete}
        />
      )}

      <WormholeTransition 
        isActive={isZooming}
        onComplete={onWormholeComplete}
        onProgressUpdate={handleWormholeProgress}
        duration={4.0}
      />
    </group>
  )
}

export default SceneManager

