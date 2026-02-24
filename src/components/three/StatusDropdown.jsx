export const StatusDropdown = ({ showActions, setShowActions, animateOut, github, live, playStore, selectedActionIndex }) => {
  const actions = [
    github    && { key: 'github',    label: 'SOURCE CODE', icon: '<>',  color: '#FFD700', hoverBg: 'rgba(255,215,0,0.1)',  borderColor: 'rgba(255,215,0,0.2)',  href: github    },
    live      && { key: 'live',      label: 'LIVE DEMO',   icon: '🚀', color: '#00ff88', hoverBg: 'rgba(0,255,136,0.1)', borderColor: 'rgba(0,255,136,0.2)', href: live      },
    playStore && { key: 'playStore', label: 'GET APP',     icon: '📱', color: '#01ff70', hoverBg: 'rgba(1,255,112,0.1)', borderColor: 'transparent',          href: playStore },
  ].filter(Boolean)

  return (
    <div style={{ position: 'relative', zIndex: 99999, pointerEvents: 'none' }}>
      {/* STATUS BUTTON */}
      <div
        role="button" tabIndex={0}
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,0,0.9) 100%)',
          border: '3px solid #FFD700', padding: '12px 24px',
          fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.8rem',
          color: '#FFD700', letterSpacing: '4px',
          boxShadow: '0 4px 15px rgba(255,215,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          transform: 'skewX(-5deg)',
          animation: animateOut ? '' : 'statusBlink 0.15s ease-out 3 0.7s',
          cursor: 'pointer', transition: 'all 0.2s ease',
          position: 'relative', pointerEvents: 'auto'
        }}
        onClick={(e) => {
          e.stopPropagation()
          if (!animateOut) setShowActions(prev => !prev)
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px', transform: 'skewX(5deg)' }}>
          STATUS
          <span style={{ fontSize: '1.5rem', transition: 'transform 0.3s ease', transform: showActions ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
        </span>
      </div>

      {/* DROPDOWN */}
      <div
        style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.98) 0%, rgba(20,20,0,0.95) 100%)',
          border: '3px solid #FFD700', minWidth: '220px',
          boxShadow: '0 8px 30px rgba(255,215,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          overflow: 'hidden',
          opacity:     showActions && !animateOut ? 1 : 0,
          pointerEvents: showActions && !animateOut ? 'auto' : 'none',
          transform:   showActions && !animateOut ? 'translateY(0)' : 'translateY(-10px)',
          transition:  'opacity 0.3s ease, transform 0.3s ease',
          visibility:  showActions && !animateOut ? 'visible' : 'hidden',
          zIndex: 1
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
          padding: '0.5rem 1rem', fontFamily: '"Bebas Neue", sans-serif',
          fontSize: '1.2rem', color: '#000', letterSpacing: '2px', borderBottom: '2px solid #000'
        }}>
          {'→ ACTIONS'}
        </div>

        {/* Links */}
        <div style={{ padding: '0.3rem 0' }}>
          {actions.map((action, i) => {
            const isSelected = selectedActionIndex === i
            return (
              <a
                key={action.key}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.8rem',
                  color: action.color,
                  padding: '0.7rem 1rem',
                  paddingLeft: isSelected ? '2rem' : '1rem',
                  textDecoration: 'none', fontSize: '1.1rem',
                  fontFamily: '"Rajdhani", sans-serif', fontWeight: 'bold',
                  letterSpacing: '0.5px',
                  borderBottom: i < actions.length - 1 ? `1px solid ${action.borderColor}` : 'none',
                  transition: 'all 0.15s ease',
                  background: isSelected ? action.hoverBg : 'transparent',
                  cursor: 'pointer', position: 'relative',
                  boxShadow: isSelected ? 'inset 4px 0 0 #FFD700' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) { e.currentTarget.style.background = action.hoverBg; e.currentTarget.style.paddingLeft = '2rem' }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.paddingLeft = '1rem' }
                }}
              >
                {isSelected && (
                  <span style={{ position: 'absolute', left: '0.4rem', fontSize: '0.8rem', color: '#FFD700', animation: 'blink 0.7s step-end infinite' }}>▶</span>
                )}
                <span style={{ fontSize: '1.3rem', width: '24px', textAlign: 'center' }}>{action.icon}</span>
                <span>{action.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: '1rem' }}>{'→'}</span>
              </a>
            )
          })}
        </div>

        {/* Footer hint */}
        <div style={{ padding: '0.4rem 1rem', borderTop: '1px solid rgba(255,215,0,0.15)' }}>
          <span style={{ fontSize: '0.75rem', color: '#555', fontFamily: '"Rajdhani", sans-serif' }}>
            ↑↓ Navigate &nbsp;·&nbsp; A Confirm &nbsp;·&nbsp; Y Close
          </span>
        </div>

        <div style={{ height: '3px', background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 50%, transparent 100%)', boxShadow: '0 0 10px rgba(255,215,0,0.5)' }} />
      </div>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </div>
  )
}