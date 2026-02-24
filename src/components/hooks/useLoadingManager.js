import { useState, useEffect, useCallback } from 'react'

const useLoadingManager = () => {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingStatus, setLoadingStatus] = useState('Initializing...')
  const [isLoading, setIsLoading] = useState(true)
  const [loadedAssets, setLoadedAssets] = useState([])
  const [totalAssets, setTotalAssets] = useState(0)
  const [useRealProgress, setUseRealProgress] = useState(false)

  // Handle Three.js progress - NO DELAYS!
  const handleThreeProgress = useCallback((progress) => {
    console.log('📊 useLoadingManager: Received progress:', progress)
    
    setUseRealProgress(true)
    setLoadingProgress(progress)
    
    if (progress < 30) {
      setLoadingStatus('Initializing 3D engine...')
    } else if (progress < 60) {
      setLoadingStatus('Loading textures and models...')
    } else if (progress < 90) {
      setLoadingStatus('Preparing animations...')
    } else if (progress < 100) {
      setLoadingStatus('Finalizing scene...')
    } else {
      setLoadingStatus('Ready!')
      console.log('✅ useLoadingManager: Progress 100 - hiding loading screen IMMEDIATELY')
      setIsLoading(false) // NO DELAY!
    }
  }, [])

  // Fallback loading simulation
  const simulateLoading = useCallback(() => {
    const assets = [
      { name: '3D Scene', weight: 40, delay: 800 },
      { name: 'Textures', weight: 20, delay: 600 },
      { name: 'Models', weight: 15, delay: 500 },
      { name: 'Animations', weight: 15, delay: 400 },
      { name: 'Effects', weight: 10, delay: 300 }
    ]

    setTotalAssets(assets.length)

    let currentProgress = 0
    let cumulativeDelay = 0

    assets.forEach((asset, index) => {
      cumulativeDelay += asset.delay
      
      setTimeout(() => {
        if (!useRealProgress) {
          setLoadingStatus(`Loading ${asset.name}...`)
          currentProgress += asset.weight
          setLoadingProgress(Math.min(currentProgress, 100))
          setLoadedAssets(prev => [...prev, asset.name])

          if (index === assets.length - 1) {
            setTimeout(() => {
              setLoadingStatus('Almost ready...')
              setTimeout(() => {
                console.log('🎬 useLoadingManager (simulated): Setting isLoading to FALSE')
                setIsLoading(false)
              }, 300) // Reduced delay
            }, 200)
          }
        }
      }, cumulativeDelay)
    })
  }, [useRealProgress])

  const checkWebGLSupport = useCallback(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      
      if (!gl) {
        setLoadingStatus('WebGL not supported. Please update your browser.')
        setTimeout(() => {
          window.location.href = 'https://get.webgl.org/'
        }, 3000)
        return false
      }
      
      return true
    } catch (error) {
      console.error('WebGL check failed:', error)
      return false
    }
  }, [])

  useEffect(() => {
    if (checkWebGLSupport()) {
      simulateLoading()
    }
  }, [checkWebGLSupport, simulateLoading])

  useEffect(() => {
    console.log('🔄 useLoadingManager: isLoading =', isLoading)
  }, [isLoading])

  return {
    loadingProgress,
    loadingStatus,
    isLoading,
    loadedAssets,
    totalAssets,
    setLoadingProgress,
    setLoadingStatus,
    handleThreeProgress
  }
}

export default useLoadingManager