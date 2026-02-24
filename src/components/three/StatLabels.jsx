// StatLabels.jsx
import { STAT_CONFIG } from '../utils/constants'
import { calculateStatPosition } from '../utils/calculations'
import { getStatSubLabel } from '../utils/statsCalculator'

export const StatLabels = ({ projectStats, animateOut, showActions }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '500px',
      height: '500px',
      pointerEvents: 'auto',
      zIndex: 100
    }}>
      {STAT_CONFIG.map((stat, i) => {
        const value = projectStats[stat.key] || 70
        const subLabel = getStatSubLabel(stat.key, value)
        const position = calculateStatPosition(stat.angle, value, 100)
        
        return (
          <div key={i}>
            <div
              style={{
                position: 'absolute',
                ...position,
                zIndex: 100,
                pointerEvents: 'auto',
                animation: animateOut ? `statFadeOut 0.3s ease-out ${i * 0.05}s forwards` : `statPopIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${1.5 + i * 0.1}s forwards`,
                opacity: 0,
                transform: 'translate(-50%, -50%) scale(0)'
              }}
            >
              <div 
                className="stat-label-box"
                style={{
                background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
                border: '3px solid #000',
                padding: '0.6rem 1.2rem',
                borderRadius: '6px',
                boxShadow: `
                  3px 3px 0px rgba(184, 134, 11, 0.5),
                  0 0 15px ${stat.color}80
                `,
                position: 'relative',
                transform: 'skewX(-3deg)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
              >
                <div style={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#000',
                  fontFamily: '"Rajdhani", sans-serif',
                  textShadow: '1px 1px 0px rgba(255, 255, 255, 0.3)',
                  whiteSpace: 'nowrap',
                  transform: 'skewX(3deg)'
                }}>
                  {stat.label}
                </div>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  background: 'linear-gradient(135deg, #000 0%, #333 100%)',
                  color: stat.color,
                  border: `2px solid ${stat.color}`,
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  fontFamily: '"Bebas Neue", sans-serif',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                  {value}
                </div>
              </div>
              
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                left: '50%',
                transform: 'translateX(-50%)',
                color: stat.color,
                fontSize: '0.9rem',
                fontFamily: '"Rajdhani", sans-serif',
                fontWeight: 'bold',
                textShadow: `2px 2px 4px rgba(0,0,0,0.8), 0 0 10px ${stat.color}80`,
                background: 'rgba(0,0,0,0.7)',
                padding: '0.4rem 1rem',
                borderRadius: '4px',
                border: `2px solid ${stat.color}80`,
                maxWidth: '160px',
                textAlign: 'center',
                animation: 'textGlow 2s infinite alternate',
                pointerEvents: 'none',
                whiteSpace: 'nowrap'
              }}>
                {subLabel}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}