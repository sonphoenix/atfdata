import { useState, useEffect, useRef } from 'react'

const PortalTransition = ({ isActive, onComplete }) => {
  const [phase, setPhase] = useState('idle') // idle, startup, vortex, implosion, flash, tunnel, complete
  const audioContextRef = useRef(null)
  
  // Sound effects - simple beeps for portal
  const playPortalSound = (frequency, duration, type = 'sine') => {
    if (!window.AudioContext) return
    
    try {
      const audioContext = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)()
      audioContextRef.current = audioContext
      
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = type
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    } catch (e) {
      //console.log('Audio not supported')
    }
  }

  useEffect(() => {
    if (isActive && phase === 'idle') {
      // Start portal sequence
      setPhase('startup')
      
      // SEQUENCE TIMELINE:
      // 0.0s - Startup: Glitch effect and particles appear
      // 0.8s - Vortex: Portal opens, energy vortex forms
      // 1.8s - Implosion: Everything gets sucked in
      // 2.1s - Flash: Intense white flash
      // 2.3s - Tunnel: Warp tunnel effect
      // 3.5s - Complete: Transition finished
      
      // Phase 1: Startup (0-0.8s) - Glitch effect and particles appear
      setTimeout(() => {
        setPhase('vortex')
        playPortalSound(440, 0.8, 'sawtooth')
      }, 800)
      
      // Phase 2: Vortex (0.8-1.8s) - Portal energy vortex forms
      setTimeout(() => {
        setPhase('implosion')
        playPortalSound(880, 0.3, 'square')
      }, 1800)
      
      // Phase 3: Implosion (1.8-2.1s) - Everything gets sucked into portal
      setTimeout(() => {
        setPhase('flash')
        playPortalSound(1760, 0.2, 'sine')
      }, 2100)
      
      // Phase 4: Flash (2.1-2.3s) - Intense white flash
      setTimeout(() => {
        setPhase('tunnel')
        playPortalSound(220, 1.2, 'triangle')
      }, 2300)
      
      // Phase 5: Tunnel (2.3-3.5s) - Warp tunnel effect
      setTimeout(() => {
        setPhase('complete')
        if (onComplete) onComplete()
      }, 3500)
      
      // Play initial sound
      setTimeout(() => {
        playPortalSound(220, 0.8, 'sine')
      }, 100)
    }
    
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [isActive, phase, onComplete])

  if (!isActive && phase === 'idle') return null

  return (
    <>
      {/* Base overlay for all phases */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#000',
          zIndex: 9998,
          pointerEvents: 'none'
        }}
      />

      {/* Phase 1: Startup - Glitch effect and particles */}
      {(phase === 'startup' || phase === 'vortex' || phase === 'implosion') && (
        <>
          {/* Glitch distortion effect */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 50% 50%, rgba(0,255,255,0.1) 0%, transparent 60%)',
              zIndex: 10000,
              animation: phase === 'startup' ? 'glitchDistortion 0.8s ease-out forwards' : 'none',
              pointerEvents: 'none'
            }}
          />
          
          {/* Static noise layer */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              opacity: 0.1,
              zIndex: 10001,
              animation: phase === 'startup' ? 'staticNoise 0.8s infinite linear' : 'none',
              pointerEvents: 'none'
            }}
          />
        </>
      )}

      {/* Phase 2 & 3: Vortex & Implosion - Portal energy effect */}
      {(phase === 'vortex' || phase === 'implosion') && (
        <>
          {/* Portal Core */}
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: phase === 'vortex' ? '200px' : '800px',
              height: phase === 'vortex' ? '200px' : '800px',
              background: 'radial-gradient(circle, #00ffff 0%, #0080ff 30%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(40px)',
              zIndex: 10002,
              animation: phase === 'vortex' ? 'vortexPulse 1s infinite alternate' : 'implosionSuck 0.3s ease-in forwards',
              pointerEvents: 'none',
              boxShadow: `
                0 0 200px rgba(0, 255, 255, 0.8),
                0 0 400px rgba(0, 128, 255, 0.6),
                0 0 600px rgba(0, 64, 255, 0.4)
              `
            }}
          />
          
          {/* Energy rings */}
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '600px',
              height: '600px',
              border: '2px solid rgba(0, 255, 255, 0.6)',
              borderRadius: '50%',
              zIndex: 10001,
              animation: phase === 'vortex' ? 'energyRingSpin 2s infinite linear' : 'none',
              pointerEvents: 'none'
            }}
          />
          
          {/* Suction particles - only during implosion */}
          {phase === 'implosion' && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 10003,
                pointerEvents: 'none'
              }}
            >
              {[...Array(100)].map((_, i) => {
                const angle = Math.random() * Math.PI * 2
                const distance = 400 + Math.random() * 800
                const delay = Math.random() * 0.3
                
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '2px',
                      height: '2px',
                      background: '#00ffff',
                      borderRadius: '50%',
                      transform: `translate(-50%, -50%) translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`,
                      animation: `particleSuck 0.3s ease-in ${delay}s forwards`,
                      pointerEvents: 'none',
                      boxShadow: '0 0 10px rgba(0, 255, 255, 0.8)'
                    }}
                  />
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Phase 4: Flash - Intense white flash */}
      {(phase === 'flash' || phase === 'tunnel' || phase === 'complete') && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: phase === 'flash' 
              ? 'radial-gradient(circle, #ffffff 0%, #ffffff 40%, #00ffff 100%)' 
              : phase === 'tunnel'
              ? 'radial-gradient(circle, #000 0%, #111 30%, #222 60%, #333 100%)'
              : '#000',
            zIndex: 10004,
            animation: phase === 'flash' ? 'intenseFlash 0.2s ease-out forwards' : 'none',
            pointerEvents: 'none',
            opacity: phase === 'flash' ? 0 : 1
          }}
        />
      )}

      {/* Phase 5: Tunnel - Warp tunnel effect */}
      {phase === 'tunnel' && (
        <>
          {/* Tunnel walls */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle, transparent 0%, transparent 30%, rgba(0, 100, 255, 0.3) 50%, rgba(0, 50, 200, 0.6) 100%)',
              zIndex: 10005,
              animation: 'tunnelZoom 1.2s linear forwards',
              pointerEvents: 'none'
            }}
          />
          
          {/* Warp lines */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10006,
              pointerEvents: 'none',
              overflow: 'hidden'
            }}
          >
            {[...Array(36)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '2px',
                  height: '200vh',
                  background: 'linear-gradient(to bottom, transparent, #00ffff, transparent)',
                  transform: `translate(-50%, -50%) rotate(${i * 10}deg)`,
                  transformOrigin: 'center',
                  animation: `warpLine 1.2s linear ${i * 0.01}s infinite`,
                  pointerEvents: 'none',
                  filter: 'blur(1px)'
                }}
              />
            ))}
          </div>
          
          {/* Streaking stars */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10007,
              pointerEvents: 'none'
            }}
          >
            {[...Array(50)].map((_, i) => {
              const angle = Math.random() * Math.PI * 2
              const distance = 100 + Math.random() * 400
              const speed = 0.5 + Math.random() * 1.5
              const size = 2 + Math.random() * 4
              
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: `${size}px`,
                    height: `${size * 10}px`,
                    background: 'linear-gradient(to bottom, transparent, #ffffff, transparent)',
                    transform: `translate(-50%, -50%) rotate(${angle}rad) translateY(${distance}px)`,
                    transformOrigin: 'center',
                    animation: `starStreak 1.2s linear ${Math.random() * 0.3}s infinite`,
                    pointerEvents: 'none',
                    opacity: 0.7
                  }}
                />
              )
            })}
          </div>
        </>
      )}

      {/* CRT scanline effect for retro vibe */}
      {(phase === 'startup' || phase === 'vortex') && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(0deg, transparent 50%, rgba(0, 255, 255, 0.05) 50%)',
            backgroundSize: '100% 4px',
            zIndex: 10008,
            pointerEvents: 'none',
            opacity: 0.3
          }}
        />
      )}

      <style>{`
        @keyframes glitchDistortion {
          0% {
            opacity: 0;
            filter: hue-rotate(0deg) blur(0px);
            transform: scale(1);
          }
          20% {
            opacity: 0.3;
            filter: hue-rotate(90deg) blur(2px);
            transform: scale(1.01) translateX(-5px);
          }
          40% {
            filter: hue-rotate(180deg) blur(1px);
            transform: scale(0.99) translateX(5px);
          }
          60% {
            filter: hue-rotate(270deg) blur(3px);
            transform: scale(1.02) translateX(-3px);
          }
          80% {
            filter: hue-rotate(360deg) blur(1px);
            transform: scale(1) translateX(2px);
          }
          100% {
            opacity: 1;
            filter: hue-rotate(0deg) blur(0px);
            transform: scale(1);
          }
        }

        @keyframes staticNoise {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }

        @keyframes vortexPulse {
          0% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1);
            filter: blur(40px) brightness(1);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.2);
            filter: blur(30px) brightness(2);
          }
        }

        @keyframes energyRingSpin {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) scale(1);
            opacity: 0.8;
            border-width: 2px;
          }
          50% {
            transform: translate(-50%, -50%) rotate(180deg) scale(1.2);
            opacity: 1;
            border-width: 3px;
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) scale(1);
            opacity: 0.8;
            border-width: 2px;
          }
        }

        @keyframes implosionSuck {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
            filter: blur(30px);
          }
          70% {
            transform: translate(-50%, -50%) scale(5);
            opacity: 0.9;
            filter: blur(50px);
          }
          100% {
            transform: translate(-50%, -50%) scale(0.1);
            opacity: 0;
            filter: blur(100px);
          }
        }

        @keyframes particleSuck {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(var(--x), var(--y)) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(0, 0) scale(0);
          }
        }

        @keyframes intenseFlash {
          0% {
            opacity: 0;
            transform: scale(0.8);
            filter: brightness(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
            filter: brightness(3);
          }
          100% {
            opacity: 0;
            transform: scale(1);
            filter: brightness(1);
          }
        }

        @keyframes tunnelZoom {
          0% {
            transform: scale(0.1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: scale(10);
            opacity: 0;
          }
        }

        @keyframes warpLine {
          0% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-100vh);
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(100vh);
          }
        }

        @keyframes starStreak {
          0% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(var(--start)) scaleX(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(var(--end)) scaleX(3);
            opacity: 0;
          }
        }

        /* Screen shake for impact */
        @keyframes screenShake {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-5px, -5px); }
          20%, 40%, 60%, 80% { transform: translate(5px, 5px); }
        }

        body {
          animation: ${phase === 'flash' ? 'screenShake 0.2s linear' : 'none'};
        }
      `}</style>
    </>
  )
}

export default PortalTransition