export const ImagePreviewBlocks = ({ imageUrls, onImageClick, animateOut }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0.5rem',
      animation: animateOut ? 'imageBlocksFadeOut 0.4s ease-out forwards' : 'imageBlocksSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s forwards',
      opacity: 0
    }}>
      {imageUrls.map((url, index) => (
        <div
          key={index}
          onClick={() => onImageClick(index)}
          className="image-preview-block"
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '3px solid #FFD700',
            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            position: 'relative',
            background: 'rgba(0,0,0,0.5)',
            animation: `imageBlockPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${1.3 + index * 0.1}s forwards`,
            transform: 'scale(0)'
          }}
        >
          <img
            src={url}
            alt={`Preview ${index + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.parentElement.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #FFD700; font-size: 2rem;">📷</div>'
            }}
          />
          {/* Hover overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,215,0,0) 0%, rgba(255,215,0,0.3) 100%)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Bebas Neue", sans-serif',
            color: '#FFF',
            fontSize: '1.5rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
          }}
          className="image-preview-overlay">
            🔍
          </div>
        </div>
      ))}
    </div>
  )
}
