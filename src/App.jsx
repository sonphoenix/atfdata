import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Projects from './pages/Projects'
import WormholeOverlay from './components/effects/WormHoleOverlay'
import { ServiceProvider } from './components/three/ServiceContext'
import LoadingScreen from './components/LoadingScreen'
import useLoadingManager from './components/hooks/useLoadingManager'
import './i18n/config'
function App() {
  const { 
    loadingProgress, 
    loadingStatus, 
    isLoading, 
    handleThreeProgress 
  } = useLoadingManager()

  const [isWormholeVisible, setIsWormholeVisible] = useState(false)

  // Handle wormhole events
  useEffect(() => {
    const handleWormholeStart = () => {
      setIsWormholeVisible(true)
    }

    const handleWormholeComplete = () => {
      setTimeout(() => {
        setIsWormholeVisible(false)
      }, 1000)
    }

    window.addEventListener('wormhole:start', handleWormholeStart)
    window.addEventListener('wormhole:complete', handleWormholeComplete)
    
    return () => {
      window.removeEventListener('wormhole:start', handleWormholeStart)
      window.removeEventListener('wormhole:complete', handleWormholeComplete)
    }
  }, [])

  return (
    <>
      {/* Global Loading Screen */}
      <LoadingScreen 
        progress={loadingProgress}
        status={loadingStatus}
        isVisible={isLoading}
      />

      {/* App Content (hidden while loading) */}
      <div style={{ 
        opacity: isLoading ? 0 : 1, 
        transition: 'opacity 0.5s ease',
        pointerEvents: isLoading ? 'none' : 'auto'
      }}>
        <ServiceProvider>
          <Router>
            {/* Global wormhole overlay - persists across all pages */}
            {!isLoading && <WormholeOverlay />}
            
            {/* App routes */}
            <Routes>
              <Route path="/" element={<Home onLoadProgress={handleThreeProgress} />} />
              <Route path="/projects" element={<Projects onLoadProgress={handleThreeProgress} />} />
            </Routes>
          </Router>
        </ServiceProvider>
      </div>
    </>
  )
}

export default App