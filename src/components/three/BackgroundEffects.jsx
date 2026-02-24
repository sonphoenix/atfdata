import { useMemo } from 'react'

export const BackgroundEffects = ({ animateIn, animateOut }) => {
  // Memoize the line configurations so they don't recalculate on every render
  const backgroundLines = useMemo(() => {
    return [...Array(25)].map((_, i) => ({
      left: `${i * 4}%`,
      duration: 2 + Math.random() * 2,
      delay: i * 0.1
    }))
  }, [])

  // Memoize sparkles configuration
  const sparkles = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: 0.45 + i * 0.02,
      translateX1: Math.random() * 100 - 50,
      translateY1: Math.random() * 100 - 50,
      translateX2: Math.random() * 200 - 100,
      translateY2: Math.random() * 200 - 100
    }))
  }, [])

  return (
    <>
      {/* PERSONA 5 STYLE - Red Flash Overlay on Entry */}
      {animateIn && !animateOut && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle, rgba(255,0,0,0.3) 0%, transparent 70%)',
          animation: 'redFlash 0.5s ease-out forwards',
          pointerEvents: 'none',
          zIndex: 200
        }} />
      )}

      {/* PERSONA 5 STYLE - Diagonal Wipe Reveal */}
      {animateIn && !animateOut && (
        <>
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '200%',
            height: '100%',
            background: 'linear-gradient(45deg, transparent 48%, #FFD700 49%, #FFD700 51%, transparent 52%)',
            animation: 'diagonalWipe 0.8s cubic-bezier(0.87, 0, 0.13, 1) forwards',
            pointerEvents: 'none',
            zIndex: 150
          }} />
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '200%',
            height: '100%',
            background: 'linear-gradient(45deg, transparent 48%, #000 49%, #000 51%, transparent 52%)',
            animation: 'diagonalWipe 0.9s cubic-bezier(0.87, 0, 0.13, 1) 0.1s forwards',
            pointerEvents: 'none',
            zIndex: 149
          }} />
        </>
      )}

      {/* EPIC CLOSE ANIMATIONS - 4 STAGE SEQUENCE */}
      {animateOut && (
        <>
          {/* Stage 1: Flash overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at center, rgba(255,215,0,0) 0%, transparent 100%)',
            animation: 'closeFlash 0.3s ease-out 0.1s forwards',
            pointerEvents: 'none',
            zIndex: 250
          }} />
          
          {/* Stage 1: Yellow pulse rings */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at center, rgba(255,215,0,0) 0%, transparent 100%)',
            animation: 'closePulse 0.5s ease-out 0.2s 2',
            pointerEvents: 'none',
            zIndex: 251
          }} />
          
          {/* Stage 2: Enhanced Diagonal Wipes */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: '-100%',
            width: '200%',
            height: '100%',
            background: 'linear-gradient(-45deg, transparent 40%, #FFD700 45%, #FFA500 50%, #FFD700 55%, transparent 60%)',
            animation: 'diagonalWipeOut 0.5s cubic-bezier(0.87, 0, 0.13, 1) 0.2s forwards',
            pointerEvents: 'none',
            zIndex: 150,
            willChange: 'right, opacity',
            filter: 'blur(1px)'
          }} />
          
          <div style={{
            position: 'absolute',
            top: 0,
            right: '-100%',
            width: '200%',
            height: '100%',
            background: 'linear-gradient(-45deg, transparent 42%, #000 47%, #222 52%, #000 57%, transparent 62%)',
            animation: 'diagonalWipeOut 0.6s cubic-bezier(0.87, 0, 0.13, 1) 0.25s forwards',
            pointerEvents: 'none',
            zIndex: 151,
            willChange: 'right, opacity'
          }} />
          
          {/* Stage 2: Glitch effect overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(255,215,0,0.1) 0%, rgba(255,165,0,0.2) 50%, transparent 100%)',
            animation: 'closeGlitchOut 0.4s ease-out 0.25s forwards',
            pointerEvents: 'none',
            zIndex: 252,
            mixBlendMode: 'overlay'
          }} />
          
          {/* Stage 3: Implosion effect */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(1)',
            width: '90%',
            height: '90%',
            border: '4px solid rgba(255,215,0,0.7)',
            borderRadius: '20px',
            animation: 'closeImplode 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) 0.35s forwards',
            pointerEvents: 'none',
            zIndex: 253,
            boxShadow: '0 0 80px rgba(255,215,0,0.5), inset 0 0 60px rgba(255,215,0,0.3)'
          }} />
          
          {/* Stage 3: Screen shake effect wrapper */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            animation: 'closeShake 0.4s ease-out 0.35s',
            pointerEvents: 'none',
            zIndex: 254
          }} />
          
          {/* Stage 4: Final dramatic black fade */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)',
            animation: 'closeFadeToBlack 0.5s ease-out 0.45s forwards',
            pointerEvents: 'none',
            zIndex: 300
          }} />
          
          {/* Stage 4: Final particle-like sparkles */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 301,
            opacity: 0
          }}>
            {sparkles.map((sparkle, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: sparkle.top,
                  left: sparkle.left,
                  width: '4px',
                  height: '4px',
                  background: '#FFD700',
                  borderRadius: '50%',
                  animation: `sparkleOut-${i} 0.5s ease-out ${sparkle.delay}s forwards`,
                  boxShadow: '0 0 10px #FFD700'
                }}
              />
            ))}
            <style>{`
              ${sparkles.map((sparkle, i) => `
                @keyframes sparkleOut-${i} {
                  0% {
                    opacity: 0;
                    transform: translate(0, 0) scale(0);
                  }
                  20% {
                    opacity: 1;
                    transform: translate(${sparkle.translateX1}px, ${sparkle.translateY1}px) scale(1);
                  }
                  100% {
                    opacity: 0;
                    transform: translate(${sparkle.translateX2}px, ${sparkle.translateY2}px) scale(0);
                  }
                }
              `).join('\n')}
            `}</style>
          </div>
        </>
      )}

      {/* Animated background lines - FULL SCREEN */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: 0.15,
        animation: animateOut ? 'fadeOutFast 0.4s ease-out forwards' : 'fadeIn 0.8s ease-out 0.3s forwards'
      }}>
        {backgroundLines.map((line, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: line.left,
              top: 0,
              bottom: 0,
              width: '2px',
              background: 'linear-gradient(to bottom, transparent, #FFD700 20%, #FFA500 50%, #FFD700 80%, transparent 100%)',
              animation: `slideDown ${line.duration}s ease-in-out ${line.delay}s infinite`
            }}
          />
        ))}
      </div>

      {/* YELLOW DIAGONAL ACCENT - TOP LEFT */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '500px',
        height: '10px',
        background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 50%, transparent 100%)',
        transform: 'skewX(-45deg)',
        transformOrigin: 'top left',
        zIndex: 10,
        boxShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
        animation: animateOut ? 'slideOutTopLeft 0.5s ease-out forwards' : 'slideInTopLeft 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards',
        opacity: 0
      }} />

      {/* YELLOW DIAGONAL ACCENT - BOTTOM RIGHT */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: '500px',
        height: '10px',
        background: 'linear-gradient(270deg, #FFD700 0%, #FFA500 50%, transparent 100%)',
        transform: 'skewX(-45deg)',
        transformOrigin: 'bottom right',
        zIndex: 10,
        boxShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
        animation: animateOut ? 'slideOutBottomRight 0.5s ease-out forwards' : 'slideInBottomRight 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s forwards',
        opacity: 0
      }} />

      {/* CORNER DIAGONALS */}
      <div style={{
        position: 'absolute',
        top: '100px',
        left: 0,
        width: '300px',
        height: '5px',
        background: 'linear-gradient(90deg, rgba(255,215,0,0.5) 0%, rgba(255,165,0,0.3) 50%, transparent 100%)',
        transform: 'skewX(-45deg)',
        transformOrigin: 'top left',
        zIndex: 9,
        animation: animateOut ? 'fadeOutFast 0.3s ease-out forwards' : 'slideInLeft 0.5s ease-out 0.5s forwards',
        opacity: 0
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '100px',
        right: 0,
        width: '300px',
        height: '5px',
        background: 'linear-gradient(270deg, rgba(255,215,0,0.5) 0%, rgba(255,165,0,0.3) 50%, transparent 100%)',
        transform: 'skewX(-45deg)',
        transformOrigin: 'bottom right',
        zIndex: 9,
        animation: animateOut ? 'fadeOutFast 0.3s ease-out forwards' : 'slideInRight 0.5s ease-out 0.6s forwards',
        opacity: 0
      }} />
    </>
  )
}