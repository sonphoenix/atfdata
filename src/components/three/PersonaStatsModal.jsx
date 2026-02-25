import { useState, useEffect } from 'react'
import { useModalAnimations } from '../hooks/useModalAnimations'
import { getProjectImages, getProjectLinks } from '../utils/calculations'
import { getProjectStats } from '../utils/projectStatsService'
import { getBasicProjectStats } from '../utils/statsCalculator'
import { InputProvider, useInput } from '../context/InputContext'
import { useNavState, NAV_STATE } from '../hooks/useNavState'

import { ImageModal } from './ImageModal'
import { ModelCanvas } from './ModelCanvas'
import { StarCanvas } from './StarCanvas'
import { StatLabels } from './StatLabels'
import { StatusDropdown } from './StatusDropdown'
import { TechStack } from './TechStack'
import { ImagePreviewBlocks } from './ImagePreviewBlocks'
import { BackgroundEffects } from './BackgroundEffects'

import '../styles/animations.css'

// ─── Badge components ─────────────────────────────────────────────────────────
const KeyBadge = ({ label }) => (
  <span style={{
    background: 'rgba(0,0,0,0.85)', color: '#FFD700', padding: '4px 10px',
    borderRadius: '4px', fontSize: '1rem', fontWeight: 'bold',
    fontFamily: '"Rajdhani", sans-serif', border: '2px solid #FFD700',
    display: 'inline-flex', alignItems: 'center', gap: '4px'
  }}>{label}</span>
)

const GPBadge = ({ label, color = '#e05252' }) => (
  <span style={{
    width: '28px', height: '28px', borderRadius: '50%', background: color,
    border: '2px solid rgba(255,255,255,0.4)', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '11px',
    fontWeight: 'bold', fontFamily: 'monospace', color: '#fff', flexShrink: 0
  }}>{label}</span>
)

