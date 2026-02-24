import { useState, useEffect, useRef } from 'react'
import { Settings, Info, X, Gamepad2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// ============================================
// Responsive hook
// ============================================
const useIsMobile = (breakpoint = 640) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  )
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [breakpoint])
  return isMobile
}

// ============================================
// CONTROLS HUD - Top Right with controller support
// ============================================

const KeyboardControls = ({ compact }) => (
  <>
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? '0.4rem' : '0.6rem', flexWrap: 'wrap' }}>
      {!compact && (
        <>
          <div style={{ display: 'flex', gap: '3px' }}>
            {['W','A','S','D'].map(k => <KBKey key={k} label={k} compact={compact} />)}
          </div>
          <span style={{ color: '#aaa', fontSize: '11px' }}>or</span>
        </>
      )}
      <div style={{ display: 'flex', gap: '3px' }}>
        <KBKey label="↑" compact={compact} /><KBKey label="↓" compact={compact} /><KBKey label="←" compact={compact} /><KBKey label="→" compact={compact} />
      </div>
      <span style={{ color: '#e0e0e0', fontSize: compact ? '11px' : '13px', marginLeft: '4px' }}>Move</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? '0.4rem' : '0.6rem' }}>
      <div style={{ display: 'flex', gap: '3px' }}>
        <KBKey label="↵" wide compact={compact} /><KBKey label="Spc" wide compact={compact} />
      </div>
      <span style={{ color: '#e0e0e0', fontSize: compact ? '11px' : '13px', marginLeft: '4px' }}>Select</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? '0.4rem' : '0.6rem' }}>
      <KBKey label="Tap" wide compact={compact} />
      <span style={{ color: '#e0e0e0', fontSize: compact ? '11px' : '13px', marginLeft: '4px' }}>Navigate</span>
    </div>
  </>
)

const GamepadControls = ({ compact }) => (
  <>
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? '0.4rem' : '0.6rem' }}>
      <GPButton type="stick" label="L" />
      <span style={{ color: '#aaa', fontSize: '11px' }}>or</span>
      <GPButton type="dpad" />
      <span style={{ color: '#e0e0e0', fontSize: compact ? '11px' : '13px', marginLeft: '4px' }}>Move</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? '0.4rem' : '0.6rem' }}>
      <GPButton type="face" label="A" color="#5dbb63" />
      <span style={{ color: '#e0e0e0', fontSize: compact ? '11px' : '13px', marginLeft: '4px' }}>Select</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? '0.4rem' : '0.6rem' }}>
      <GPButton type="face" label="B" color="#e05252" />
      <span style={{ color: '#e0e0e0', fontSize: compact ? '11px' : '13px', marginLeft: '4px' }}>Back</span>
    </div>
  </>
)

const KBKey = ({ label, wide, compact }) => (
  <div style={{
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderBottom: '3px solid rgba(255,255,255,0.15)',
    borderRadius: '5px',
    padding: compact ? '2px 5px' : (wide ? '3px 8px' : '3px 6px'),
    fontSize: compact ? '10px' : '11px',
    fontFamily: 'monospace',
    color: '#fff',
    minWidth: compact ? '18px' : (wide ? '38px' : '20px'),
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: '16px',
  }}>
    {label}
  </div>
)

const GPButton = ({ type, label, color }) => {
  if (type === 'stick') return (
    <div style={{
      width: '22px', height: '22px',
      borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.4)',
      background: 'rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '9px', color: '#ccc', fontWeight: 'bold', fontFamily: 'monospace'
    }}>{label}</div>
  )
  if (type === 'dpad') return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '10px 10px 10px',
      gridTemplateRows: '10px 10px 10px',
      gap: '1px'
    }}>
      {[null,'↑',null,'←',null,'→',null,'↓',null].map((arrow, i) => (
        <div key={i} style={{
          width: '10px', height: '10px',
          background: arrow ? 'rgba(255,255,255,0.3)' : 'transparent',
          borderRadius: '2px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '6px', color: '#fff'
        }}>{arrow}</div>
      ))}
    </div>
  )
  if (type === 'face') return (
    <div style={{
      width: '22px', height: '22px',
      borderRadius: '50%',
      background: color || '#444',
      border: '2px solid rgba(255,255,255,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '10px', color: '#fff', fontWeight: 'bold', fontFamily: 'monospace'
    }}>{label}</div>
  )
  return null
}

