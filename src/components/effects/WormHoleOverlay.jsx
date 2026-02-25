import { Canvas } from '@react-three/fiber'
import { useState, useEffect } from 'react'
import WormholeTransition from '../effects/WormholeTransition'

// Global state for wormhole
const wormholeState = {
  isActive: false,
  onCompleteCallbacks: [],
  sceneReady: false,
  
  setActive(isActive) {
    this.isActive = isActive
    if (!isActive && this.onCompleteCallbacks.length > 0) {
      this.onCompleteCallbacks.forEach(callback => callback())
      this.onCompleteCallbacks = []
    }
  },
  
  registerCompleteCallback(callback) {
    if (!this.isActive) {
      callback()
    } else {
      this.onCompleteCallbacks.push(callback)
    }
  },
  
  setSceneReady(isReady) {
    this.sceneReady = isReady
  }
}

const WormholeOverlay = () => {
  const [isActive, setIsActive] = useState(false)
  const [isWaitingForScene, setIsWaitingForScene] = useState(false)
  const [isReverse, setIsReverse] = useState(false) // NEW: Track reverse state
  const [onCompleteCallback, setOnCompleteCallback] = useState(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Listen for wormhole start event
    const handleStart = (event) => {
      const reverse = event.detail?.reverse || false
      //////console.log(`🌀 WormholeOverlay: Starting transition (reverse: ${reverse})`)
      setIsActive(true)
      setIsReverse(reverse) // Set reverse state
      setIsWaitingForScene(event.detail?.waitForScene || false)
      setProgress(0)
      
      // Update global state
      wormholeState.setActive(true)
      
      if (event.detail?.onComplete) {
        setOnCompleteCallback(() => event.detail.onComplete)
      }
    }

    // Listen for scene ready event
    const handleSceneReady = () => {
      //////console.log('✅ WormholeOverlay: Scene ready signal received')
      setIsWaitingForScene(false)
      wormholeState.setSceneReady(true)
    }

    // Listen for wormhole stop event
    const handleStop = () => {
      //////console.log('⏹️ WormholeOverlay: Stopping transition')
      setIsActive(false)
      setIsWaitingForScene(false)
      setIsReverse(false)
      wormholeState.setActive(false)
      wormholeState.setSceneReady(false)
      setOnCompleteCallback(null)
      setProgress(0)
    }

    window.addEventListener('wormhole:start', handleStart)
    window.addEventListener('wormhole:sceneReady', handleSceneReady)
    window.addEventListener('wormhole:stop', handleStop)

    return () => {
      window.removeEventListener('wormhole:start', handleStart)
      window.removeEventListener('wormhole:sceneReady', handleSceneReady)
      window.removeEventListener('wormhole:stop', handleStop)
    }
  }, [])

  const handleComplete = () => {
    //////console.log('✨ WormholeOverlay: Transition complete')
    wormholeState.setActive(false)
    wormholeState.setSceneReady(false)
    
    // Dispatch completion event for components to detect
    window.dispatchEvent(new CustomEvent('wormhole:complete'))
    
    if (onCompleteCallback) {
      onCompleteCallback()
    }
    setIsActive(false)
    setIsWaitingForScene(false)
    setIsReverse(false)
    setOnCompleteCallback(null)
    setProgress(0)
  }

  const handleProgressUpdate = (newProgress) => {
    setProgress(newProgress)
  }

  if (!isActive) return null

  const backgroundOpacity = isReverse 
    ? (progress < 0.15 ? progress / 0.15 : (progress > 0.85 ? 1 - (progress - 0.85) / 0.15 : 1))
    : (progress < 0.85 ? 1 : (1 - (progress - 0.85) / 0.15))

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#000000',
          opacity: backgroundOpacity,
          transition: 'opacity 0.3s ease-out',
        }}
      />
      
      <Canvas
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'block',
          width: '100%',
          height: '100%',
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <WormholeTransition
          isActive={isActive}
          reverse={isReverse} // Pass reverse prop
          waitForReady={isWaitingForScene}
          onComplete={handleComplete}
          onProgressUpdate={handleProgressUpdate}
          duration={5.0}
          minDuration={4.0}
        />
      </Canvas>
    </div>
  )
}

// Export the global state so ProjectsGalaxy can use it
export { wormholeState }

// Helper functions to trigger wormhole from anywhere
export const startWormhole = ({ waitForScene = false, reverse = false, onComplete = null } = {}) => {
  window.dispatchEvent(
    new CustomEvent('wormhole:start', {
      detail: { waitForScene, reverse, onComplete },
    })
  )
}

export const notifySceneReady = () => {
  window.dispatchEvent(new CustomEvent('wormhole:sceneReady'))
}

export const stopWormhole = () => {
  window.dispatchEvent(new CustomEvent('wormhole:stop'))
}

export default WormholeOverlay