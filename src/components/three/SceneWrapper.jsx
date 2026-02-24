import { Canvas } from '@react-three/fiber'
import { Stars, PerspectiveCamera, Preload, useProgress } from '@react-three/drei'
import { Suspense, useState, useEffect, useRef } from 'react'
import SceneManager from './SceneManager'
import { useService } from './ServiceContext'

const SceneWrapper = ({ 
  onSceneReady, 
  isPortalZooming = false, 
  portalZoomProgress = 0,
  onLoadProgress,
  isPaused = false
}) => {
  const [currentSection, setCurrentSection] = useState('hero')
  const [portalOpenProgress, setPortalOpenProgress] = useState(0)
  const [sectionCenterProgress, setSectionCenterProgress] = useState({
    hero: 1,
    whatwedo: 0,
    portal: 0
  })
  const { activeService } = useService()
  const hasCalledReady = useRef(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const { progress, active } = useProgress()

  useEffect(() => {
    console.log('📊 SceneWrapper progress:', progress, 'active:', active)
    
    if (onLoadProgress && !hasCalledReady.current) {
      onLoadProgress(progress)
      
      if (progress === 100 && !active && !hasCalledReady.current) {
        console.log('✅ SceneWrapper: Loading complete!')
        hasCalledReady.current = true
        setIsLoaded(true)
        
        setTimeout(() => {
          if (onSceneReady) {
            onSceneReady()
          }
        }, 300)
      }
    }
  }, [progress, active, onLoadProgress, onSceneReady])

  useEffect(() => {
    console.log('🎬 SceneWrapper isPaused:', isPaused)
  }, [isPaused])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight

      // Section boundaries - Portal delayed slightly to prevent early appearance
      // Hero: 0 - 0.7vh
      // What We Do: 0.7vh - 1.85vh (extended)
      // Portal: 1.85vh - 2.7vh (starts later)
      
      // Determine current section
      if (scrollY < windowHeight * 0.7) {
        setCurrentSection('hero')
      } else if (scrollY < windowHeight * 1.85) {
        setCurrentSection('whatwedo')
      } else if (scrollY < windowHeight * 2.7) {
        setCurrentSection('portal')
        
        // Portal animation range - updated to match new boundaries
        const portalStartScroll = windowHeight * 1.85
        const portalEndScroll = windowHeight * 2.7
        const portalScrollRange = portalEndScroll - portalStartScroll
        const portalScrollProgress = (scrollY - portalStartScroll) / portalScrollRange
        
        const clampedProgress = Math.max(0, Math.min(1, portalScrollProgress))
        const easedProgress = clampedProgress < 0.5
          ? 2 * clampedProgress * clampedProgress
          : 1 - Math.pow(-2 * clampedProgress + 2, 2) / 2
        
        setPortalOpenProgress(easedProgress)
      } else {
        setCurrentSection('other')
        setPortalOpenProgress(0)
      }

      // Calculate how close we are to the CENTER of each section
      // This creates a peak at the center of each section
      
      // HERO section (0 to 0.7vh, center at 0.35vh)
      const heroStart = 0
      const heroEnd = windowHeight * 0.7
      const heroCenter = (heroStart + heroEnd) / 2
      const heroRange = heroEnd - heroStart
      
      let heroCenterProgress = 1
      if (scrollY >= heroStart && scrollY <= heroEnd) {
        const distanceFromCenter = Math.abs(scrollY - heroCenter)
        heroCenterProgress = Math.max(0, 1 - (distanceFromCenter / (heroRange / 2)))
      } else if (scrollY > heroEnd) {
        heroCenterProgress = 0
      }

      // WHATWEDO section (0.7vh to 1.85vh, center at 1.275vh)
      const whatStart = windowHeight * 0.7
      const whatEnd = windowHeight * 1.85
      const whatCenter = (whatStart + whatEnd) / 2
      const whatRange = whatEnd - whatStart
      
      let whatCenterProgress = 0
      if (scrollY >= whatStart && scrollY <= whatEnd) {
        const distanceFromCenter = Math.abs(scrollY - whatCenter)
        whatCenterProgress = Math.max(0, 1 - (distanceFromCenter / (whatRange / 2)))
      }

      // PORTAL section (1.85vh to 2.7vh, center at 2.275vh)
      const portalStart = windowHeight * 1.85
      const portalEnd = windowHeight * 2.7
      const portalCenter = (portalStart + portalEnd) / 2
      const portalRange = portalEnd - portalStart
      
      let portalCenterProgress = 0
      // ONLY calculate if we're actually in the portal section or beyond
      if (scrollY >= portalStart) {
        if (scrollY <= portalEnd) {
          const distanceFromCenter = Math.abs(scrollY - portalCenter)
          portalCenterProgress = Math.max(0, 1 - (distanceFromCenter / (portalRange / 2)))
        }
      }

      // Update center progress for all sections
      setSectionCenterProgress({
        hero: heroCenterProgress,
        whatwedo: whatCenterProgress,
        portal: portalCenterProgress
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: isLoaded ? 1 : 0.5,
        transition: 'opacity 0.5s ease'
      }}
    >
      <Canvas
        frameloop={isPaused ? 'demand' : 'always'}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
      >
        <PerspectiveCamera
          makeDefault
          position={[0, 0, 5]}
          fov={50}
          near={0.1}
          far={1000}
        />
        
        <color attach="background" args={['#000000']} />
        
        <Stars
          radius={100}
          depth={50}
          count={3000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />
        
        <ambientLight intensity={0.8} color="#ffffff" />
        
        <directionalLight
          position={[10, 10, 5]}
          intensity={2.5}
          color="#00d4ff"
        />
        
        <pointLight
          position={[-8, 5, -5]}
          intensity={1.5}
          color="#6366f1"
          distance={25}
        />
        
        <pointLight
          position={[8, -3, 5]}
          intensity={1}
          color="#8b5cf6"
          distance={20}
        />
        
        <Suspense fallback={null}>
          <SceneManager 
            currentSection={currentSection} 
            whatWeDoServiceIndex={activeService}
            portalOpenProgress={portalOpenProgress}
            sectionCenterProgress={sectionCenterProgress}
            onSceneReady={onSceneReady}
            isPortalZooming={isPortalZooming}
            portalZoomProgress={portalZoomProgress}
          />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default SceneWrapper