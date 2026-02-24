export const TechStack = ({ tech, animateOut }) => {
  return (
    <div style={{
      paddingTop: '5px',
      animation: animateOut ? 'slideOutBottom 0.5s ease-out forwards' : 'slideInUp 0.6s ease-out 0.9s forwards',
      opacity: 0
    }}>
      {/* TECH STACK Label and Line */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '0.8rem'
      }}>
        <div style={{
          fontFamily: '"Bebas Neue", sans-serif',
          fontSize: '2rem',
          color: '#FFD700',
          letterSpacing: '2px',
          marginRight: '1.5rem',
          textShadow: '2px 2px 0 #000, 0 0 20px rgba(255, 215, 0, 0.5)',
          whiteSpace: 'nowrap'
        }}>
          TECH STACK
        </div>
        <div style={{
          flex: 1,
          height: '3px',
          background: 'linear-gradient(90deg, #FFD700 0%, rgba(255,215,0,0.3) 100%)',
          boxShadow: '0 0 10px rgba(255, 215, 0, 0.4)'
        }} />
      </div>

      {/* Tech Items - Vertical Scrollable Grid */}
      <div 
        className="tech-stack-container"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '0.8rem',
          maxHeight: '100px',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: '0.5rem',
          scrollbarWidth: 'thin',
          scrollbarColor: '#FFD700 rgba(0,0,0,0.3)'
        }}
      >
        {tech.map((techItem, i) => (
          <div
            key={i}
            className="tech-stack-item"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              border: '3px solid #000',
              padding: '0.6rem 1rem',
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: '1.1rem',
              color: '#000',
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '3px 3px 0 rgba(184, 134, 11, 0.6), 0 0 15px rgba(255, 215, 0, 0.3)',
              transform: 'skewX(-3deg)',
              animation: animateOut ? `techFadeOut 0.2s ease-out ${i * 0.03}s forwards` : `techSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${1.0 + i * 0.05}s forwards`,
              opacity: 0,
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}
          >
            <span style={{ display: 'inline-block', transform: 'skewX(3deg)' }}>
              {techItem}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
