import { useState, useEffect, useRef } from 'react'
import '../styles/persona-point-found.css'

// ============================================
// INPUT MODE DETECTION
// ============================================
const useInputMode = () => {
  const [inputMode, setInputMode] = useState('keyboard')
  const rafRef = useRef(null)

  useEffect(() => {
    // Touch = treat as mobile (no keyboard prompts)
    const onTouch = () => setInputMode('touch')
    const onKey   = () => setInputMode('keyboard')
    window.addEventListener('keydown', onTouch)
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouch, { passive: true })

    const poll = () => {
      const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : []
      if (pads.length > 0) {
        const pad = pads[0]
        const hasInput = pad.buttons.some(b => b.pressed) || pad.axes.some(a => Math.abs(a) > 0.2)
        if (hasInput) setInputMode('gamepad')
      }
      rafRef.current = requestAnimationFrame(poll)
    }
    rafRef.current = requestAnimationFrame(poll)

    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouch)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return inputMode
}

// Detect mobile viewport
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 640 : false
  )
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

// Keyboard key badge
const KeyBadge = ({ label }) => (
  <span className="key-badge">{label}</span>
)

// Gamepad face button badge
const GPBadge = ({ label, color }) => (
  <span style={{
    width: '30px', height: '30px',
    borderRadius: '50%',
    background: color,
    border: '2px solid rgba(255,255,255,0.35)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#fff',
    flexShrink: 0,
    boxShadow: `0 0 12px ${color}88`
  }}>
    {label}
  </span>
)

// Large touch-friendly button for mobile
const TouchButton = ({ label, accent = false, onPress }) => (
  <button
    onPointerDown={onPress}
    style={{
      flex: 1,
      minWidth: 0,
      padding: '0.85rem 1rem',
      borderRadius: '10px',
      border: accent
        ? '2px solid rgba(200,255,150,0.7)'
        : '2px solid rgba(255,255,255,0.2)',
      background: accent
        ? 'rgba(200,255,150,0.15)'
        : 'rgba(255,255,255,0.07)',
      backdropFilter: 'blur(8px)',
      color: '#fff',
      fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
      fontSize: '1.1rem',
      letterSpacing: '2px',
      fontWeight: '700',
      cursor: 'pointer',
      WebkitTapHighlightColor: 'transparent',
      transition: 'transform 0.1s ease, background 0.1s ease',
      boxShadow: accent
        ? '0 0 20px rgba(200,255,150,0.25)'
        : 'none',
    }}
    onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.96)' }}
    onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)' }}
  >
    {label}
  </button>
)

export const PersonaPointFound = ({ 
  project, 
  onContinue, 
  onClose,
  projectIndex = 1,
  totalProjects = 40
}) => {
  const [phase, setPhase] = useState('entering')
  const [showPrompt, setShowPrompt] = useState(false)

  const inputMode = useInputMode()
  const isMobile  = useIsMobile()

  // Refs for gamepad polling
  const phaseRef       = useRef('entering')
  const rafRef         = useRef(null)
  const prevButtonsRef = useRef({})

  useEffect(() => { phaseRef.current = phase }, [phase])

  // Gamepad polling
  useEffect(() => {
    const poll = () => {
      const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : []
      if (pads.length > 0 && phaseRef.current === 'active') {
        const pad = pads[0]
        const isPressed  = (idx) => pad.buttons[idx]?.pressed
        const wasPressed = (idx) => prevButtonsRef.current[idx]
        const justPressed = (idx) => isPressed(idx) && !wasPressed(idx)

        if (justPressed(0)) { // A = Continue
          phaseRef.current = 'exiting'
          setPhase('exiting')
          setTimeout(() => onContinue(), 600)
        }
        if (justPressed(1)) { // B = Back
          phaseRef.current = 'exiting'
          setPhase('exiting')
          setTimeout(() => onClose(), 600)
        }

        pad.buttons.forEach((btn, idx) => { prevButtonsRef.current[idx] = btn.pressed })
      }
      rafRef.current = requestAnimationFrame(poll)
    }
    rafRef.current = requestAnimationFrame(poll)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [onContinue, onClose])

  // Keyboard handling
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (phase !== 'active') return
      if (e.key === 'Enter' || e.key === ' ') {
        setPhase('exiting')
        setTimeout(() => onContinue(), 600)
      } else if (e.key === 'Escape') {
        setPhase('exiting')
        setTimeout(() => onClose(), 600)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [phase, onContinue, onClose])

  // Phase sequencing — slightly faster on mobile so the card feels snappier
  useEffect(() => {
    const enterDelay  = isMobile ? 600  : 1200
    const promptDelay = isMobile ? 1000 : 2000
    const enterTimer  = setTimeout(() => setPhase('active'),     enterDelay)
    const promptTimer = setTimeout(() => setShowPrompt(true), promptDelay)
    return () => { clearTimeout(enterTimer); clearTimeout(promptTimer) }
  }, [isMobile])

  const handleContinue = () => {
    if (phase !== 'active') return
    setPhase('exiting')
    setTimeout(() => onContinue(), 600)
  }

  const handleClose = () => {
    if (phase !== 'active') return
    setPhase('exiting')
    setTimeout(() => onClose(), 600)
  }

  const projectNameWords = project.name.split(' ')

  return (
    <div className={`persona-point-found-overlay ${phase}`}>
      <div className="point-found-content">

        {/* Counter */}
        <div className="point-found-counter">
          {projectIndex}/{totalProjects}
        </div>

        {/* Project Name */}
        <div className="point-found-title">
          {projectNameWords.map((word, index) => (
            <span key={index} className="title-text">{word}</span>
          ))}
        </div>

        {/* Description */}
        <div className="project-description-display">
          {project.description}
        </div>

        {/* Action prompts — three modes: touch | gamepad | keyboard */}
        {showPrompt && (
          <>
            {isMobile ? (
              // ── Mobile: big tappable buttons ──────────────────────────
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginTop: '1rem',
                opacity: 0,
                animation: 'fadeSlideIn 0.4s ease-out 0s forwards',
              }}>
                <TouchButton label="VIEW DETAILS" accent onPress={handleContinue} />
                <TouchButton label="BACK"                onPress={handleClose}    />
              </div>
            ) : (
              // ── Desktop: keyboard / gamepad badges ────────────────────
              <div className="action-prompts">
                {inputMode === 'gamepad' ? (
                  <>
                    <div className="prompt-item" style={{ flexDirection: 'row' }}>
                      <GPBadge label="A" color="#5dbb63" />
                      <span className="prompt-text">View Details</span>
                    </div>
                    <div className="prompt-item" style={{ flexDirection: 'row' }}>
                      <GPBadge label="B" color="#e05252" />
                      <span className="prompt-text">Back</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="prompt-item">
                      <KeyBadge label="ENTER" />
                      <span className="prompt-text">View Details</span>
                    </div>
                    <div className="prompt-item">
                      <KeyBadge label="ESC" />
                      <span className="prompt-text">Back</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Input mode indicator — desktop only */}
            {!isMobile && (
              <div style={{
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'flex-end',
                opacity: 0.5,
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                color: '#aaa',
                gap: '5px',
                alignItems: 'center'
              }}>
                {inputMode === 'gamepad' ? '🎮 Controller' : '⌨ Keyboard'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}