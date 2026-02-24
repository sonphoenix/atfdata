import { useState, useEffect, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
import { GalaxyScene } from '../three/GalaxyScene'
import { PersonaStatsModal } from '../three/PersonaStatsModal'
import { PersonaPointFound } from '../three/PersonaPointFound'
import { PersonaCanvasOverlay } from '../three/PersonaCanvasOverlay'
// import { PathEditorOverlay } from '../three/PathEditorOverlay'  // TEMPORARY: For path editing
import { ControlsHUD, WorldTitle, PathLabels, StatsInfoButton } from '../three/UiComponents'
import { startWormhole, notifySceneReady } from '../effects/WormholeOverlay'
import { getProjectStats, clearStatsCache, forceRefreshStats } from '../utils/projectStatsService'
import { ArrowLeft, Eye } from 'lucide-react'
import { projectsGraph } from '../data/projectsGraph'

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  )
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

// ─────────────────────────────────────────────
// Mobile D-Pad component
// ─────────────────────────────────────────────
const DPad = ({ onMove }) => {
  // Repeat movement while holding a direction
  const holdRef = useRef(null)

  const startMove = (dx, dz) => {
    onMove(dx, dz)
    holdRef.current = setInterval(() => onMove(dx, dz), 320)
  }

  const stopMove = () => {
    if (holdRef.current) {
      clearInterval(holdRef.current)
      holdRef.current = null
    }
  }

  useEffect(() => () => stopMove(), [])

  const btn = (dx, dz, label, style) => (
    <div
      onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); startMove(dx, dz) }}
      onPointerUp={stopMove}
      onPointerCancel={stopMove}
      style={{
        width: 52,
        height: 52,
        borderRadius: 12,
        background: 'rgba(255,255,255,0.12)',
        border: '1.5px solid rgba(255,255,255,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        color: '#fff',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(8px)',
        transition: 'background 0.1s',
        ...style,
      }}
    >
      {label}
    </div>
  )

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '52px 52px 52px',
      gridTemplateRows: '52px 52px 52px',
      gap: 6,
    }}>
      {/* row 1 */}
      <div />
      {btn(0, -1, '▲', {})}
      <div />
      {/* row 2 */}
      {btn(-1, 0, '◀', {})}
      {/* centre dot */}
      <div style={{
        width: 52, height: 52, borderRadius: 12,
        background: 'rgba(255,255,255,0.05)',
        border: '1.5px solid rgba(255,255,255,0.1)',
      }} />
      {btn(1, 0, '▶', {})}
      {/* row 3 */}
      <div />
      {btn(0, 1, '▼', {})}
      <div />
    </div>
  )
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
const ProjectsGalaxy = () => {
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const [isLoading, setIsLoading] = useState(true)
  const [sceneReady, setSceneReady] = useState(false)
  const [canRenderScene, setCanRenderScene] = useState(false)

  const [selectedProject, setSelectedProject] = useState(null)
  const [zoomMode, setZoomMode] = useState(false)
  const [showPointFound, setShowPointFound] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)

  // Current node the player is standing on (needed for mobile View button)
  const [currentProject, setCurrentProject] = useState(null)

  // Ref to GalaxyScene's moveInDirection so the d-pad can call it
  const moveInDirectionRef = useRef(null)

  const [projectStats, setProjectStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(false)

  const lastAnalyzedRef = useRef(new Set())

  useEffect(() => {
    const timer = setTimeout(() => setCanRenderScene(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const getProjectIndex = (project) => {
    if (!project) return 1
    const nodeIndex = projectsGraph.nodes.findIndex(n => n.project.name === project.name)
    return nodeIndex !== -1 ? nodeIndex : 1
  }

  const handleProjectSelect = (project) => {
    console.log('🎯 Project selected:', project.name)
    setSelectedProject(project)
    setZoomMode(true)
    setTimeout(() => setShowPointFound(true), 400)
  }

  const handleContinueToStats = async () => {
    console.log('➡️ Continuing to stats modal')
    setShowPointFound(false)
    setShowStatsModal(true)
    if (!projectStats) {
      setLoadingStats(true)
      try {
        const stats = await getProjectStats(selectedProject)
        setProjectStats(stats)
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        setLoadingStats(false)
      }
    }
  }

  const handleClosePointFound = () => {
    setShowPointFound(false)
    setTimeout(() => {
      setZoomMode(false)
      setSelectedProject(null)
      setProjectStats(null)
    }, 600)
  }

  const handleCloseStatsModal = () => {
    setShowStatsModal(false)
    setTimeout(() => {
      setZoomMode(false)
      setSelectedProject(null)
      setProjectStats(null)
    }, 300)
  }

  const handleForceRefresh = async () => {
    if (!selectedProject) return
    if (projectStats?.projectName) lastAnalyzedRef.current.delete(selectedProject.id)
    clearStatsCache()
    setLoadingStats(true)
    setProjectStats(null)
    try {
      const freshStats = await forceRefreshStats(selectedProject)
      setProjectStats(freshStats)
    } catch (error) {
      console.error('Force refresh failed:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleSceneReady = () => {
    setSceneReady(true)
    if (window.__projectsGalaxyReadyCallback) window.__projectsGalaxyReadyCallback()
    setTimeout(() => setIsLoading(false), 300)
  }

  const handleExitGalaxy = () => {
    setSelectedProject(null)
    window.__homeSceneReadyCallback = () => {
      notifySceneReady()
      delete window.__homeSceneReadyCallback
    }
    startWormhole({ reverse: true, waitForScene: true, onComplete: () => {} })
    setTimeout(() => navigate('/'), 500)
  }

  // Called by GalaxyScene to hand up its moveInDirection function
  const handleRegisterMove = useCallback((fn) => {
    moveInDirectionRef.current = fn
  }, [])

  const handleDPadMove = (dx, dz) => {
    if (moveInDirectionRef.current) moveInDirectionRef.current(dx, dz)
  }

  const anyModalOpen = selectedProject || showPointFound || showStatsModal

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      background: zoomMode ? '#000000' : '#ffffff',
      transition: 'background 0.8s ease-out'
    }}>
      {/* Loading screen */}
      {isLoading && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: '#000000', zIndex: 9999,
          opacity: sceneReady ? 0 : 1,
          transition: 'opacity 0.5s ease-out',
          pointerEvents: sceneReady ? 'none' : 'all'
        }} />
      )}

      {/* 3D Scene */}
      {canRenderScene && (
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%', zIndex: 1,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.5s ease',
        }}>
          <Canvas
            shadows
            style={{ display: 'block', width: '100%', height: '100%' }}
            gl={{ preserveDrawingBuffer: true, antialias: true, alpha: false }}
          >
            <GalaxyScene
              onSelectProject={handleProjectSelect}
              onCurrentProjectChange={setCurrentProject}
              onRegisterMove={handleRegisterMove}
              selectedProject={selectedProject}
              onReady={handleSceneReady}
              zoomMode={zoomMode}
              zoomedProject={selectedProject}
            />
          </Canvas>
        </div>
      )}

      {/* UI Elements */}
      {!anyModalOpen && !isLoading && (
        <>
          <ControlsHUD />
          <WorldTitle />
          <PathLabels />
          <StatsInfoButton />

          {isMobile && (
            <div style={{
              position: 'fixed',
              bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              {/* View Project button — only shows when standing on a node */}
              {currentProject && (
                <button
                  onClick={() => handleProjectSelect(currentProject)}
                  style={{
                    background: 'rgba(99, 102, 241, 0.92)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: '50px',
                    padding: '0.65rem 1.5rem',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.45)',
                    whiteSpace: 'nowrap',
                    WebkitTapHighlightColor: 'transparent',
                    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                  }}
                  onPointerDown={e => {
                    e.currentTarget.style.transform = 'scale(0.96)'
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(99,102,241,0.3)'
                  }}
                  onPointerUp={e => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.45)'
                  }}
                >
                  <Eye size={15} />
                  {currentProject.name}
                </button>
              )}

              {/* D-Pad */}
              <DPad onMove={handleDPadMove} />
            </div>
          )}

          {/* Back button — on mobile pushed above the d-pad on the left */}
          <button
            onClick={handleExitGalaxy}
            style={{
              position: 'fixed',
              bottom: isMobile
                ? 'calc(1.5rem + env(safe-area-inset-bottom, 0px))'
                : '2rem',
              left: '2rem',
              zIndex: 100,
              background: 'rgba(20, 20, 30, 0.95)',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: isMobile ? '0.6rem 1rem' : '1rem 2rem',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: isMobile ? '0.85rem' : '1rem',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
              fontWeight: '500',
              WebkitTapHighlightColor: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.background = 'rgba(30,30,40,0.95)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.background = 'rgba(20,20,30,0.95)'
            }}
          >
            <ArrowLeft size={isMobile ? 16 : 20} />
            <span>Back to Home</span>
          </button>
        </>
      )}

      {/* PersonaPointFound */}
      {showPointFound && selectedProject && (
        <PersonaPointFound
          project={selectedProject}
          onContinue={handleContinueToStats}
          onClose={handleClosePointFound}
          projectIndex={getProjectIndex(selectedProject)}
          totalProjects={projectsGraph.nodes.length}
        />
      )}

      {/* PersonaCanvasOverlay */}
      {zoomMode && !showStatsModal && (
        <PersonaCanvasOverlay selectedProject={selectedProject} />
      )}

      {/* PersonaStatsModal */}
      {showStatsModal && selectedProject && (
        <PersonaStatsModal
          selectedProject={selectedProject}
          projectStats={projectStats}
          loadingStats={loadingStats}
          onClose={handleCloseStatsModal}
          onRefresh={handleForceRefresh}
        />
      )}
    </div>
  )
}

export default ProjectsGalaxy