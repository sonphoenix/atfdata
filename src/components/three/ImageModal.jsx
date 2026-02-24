import { useEffect } from 'react'

export const ImageModal = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!images || images.length === 0) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.95)',
      backdropFilter: 'blur(10px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'imageModalFadeIn 0.3s ease-out'
    }}>
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          border: '3px solid #000',
          padding: '0.8rem 1.5rem',
          fontFamily: '"Bebas Neue", sans-serif',
          fontSize: '1.5rem',
          color: '#000',
          letterSpacing: '2px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
          transition: 'all 0.2s ease',
          zIndex: 2001
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.6)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.4)'
        }}
      >
        ✕ CLOSE
      </button>

      {/* Image counter */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,0,0.9) 100%)',
        border: '3px solid #FFD700',
        padding: '0.8rem 2rem',
        fontFamily: '"Bebas Neue", sans-serif',
        fontSize: '1.5rem',
        color: '#FFD700',
        letterSpacing: '2px',
        boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)'
      }}>
        {currentIndex + 1} / {images.length}
      </div>

      {/* Previous button */}
      {images.length > 1 && (
        <button
          onClick={onPrev}
          style={{
            position: 'absolute',
            left: '2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'linear-gradient(135deg, rgba(255,215,0,0.9) 0%, rgba(255,165,0,0.9) 100%)',
            border: '3px solid #000',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: '2rem',
            color: '#000',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.4)'
          }}
        >
          ←
        </button>
      )}

      {/* Main image */}
      <img
        src={images[currentIndex]}
        alt={`Project screenshot ${currentIndex + 1}`}
        style={{
          maxWidth: '85%',
          maxHeight: '85%',
          objectFit: 'contain',
          border: '4px solid #FFD700',
          boxShadow: '0 0 40px rgba(255, 215, 0, 0.5)',
          animation: 'imageZoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      />

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={onNext}
          style={{
            position: 'absolute',
            right: '2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'linear-gradient(135deg, rgba(255,215,0,0.9) 0%, rgba(255,165,0,0.9) 100%)',
            border: '3px solid #000',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: '2rem',
            color: '#000',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.4)'
          }}
        >
          →
        </button>
      )}
    </div>
  )
}
