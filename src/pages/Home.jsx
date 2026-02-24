import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/sections/Navbar'
import Hero from '../components/sections/Hero'
import WhatWeDo from '../components/sections/WhatWeDo'
import Portal from '../components/sections/Portal'
import Footer from '../components/sections/Footer'
import ChatBot from '../components/Chatbot'
import Contact from '../components/sections/Contact' 
import SceneWrapper from '../components/three/SceneWrapper'
import { startWormhole, notifySceneReady } from '../components/effects/WormholeOverlay'

const Home = ({ onLoadProgress }) => {
  const navigate = useNavigate()
  const [isPortalZooming, setIsPortalZooming] = useState(false)
  const [portalZoomProgress, setPortalZoomProgress] = useState(0)
  const [canRenderScene, setCanRenderScene] = useState(true)
  const [isWaitingForWormhole, setIsWaitingForWormhole] = useState(false)
  const [isSceneReady, setIsSceneReady] = useState(false)

  useEffect(() => {
    console.log('🔍 HOME: isSceneReady changed to:', isSceneReady)
  }, [isSceneReady])

  const handlePortalZoomStart = () => {
    console.log('🚀 Starting portal zoom animation...')
    
    setIsPortalZooming(true)
    
    let progress = 0
    const zoomDuration = 1000
    const startTime = Date.now()
    
    const animateZoom = () => {
      const elapsed = Date.now() - startTime
      progress = Math.min(elapsed / zoomDuration, 1)
      
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      setPortalZoomProgress(easedProgress)
      
      console.log(`🎯 Portal zoom progress: ${(easedProgress * 100).toFixed(1)}%`)
      
      if (progress < 1) {
        requestAnimationFrame(animateZoom)
      } else {
        console.log('✅ Portal zoom complete! Starting wormhole...')
        setIsPortalZooming(false)
        
        window.__projectsGalaxyReadyCallback = () => {
          console.log('📡 ProjectsGalaxy ready signal received in Home callback')
          notifySceneReady()
          delete window.__projectsGalaxyReadyCallback
        }
        
        startWormhole({
          waitForScene: true,
          onComplete: () => {
            console.log('✨ Wormhole complete!')
          }
        })
        
        setTimeout(() => {
          console.log('🚀 Navigating to projects...')
          navigate('/projects')
        }, 500)
      }
    }
    
    animateZoom()
  }

  const handleSceneReady = () => {
    console.log('🎨 HOME: handleSceneReady called! Setting isSceneReady = true')
    setIsSceneReady(true)
  }

  useEffect(() => {
    const handleWormholeStart = (event) => {
      if (event.detail?.reverse) {
        console.log('⏸️ Reverse wormhole detected - brief delay for smooth start')
        setCanRenderScene(false)
        setIsWaitingForWormhole(true)
        setIsSceneReady(false)
        
        setTimeout(() => {
          console.log('▶️ Starting Home scene render')
          setCanRenderScene(true)
        }, 800)
      }
    }

    const handleWormholeComplete = () => {
      if (isWaitingForWormhole) {
        console.log('✅ Wormhole complete')
        setCanRenderScene(true)
        setIsWaitingForWormhole(false)
      }
    }

    window.addEventListener('wormhole:start', handleWormholeStart)
    window.addEventListener('wormhole:complete', handleWormholeComplete)
    
    return () => {
      window.removeEventListener('wormhole:start', handleWormholeStart)
      window.removeEventListener('wormhole:complete', handleWormholeComplete)
    }
  }, [isWaitingForWormhole])

  useEffect(() => {
    return () => {
      delete window.__homeSceneReadyCallback
    }
  }, [])

  console.log('🏠 HOME RENDER: isSceneReady =', isSceneReady, 'canRenderScene =', canRenderScene)

 return (
    <div className="min-h-screen">
      <Navbar />
      
      {isWaitingForWormhole && !canRenderScene && (
        <div className="fixed inset-0 bg-black z-[9998] pointer-events-none" />
      )}

      {canRenderScene && (
        <SceneWrapper 
          onSceneReady={handleSceneReady}
          isPortalZooming={isPortalZooming}
          portalZoomProgress={portalZoomProgress}
          onLoadProgress={onLoadProgress}
        />
      )}
      
      {/* Main content wrapper */}
      <main className="relative z-10">
        <Hero isSceneReady={isSceneReady} />
        <WhatWeDo />
        <Portal onZoomStart={handlePortalZoomStart} />
        <Contact />  
      </main>
      
      {/* Footer */}
      <Footer />

      {/* ChatBot with Cal.com integration */}
      <ChatBot />
    </div>
  )

}

export default Home