export const ControlsHUD = () => {
  const isMobile = useIsMobile()
  const [collapsed, setCollapsed] = useState(false)
  const [inputMode, setInputMode] = useState('keyboard')
  const [controllerName, setControllerName] = useState('')
  const gamepadPollRef = useRef(null)

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) setCollapsed(true)
  }, [isMobile])

  useEffect(() => {
    const onConnect = (e) => {
      setInputMode('gamepad')
      setControllerName(e.gamepad.id.split('(')[0].trim())
    }
    const onDisconnect = () => {
      const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : []
      if (pads.length === 0) { setInputMode('keyboard'); setControllerName('') }
    }
    window.addEventListener('gamepadconnected', onConnect)
    window.addEventListener('gamepaddisconnected', onDisconnect)

    const pollGamepad = () => {
      const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : []
      if (pads.length > 0) {
        const pad = pads[0]
        if (pad.buttons.some(b => b.pressed) || pad.axes.some(a => Math.abs(a) > 0.2)) {
          setInputMode('gamepad')
          setControllerName(pad.id.split('(')[0].trim())
        }
      }
      gamepadPollRef.current = requestAnimationFrame(pollGamepad)
    }
    gamepadPollRef.current = requestAnimationFrame(pollGamepad)

    const onKeyDown = () => setInputMode('keyboard')
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('gamepadconnected', onConnect)
      window.removeEventListener('gamepaddisconnected', onDisconnect)
      window.removeEventListener('keydown', onKeyDown)
      if (gamepadPollRef.current) cancelAnimationFrame(gamepadPollRef.current)
    }
  }, [])

  const compact = isMobile

  return (
    <div style={{
      position: 'fixed',
      top: isMobile ? '1rem' : '2rem',
      right: isMobile ? '1rem' : '2rem',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem',
      alignItems: 'flex-end',
      maxWidth: isMobile ? 'calc(100vw - 2rem)' : 'none',
    }}>
      {/* Main Controls Panel */}
      <div style={{
        background: 'rgba(10, 10, 18, 0.90)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: compact ? '0.6rem 0.9rem' : '0.9rem 1.2rem',
        color: '#e0e0e0',
        fontFamily: 'monospace',
        fontSize: compact ? '12px' : '13px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        minWidth: compact ? '180px' : '230px',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
      }}>
        {/* Header — acts as toggle on mobile */}
        <div
          onClick={() => isMobile && setCollapsed(c => !c)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: collapsed ? 0 : '0.75rem',
            paddingBottom: collapsed ? 0 : '0.6rem',
            borderBottom: collapsed ? 'none' : '1px solid rgba(255,255,255,0.08)',
            cursor: isMobile ? 'pointer' : 'default',
            userSelect: 'none',
          }}>
          <span style={{ color: '#00d4ff', fontWeight: 'bold', fontSize: '11px', letterSpacing: '1px' }}>
            CONTROLS
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: inputMode === 'gamepad' ? 'rgba(93,187,99,0.15)' : 'rgba(0,212,255,0.1)',
              border: `1px solid ${inputMode === 'gamepad' ? 'rgba(93,187,99,0.4)' : 'rgba(0,212,255,0.3)'}`,
              borderRadius: '20px',
              padding: '2px 7px',
              fontSize: '10px',
              color: inputMode === 'gamepad' ? '#5dbb63' : '#00d4ff',
              transition: 'all 0.3s ease'
            }}>
              {inputMode === 'gamepad'
                ? <><Gamepad2 size={9} /> CTRL</>
                : <><span>⌨</span> KB</>
              }
            </div>
            {/* Collapse chevron on mobile */}
            {isMobile && (
              <span style={{
                color: '#666',
                fontSize: '10px',
                transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 0.25s ease',
                display: 'inline-block',
                lineHeight: 1,
              }}>▼</span>
            )}
          </div>
        </div>

        {/* Controls list — hidden when collapsed */}
        {!collapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '0.4rem' : '0.55rem' }}>
            {inputMode === 'keyboard'
              ? <KeyboardControls compact={compact} />
              : <GamepadControls compact={compact} />
            }
          </div>
        )}
      </div>

      {/* Controller hint */}
      {inputMode === 'keyboard' && !collapsed && !isMobile && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(10,10,18,0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '8px',
          padding: '5px 10px',
          fontSize: '11px',
          color: '#888',
          fontFamily: 'monospace',
          animation: 'fadeInHint 0.4s ease',
          whiteSpace: 'nowrap',
        }}>
          <Gamepad2 size={12} color="#666" />
          <span>Controller supported — plug in to switch</span>
        </div>
      )}

      {/* Controller connected notice */}
      {inputMode === 'gamepad' && controllerName && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(93,187,99,0.1)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(93,187,99,0.25)',
          borderRadius: '8px',
          padding: '5px 10px',
          fontSize: '11px',
          color: '#5dbb63',
          fontFamily: 'monospace',
          animation: 'fadeInHint 0.4s ease',
          maxWidth: isMobile ? '180px' : '220px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          <Gamepad2 size={12} />
          <span title={controllerName}>{controllerName || 'Controller connected'}</span>
        </div>
      )}

      <style>{`
        @keyframes fadeInHint {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ============================================
// World title indicator
// ============================================
export const WorldTitle = () => {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  return (
    <div style={{
      position: 'absolute',
      top: isMobile ? '1rem' : '2rem',
      left: isMobile ? '1rem' : '2rem',
      fontSize: isMobile ? '1.6rem' : '3rem',
      color: '#333',
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
      zIndex: 100,
      maxWidth: isMobile ? '55vw' : 'none', // don't overlap HUD on mobile
      lineHeight: 1.1,
    }}>
      {t('projectsGalaxy.worldTitle')}
    </div>
  )
}

// ============================================
// Path labels
// ============================================
export const PathLabels = () => {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  return (
    <div style={{
      position: 'absolute',
      top: isMobile ? '4.5rem' : '7rem',
      left: isMobile ? '1rem' : '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '0.5rem' : '1rem',
      zIndex: 100
    }}>
      <div style={{
        background: 'rgba(99, 102, 241, 0.15)',
        backdropFilter: 'blur(10px)',
        border: '2px solid #6366f1',
        borderRadius: '10px',
        padding: isMobile ? '0.4rem 0.9rem' : '0.75rem 1.5rem',
        color: '#4338ca',
        fontFamily: 'monospace',
        fontSize: isMobile ? '0.8rem' : '1.2rem',
        fontWeight: 'bold'
      }}>
        {t('projectsGalaxy.paths.software')}
      </div>
      <div style={{
        background: 'rgba(34, 211, 238, 0.15)',
        backdropFilter: 'blur(10px)',
        border: '2px solid #22d3ee',
        borderRadius: '10px',
        padding: isMobile ? '0.4rem 0.9rem' : '0.75rem 1.5rem',
        color: '#0e7490',
        fontFamily: 'monospace',
        fontSize: isMobile ? '0.8rem' : '1.2rem',
        fontWeight: 'bold'
      }}>
        {t('projectsGalaxy.paths.data')}
      </div>
    </div>
  )
}

// ============================================
// Top right control buttons (legacy, kept for compat)
// ============================================
export const TopRightControls = ({ showCameraControls, setShowCameraControls, showModelControls, setShowModelControls, setActiveModelType }) => {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  return (
    <div style={{
      position: 'absolute',
      top: isMobile ? '1rem' : '2rem',
      right: isMobile ? '1rem' : '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '0.5rem' : '1rem',
      zIndex: 100
    }}>
      <div style={{
        fontSize: isMobile ? '0.8rem' : '1rem',
        color: '#f59e0b',
        fontFamily: 'monospace',
        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
        background: 'rgba(255,255,255,0.9)',
        padding: isMobile ? '0.35rem 0.7rem' : '0.5rem 1rem',
        borderRadius: '8px',
        border: '1px solid rgba(0,0,0,0.1)'
      }}>
        {t('projectsGalaxy.topControls.clickHint')}
      </div>

      <button
        onClick={() => setShowCameraControls(!showCameraControls)}
        style={{
          fontSize: isMobile ? '0.8rem' : '1rem',
          color: '#333',
          fontFamily: 'monospace',
          background: showCameraControls ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.9)',
          border: '2px solid ' + (showCameraControls ? '#6366f1' : 'rgba(0,0,0,0.2)'),
          padding: isMobile ? '0.35rem 0.7rem' : '0.5rem 1rem',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
      >
        {t('projectsGalaxy.topControls.cameraControls')}
      </button>

      <button
        onClick={() => {
          setShowModelControls(!showModelControls)
          if (!showModelControls) setActiveModelType('robotEye')
        }}
        style={{
          fontSize: isMobile ? '0.8rem' : '1rem',
          color: '#333',
          fontFamily: 'monospace',
          background: showModelControls ? 'rgba(14,165,233,0.2)' : 'rgba(255,255,255,0.9)',
          border: '2px solid ' + (showModelControls ? '#0ea5e9' : 'rgba(0,0,0,0.2)'),
          padding: isMobile ? '0.35rem 0.7rem' : '0.5rem 1rem',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <Settings size={isMobile ? 13 : 16} />
        {t('projectsGalaxy.topControls.modelControls')}
      </button>
    </div>
  )
}

// ============================================
// Stats Info Button
// ============================================
export const StatsInfoButton = () => {
  const { t } = useTranslation()
  const [showPopup, setShowPopup] = useState(false)
  const isMobile = useIsMobile()

  return (
    <>
      <button
        onClick={() => setShowPopup(true)}
        style={{
          position: 'fixed',
          bottom: isMobile ? '1.25rem' : '2rem',
          right: isMobile ? '1.25rem' : '2rem',
          zIndex: 100,
          background: 'rgba(60, 60, 80, 0.95)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50%',
          width: isMobile ? '48px' : '56px',
          height: isMobile ? '48px' : '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(10px)',
          // Ensure it doesn't overlap bottom nav bars on iOS
          marginBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.background = 'rgba(70,70,90,0.95)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.background = 'rgba(60,60,80,0.95)'
        }}
      >
        <Info size={isMobile ? 20 : 24} color="#ffffff" />
      </button>

      {showPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'center',
            justifyContent: 'center',
            padding: isMobile ? '0' : '2rem',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setShowPopup(false)}
        >
          <div
            style={{
              background: '#1a1a24',
              border: '1px solid rgba(255,255,255,0.1)',
              // On mobile: sheet slides up from bottom; on desktop: centered modal
              borderRadius: isMobile ? '16px 16px 0 0' : '12px',
              width: isMobile ? '100%' : 'auto',
              maxWidth: isMobile ? '100%' : '950px',
              maxHeight: isMobile ? '85vh' : '90vh',
              overflow: 'auto',
              padding: isMobile ? '1.5rem 1.25rem calc(1.5rem + env(safe-area-inset-bottom, 0px))' : '2.5rem',
              position: 'relative',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              animation: isMobile ? 'slideUpSheet 0.3s ease' : 'slideUp 0.3s ease',
              // Drag handle hint on mobile
              paddingTop: isMobile ? '2rem' : '2.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag handle */}
            {isMobile && (
              <div style={{
                position: 'absolute',
                top: '0.75rem',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '40px',
                height: '4px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '2px',
              }} />
            )}

            <button
              onClick={() => setShowPopup(false)}
              style={{
                position: 'absolute',
                top: isMobile ? '1rem' : '1.5rem',
                right: isMobile ? '1rem' : '1.5rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            >
              <X size={20} color="#ffffff" />
            </button>

            <h2 style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: isMobile ? '1.4rem' : '2rem',
              color: '#ffffff',
              marginBottom: '0.5rem',
              fontWeight: '600',
              paddingRight: '2.5rem', // don't overlap close btn
            }}>
              {t('projectsGalaxy.statsInfo.title')}
            </h2>

            <p style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: isMobile ? '0.875rem' : '1rem',
              color: '#a0a0a0',
              marginBottom: '1.5rem',
              lineHeight: '1.6'
            }}>
              {t('projectsGalaxy.statsInfo.subtitle')}
              <br />
              {t('projectsGalaxy.statsInfo.scoreRange')}
            </p>

            {/* Footer Note */}
            <div style={{
              marginTop: '2rem',
              padding: isMobile ? '1rem' : '1.5rem',
              background: 'rgba(34,197,94,0.05)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '8px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              color: '#c0c0c0',
              lineHeight: '1.8',
              whiteSpace: 'pre-line'
            }}>
              <strong style={{ color: '#22c55e' }}>{t('projectsGalaxy.statsInfo.footer.title')}</strong>
              <br />
              {t('projectsGalaxy.statsInfo.footer.description')}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUpSheet {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}

// StatCard component
const StatCard = ({ title, color, subtext, criteria, maxScore }) => {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      padding: isMobile ? '1rem' : '1.5rem',
      transition: 'all 0.2s ease'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <div>
          <h3 style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: isMobile ? '1rem' : '1.25rem',
            color: color,
            margin: 0,
            fontWeight: '600'
          }}>
            {title}
          </h3>
          {subtext && (
            <div style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '0.8rem',
              color: '#888',
              marginTop: '0.25rem'
            }}>
              {subtext}
            </div>
          )}
        </div>
        <div style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '0.85rem',
          color: '#888',
          fontWeight: '500',
          whiteSpace: 'nowrap',
          marginLeft: '0.5rem',
        }}>
          {t('projectsGalaxy.statsInfo.maxScore')} {maxScore}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {criteria.map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'flex-start',
            gap: isMobile ? '0.25rem' : '1rem',
            padding: isMobile ? '0.6rem 0.75rem' : '0.75rem',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '6px',
            borderLeft: `3px solid ${color}`
          }}>
            <span style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: isMobile ? '0.85rem' : '0.9rem',
              color: '#ffffff',
              fontWeight: '500',
            }}>
              {item.label}
            </span>
            <span style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: isMobile ? '0.8rem' : '0.85rem',
              color: '#b0b0b0',
              textAlign: isMobile ? 'left' : 'right',
              lineHeight: '1.4'
            }}>
              {item.points}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}