// ─── Inner modal — has access to InputContext ─────────────────────────────────
const ModalInner = ({ selectedProject, onClose }) => {
  const { onAction, axes, inputMode } = useInput()

  const {
    animateIn, animateOut, modelAnimateIn, starAnimateIn,
    showActions, setShowActions, handleClose, triggerAnimations
  } = useModalAnimations(selectedProject, onClose)

  const [projectStats, setProjectStats] = useState(null)
  const [isLoading, setIsLoading]       = useState(true)

  const { hasImages, imageUrls, allImageUrls } = getProjectImages(selectedProject)
  const { github, live, playStore }            = getProjectLinks(selectedProject)

  // Build dropdown action list once — same order StatusDropdown renders
  const dropdownActions = [
    github    && { key: 'github',    label: 'SOURCE CODE', href: github    },
    live      && { key: 'live',      label: 'LIVE DEMO',   href: live      },
    playStore && { key: 'playStore', label: 'GET APP',     href: playStore },
  ].filter(Boolean)

  // ── State machine ───────────────────────────────────────────────────────────
  const {
  navState, imageIndex, dropdownIndex,
  handleAction, openShowcase, setImageIndex,
  goModal, goDropdown,
  } = useNavState({
    hasImages,
    imageCount:    allImageUrls.length,
    dropdownCount: dropdownActions.length,
    onClose:       handleClose,
    dropdownActions,
  })

  // Keep showActions in sync with navState so StatusDropdown still works
  useEffect(() => {
    setShowActions(navState === NAV_STATE.DROPDOWN)
  }, [navState, setShowActions])

  // ── Subscribe to input actions — one place, no refs ─────────────────────────
  useEffect(() => {
    return onAction(handleAction)
  }, [onAction, handleAction])

  // ── Stats fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedProject) return
    const fetchStats = async () => {
      try {
        const statsResult = await getProjectStats(selectedProject)
        setProjectStats(statsResult)
        triggerAnimations()
      } catch (err) {
        console.error('❌ Failed to analyze project:', err)
        const basicStats = getBasicProjectStats(selectedProject)
        setProjectStats({ ...basicStats, source: 'fallback', confidence: 50, error: err.message })
        triggerAnimations()
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [selectedProject])

  // ── Mouse handlers (images) ─────────────────────────────────────────────────
  const handleImageClick = (index) => openShowcase(index)
  const handleNextImage  = () => setImageIndex((imageIndex + 1) % allImageUrls.length)
  const handlePrevImage  = () => setImageIndex((imageIndex - 1 + allImageUrls.length) % allImageUrls.length)

  // ── Context-aware hint labels ───────────────────────────────────────────────
  const aLabel = navState === NAV_STATE.DROPDOWN
    ? 'Confirm'
    : hasImages
      ? 'View Images'
      : null

  const bLabel = navState === NAV_STATE.SHOWCASE
    ? 'Close Images'
    : navState === NAV_STATE.DROPDOWN
      ? 'Close Menu'
      : 'Back'

  const yLabel = navState === NAV_STATE.DROPDOWN ? 'Close' : 'Links'

  if (!selectedProject) return null

  if (isLoading) return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(135deg, rgba(0,0,0,0.98) 0%, rgba(10,10,0,0.97) 50%, rgba(0,0,0,0.98) 100%)',
      backdropFilter: 'blur(8px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        textAlign: 'center', color: '#FFD700',
        fontFamily: '"Bebas Neue", sans-serif', fontSize: '3rem',
        letterSpacing: '4px', textShadow: '3px 3px 0 #000, 0 0 30px rgba(255,215,0,0.5)',
        animation: 'pulse 1.5s infinite'
      }}>
        <div>ANALYZING PROJECT</div>
        <div style={{ fontSize: '1.5rem', marginTop: '1rem', fontFamily: '"Rajdhani", sans-serif' }}>
          Fetching GitHub data...
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
      </div>
    </div>
  )

  if (!projectStats) return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(135deg, rgba(0,0,0,0.98) 0%, rgba(10,10,0,0.97) 50%, rgba(0,0,0,0.98) 100%)',
      backdropFilter: 'blur(8px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#FF0000', fontFamily: '"Bebas Neue", sans-serif', fontSize: '2rem'
    }}>
      Failed to load project stats
    </div>
  )

  return (
    <>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.98) 0%, rgba(10,10,0,0.97) 50%, rgba(0,0,0,0.98) 100%)',
        backdropFilter: 'blur(8px)', zIndex: 1000, overflow: 'hidden',
        animation: animateOut ? 'modalFadeOut 0.8s ease-out forwards' : 'modalFadeIn 0.6s ease-out forwards',
        pointerEvents: 'auto'
      }}>
        <BackgroundEffects animateIn={animateIn} animateOut={animateOut} />

        <div style={{
          position: 'relative', width: '100%', height: '100%',
          padding: '2rem 3rem', display: 'flex', flexDirection: 'column',
          animation: animateOut ? 'contentZoomOut 0.6s cubic-bezier(0.6,0,0.8,0.2) forwards' : '',
          pointerEvents: 'auto'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '1rem',
            animation: animateOut ? 'slideOutTop 0.5s ease-out forwards' : 'slideInTopBounce 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.4s forwards',
            opacity: 0, pointerEvents: 'auto', zIndex: 100000
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative', top: '-1.75rem', left: '-2rem', zIndex: 1 }}>
              <div style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                border: '3px solid #000', padding: '8px 20px',
                fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.5rem',
                color: '#000', letterSpacing: '2px',
                boxShadow: '0 4px 0 #B8860B, 0 6px 20px rgba(255,215,0,0.5)',
                transform: 'skewX(-5deg)',
                animation: animateOut ? '' : 'glitchPulse 0.3s ease-out 0.6s'
              }}>
                <span style={{ display: 'inline-block', transform: 'skewX(5deg)' }}>
                  LV.{projectStats.complexity || projectStats.overall || 70}
                </span>
              </div>
              <h1 style={{
                fontFamily: '"Bebas Neue", sans-serif', fontSize: '3.5rem',
                color: '#FFD700', margin: 0, letterSpacing: '3px',
                textShadow: '3px 3px 0 #000, 0 0 30px rgba(255,215,0,0.5)', lineHeight: 1,
                animation: animateOut ? '' : 'textReveal 0.6s steps(30) 0.5s forwards',
                overflow: 'hidden', whiteSpace: 'nowrap', width: 0
              }}>
                {selectedProject.name}
              </h1>
            </div>

            <StatusDropdown
              showActions={navState === NAV_STATE.DROPDOWN}
              setShowActions={() => {
                if (navState === NAV_STATE.DROPDOWN) goModal()
                else goDropdown()
              }}
              animateOut={animateOut}
              github={github} live={live} playStore={playStore}
              selectedActionIndex={dropdownIndex}
            />
          </div>

          {/* Main grid */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '30% 70%', gap: '2rem', position: 'relative' }}>
            {/* Left */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* axes ref flows directly into ModelCanvas → useFrame, zero re-renders */}
              <ModelCanvas
                projectName={selectedProject.name}
                modelAnimateIn={modelAnimateIn}
                animateOut={animateOut}
                joystickAxesRef={axes}
              />
              {hasImages && (
                <ImagePreviewBlocks imageUrls={imageUrls} onImageClick={handleImageClick} animateOut={animateOut} />
              )}
            </div>

            {/* Right */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', marginBottom: '6rem' }}>
              <div style={{ flex: 1, position: 'relative', opacity: 1, transform: 'scale(1)', pointerEvents: 'auto',
                animation: animateOut ? 'starFadeOut 0.5s ease-out forwards' : '' }}>
                <StarCanvas projectStats={projectStats} starAnimateIn={starAnimateIn} animateOut={animateOut} />
                <StatLabels projectStats={projectStats} animateOut={animateOut} showActions={navState === NAV_STATE.DROPDOWN} />
              </div>
              <TechStack tech={selectedProject.tech} animateOut={animateOut} />
            </div>
          </div>

          {/* Bottom action bar */}
          <div style={{
            position: 'absolute', bottom: '1.5rem', right: '0.5rem',
            display: 'flex', alignItems: 'center', gap: '1.5rem',
            animation: animateOut ? 'buttonPressOut 0.3s ease-out forwards' : 'buttonSlideIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 1.1s forwards',
            opacity: 0, transform: 'translateX(100px)', zIndex: 100000, pointerEvents: 'auto'
          }}>
            {inputMode === 'gamepad' ? (
              <>
                {/* Contextual hints — only show what's relevant right now */}
                {navState === NAV_STATE.DROPDOWN && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#aaa', fontSize: '0.9rem', fontFamily: '"Rajdhani", sans-serif' }}>
                    <span>↑↓</span><span>Navigate</span>
                  </div>
                )}
                {navState === NAV_STATE.SHOWCASE && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#aaa', fontSize: '0.9rem', fontFamily: '"Rajdhani", sans-serif' }}>
                    <GPBadge label="◀" color="#555" /><GPBadge label="▶" color="#555" />
                    <span>Navigate</span>
                  </div>
                )}
                {navState === NAV_STATE.MODAL && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#aaa', fontSize: '0.9rem', fontFamily: '"Rajdhani", sans-serif' }}>
                      <span style={{ fontSize: '1.2rem' }}>🕹️</span><span>Rotate</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#aaa', fontSize: '0.9rem', fontFamily: '"Rajdhani", sans-serif' }}>
                      <span style={{ fontSize: '1.2rem' }}>🕹️R</span><span>Zoom</span>
                    </div>
                  </>
                )}
                {aLabel && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#aaa', fontSize: '0.9rem', fontFamily: '"Rajdhani", sans-serif' }}>
                    <GPBadge label="A" color="#4CAF50" /><span>{aLabel}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#aaa', fontSize: '0.9rem', fontFamily: '"Rajdhani", sans-serif' }}>
                  <GPBadge label="Y" color="#c8a020" /><span>{yLabel}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FFD700', fontSize: '0.9rem', fontFamily: '"Rajdhani", sans-serif' }}>
                  <GPBadge label="B" color="#e05252" />
                  <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.4rem', letterSpacing: '2px' }}>{bLabel}</span>
                </div>
              </>
            ) : (
              <>
                {hasImages && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#aaa', fontSize: '0.9rem', fontFamily: '"Rajdhani", sans-serif' }}>
                    <KeyBadge label="Click" /><span>View Images</span>
                  </div>
                )}
                <button
                  onClick={handleClose} disabled={animateOut}
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,0,0.9) 100%)',
                    border: '3px solid #FFD700', padding: '12px 30px',
                    fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.5rem',
                    color: '#FFD700', letterSpacing: '2px',
                    cursor: animateOut ? 'default' : 'pointer',
                    boxShadow: '0 4px 15px rgba(255,215,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s'
                  }}
                >
                  <KeyBadge label="ESC" /> Back
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {navState === NAV_STATE.SHOWCASE && (
        <ImageModal
          images={allImageUrls} currentIndex={imageIndex}
          onClose={goModal}
          onNext={handleNextImage} onPrev={handlePrevImage}
          inputMode={inputMode}
        />
      )}
    </>
  )
}

// ─── Public export — wraps with InputProvider ─────────────────────────────────
export const PersonaStatsModal = ({ selectedProject, onClose }) => (
  <InputProvider>
    <ModalInner selectedProject={selectedProject} onClose={onClose} />
  </InputProvider>
)