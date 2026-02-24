export const ModelControls = ({
  activeModelType,
  setActiveModelType,
  getActiveModelSettings,
  updateActiveModelPosition,
  updateActiveModelRotation,
  updateActiveModelScale,
  updateActiveModelAutoRotate,
  resetActiveModelSettings
}) => (
  <div style={{
    position: 'absolute',
    top: '12rem',
    right: '2rem',
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(14, 165, 233, 0.5)',
    borderRadius: '12px',
    padding: '1.5rem',
    color: '#333',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    zIndex: 100,
    minWidth: '320px',
    maxHeight: '70vh',
    overflowY: 'auto',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  }}>
    <div style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#0ea5e9', fontWeight: 'bold' }}>
      3D Model Controls
    </div>

    {/* Model Type Selection */}
    <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
      <div style={{ marginBottom: '0.75rem', color: '#0e7490', fontWeight: 'bold' }}>Select Model</div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'cameraTape', label: '📷 Camera' },
          { id: 'robotEye', label: '🤖 Robot Eye' },
          { id: 'microPhone', label: '🎤 Microphone' },
          { id: 'pool', label: '🏊 Pool' }
        ].map(model => (
          <button
            key={model.id}
            onClick={() => setActiveModelType(model.id)}
            style={{
              padding: '0.5rem 1rem',
              background: activeModelType === model.id ? 'rgba(99, 102, 241, 0.3)' : 'rgba(0,0,0,0.05)',
              border: '1px solid ' + (activeModelType === model.id ? '#6366f1' : 'rgba(0,0,0,0.2)'),
              borderRadius: '6px',
              color: '#333',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '0.8rem'
            }}
          >
            {model.label}
          </button>
        ))}
      </div>
    </div>

    <div style={{ 
      marginBottom: '1.5rem', 
      paddingBottom: '1rem', 
      borderBottom: '1px solid rgba(0,0,0,0.1)'
    }}>
      <div style={{ marginBottom: '0.75rem', color: '#0e7490', fontWeight: 'bold' }}>
        {activeModelType === 'cameraTape' ? '📷 Camera' : 
         activeModelType === 'robotEye' ? '🤖 Robot Eye' : 
         activeModelType === 'microPhone' ? '🎤 Microphone' : '🏊 Pool'} Settings
      </div>

      {/* Position Controls */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ marginBottom: '0.5rem', color: '#64748b', fontWeight: 'bold' }}>Position</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
          {['X', 'Y', 'Z'].map((axis, idx) => (
            <div key={axis}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', color: '#64748b' }}>
                {axis}: {getActiveModelSettings().position[idx].toFixed(1)}
              </label>
              <input
                type="range"
                min={idx === 1 ? "0" : "-5"}
                max={idx === 1 ? "10" : "5"}
                step="0.1"
                value={getActiveModelSettings().position[idx]}
                onChange={(e) => updateActiveModelPosition(idx, e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Rotation Controls */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ marginBottom: '0.5rem', color: '#64748b', fontWeight: 'bold' }}>Rotation (radians)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
          {['X', 'Y', 'Z'].map((axis, idx) => (
            <div key={axis}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', color: '#64748b' }}>
                {axis}: {getActiveModelSettings().rotation[idx].toFixed(2)}
              </label>
              <input
                type="range"
                min="-3.14"
                max="3.14"
                step="0.1"
                value={getActiveModelSettings().rotation[idx]}
                onChange={(e) => updateActiveModelRotation(idx, e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Scale Control */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b' }}>
          Scale: {getActiveModelSettings().scale[0].toFixed(3)}x
        </label>
        <input
          type="range"
          min={activeModelType === 'pool' ? '0.01' : '1'}
          max={activeModelType === 'pool' ? '0.05' : '20'}
          step={activeModelType === 'pool' ? '0.001' : '0.5'}
          value={getActiveModelSettings().scale[0]}
          onChange={(e) => updateActiveModelScale(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      {/* Auto Rotate Toggle */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={getActiveModelSettings().autoRotate}
            onChange={(e) => updateActiveModelAutoRotate(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ color: '#64748b' }}>Auto-rotate</span>
        </label>
      </div>
    </div>

    {/* Current Values Display */}
    <div style={{
      marginTop: '1rem',
      padding: '0.75rem',
      background: 'rgba(14, 165, 233, 0.1)',
      borderRadius: '8px',
      fontSize: '0.75rem',
      color: '#0e7490'
    }}>
      <div>Model: {activeModelType === 'cameraTape' ? '📷 Camera' :
                          activeModelType === 'robotEye' ? '🤖 Robot Eye' : 
                          activeModelType === 'microPhone' ? '🎤 Microphone' : '🏊 Pool'}</div>
      <div>Position: ({getActiveModelSettings().position[0].toFixed(2)}, {getActiveModelSettings().position[1].toFixed(2)}, {getActiveModelSettings().position[2].toFixed(2)})</div>
      <div>Rotation: ({getActiveModelSettings().rotation[0].toFixed(2)}, {getActiveModelSettings().rotation[1].toFixed(2)}, {getActiveModelSettings().rotation[2].toFixed(2)})</div>
      <div>Scale: {getActiveModelSettings().scale[0].toFixed(3)}x</div>
    </div>

    {/* Reset Button */}
    <button
      onClick={resetActiveModelSettings}
      style={{
        marginTop: '1rem',
        width: '100%',
        padding: '0.5rem',
        background: 'rgba(99, 102, 241, 0.2)',
        border: '1px solid rgba(99, 102, 241, 0.5)',
        borderRadius: '6px',
        color: '#6366f1',
        cursor: 'pointer',
        fontFamily: 'monospace',
        fontSize: '0.9rem'
      }}
    >
      Reset {activeModelType === 'cameraTape' ? 'Camera' : 
             activeModelType === 'robotEye' ? 'Robot Eye' : 
             activeModelType === 'microPhone' ? 'Microphone' : 'Pool'} to Default
    </button>
  </div>
)