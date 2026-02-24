export const CameraControls = ({ 
  cameraOffsetX, 
  setCameraOffsetX, 
  cameraOffsetY, 
  setCameraOffsetY, 
  cameraOffsetZ, 
  setCameraOffsetZ, 
  cameraLerpSpeed, 
  setCameraLerpSpeed 
}) => (
  <div style={{
    position: 'absolute',
    top: '12rem',
    right: '2rem',
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(99, 102, 241, 0.5)',
    borderRadius: '12px',
    padding: '1.5rem',
    color: '#333',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    zIndex: 100,
    minWidth: '300px',
    maxHeight: '70vh',
    overflowY: 'auto',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  }}>
    <div style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#6366f1', fontWeight: 'bold' }}>
      Camera Settings
    </div>

    {/* Camera Offset X */}
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b' }}>
        Offset X: {cameraOffsetX.toFixed(1)}
      </label>
      <input
        type="range"
        min="-50"
        max="50"
        step="0.5"
        value={cameraOffsetX}
        onChange={(e) => setCameraOffsetX(parseFloat(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>

    {/* Camera Offset Y */}
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b' }}>
        Offset Y: {cameraOffsetY.toFixed(1)}
      </label>
      <input
        type="range"
        min="0"
        max="50"
        step="0.5"
        value={cameraOffsetY}
        onChange={(e) => setCameraOffsetY(parseFloat(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>

    {/* Camera Offset Z */}
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b' }}>
        Offset Z: {cameraOffsetZ.toFixed(1)}
      </label>
      <input
        type="range"
        min="-50"
        max="50"
        step="0.5"
        value={cameraOffsetZ}
        onChange={(e) => setCameraOffsetZ(parseFloat(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>

    {/* Camera Lerp Speed */}
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b' }}>
        Smoothness: {cameraLerpSpeed.toFixed(3)}
      </label>
      <input
        type="range"
        min="0.01"
        max="0.3"
        step="0.01"
        value={cameraLerpSpeed}
        onChange={(e) => setCameraLerpSpeed(parseFloat(e.target.value))}
        style={{ width: '100%' }}
      />
      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
        Lower = smoother, Higher = faster
      </div>
    </div>

    {/* Reset Button */}
    <button
      onClick={() => {
        setCameraOffsetX(0)
        setCameraOffsetY(35)
        setCameraOffsetZ(45)
        setCameraLerpSpeed(0.08)
      }}
      style={{
        marginTop: '1rem',
        width: '100%',
        padding: '0.5rem',
        background: 'rgba(251, 191, 36, 0.2)',
        border: '1px solid rgba(251, 191, 36, 0.5)',
        borderRadius: '6px',
        color: '#f59e0b',
        cursor: 'pointer',
        fontFamily: 'monospace',
        fontSize: '0.9rem'
      }}
    >
      Reset to Default
    </button>
  </div>
)