import { useState, useEffect, useRef } from 'react'

export const PathEditorOverlay = () => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  
  console.log('🎨 PathEditorOverlay rendering!')
  
  // Path 1 controls
  const [path1, setPath1] = useState({
    cx: 0.25,
    cy: 0.30,
    rx: 0.40,
    ry: 0.45,
    rotation: -55
  })
  
  // Path 2 controls
  const [path2, setPath2] = useState({
    cx: 0.42,
    cy: 0.26,
    rx: 0.55,
    ry: 0.47,
    rotation: -15
  })
  
  const [showReference, setShowReference] = useState(true)
  const [opacity, setOpacity] = useState(0.7)
  const [selectedPath, setSelectedPath] = useState(1) // Which path to control with keyboard
  const [stepSize, setStepSize] = useState(0.01) // How much to move per keypress
  
  // Keyboard controls for easy positioning (AZERTY optimized)
  useEffect(() => {
    const handleKeyPress = (e) => {
      const path = selectedPath === 1 ? path1 : path2
      const setPath = selectedPath === 1 ? setPath1 : setPath2
      
      switch(e.key.toLowerCase()) {
        // Arrow keys OR ZQSD for position (AZERTY layout)
        case 'arrowleft':
        case 'q':
          e.preventDefault()
          setPath({...path, cx: Math.max(0, path.cx - stepSize)})
          break
        case 'arrowright':
        case 'd':
          e.preventDefault()
          setPath({...path, cx: Math.min(1, path.cx + stepSize)})
          break
        case 'arrowup':
        case 'z':
          e.preventDefault()
          setPath({...path, cy: Math.max(0, path.cy - stepSize)})
          break
        case 'arrowdown':
        case 's':
          e.preventDefault()
          setPath({...path, cy: Math.min(1, path.cy + stepSize)})
          break
        
        // E/A for rotation
        case 'a':
          e.preventDefault()
          setPath({...path, rotation: path.rotation - 1})
          break
        case 'e':
          e.preventDefault()
          setPath({...path, rotation: path.rotation + 1})
          break
        
        // 1/2 to switch paths
        case '1':
          e.preventDefault()
          setSelectedPath(1)
          break
        case '2':
          e.preventDefault()
          setSelectedPath(2)
          break
        
        // R/F for height (ry)
        case 'r':
          e.preventDefault()
          setPath({...path, ry: Math.max(0.1, path.ry - stepSize)})
          break
        case 'f':
          e.preventDefault()
          setPath({...path, ry: Math.min(1, path.ry + stepSize)})
          break
        
        // T/G for width (rx)
        case 't':
          e.preventDefault()
          setPath({...path, rx: Math.max(0.1, path.rx - stepSize)})
          break
        case 'g':
          e.preventDefault()
          setPath({...path, rx: Math.min(1, path.rx + stepSize)})
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedPath, stepSize, path1, path2])
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    
    // Get point on ellipse
    const getPointOnEllipse = (path, progress, w, h) => {
      const angle = progress * Math.PI * 2
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      
      let x = cos * path.rx * w
      let y = sin * path.ry * h
      
      const rad = (path.rotation * Math.PI) / 180
      const cosR = Math.cos(rad)
      const sinR = Math.sin(rad)
      
      const xRot = x * cosR - y * sinR
      const yRot = x * sinR + y * cosR
      
      return {
        x: path.cx * w + xRot,
        y: path.cy * h + yRot
      }
    }
    
    // Draw path with glow effect
    const drawPath = (ctx, path, w, h, color, isSelected) => {
      const segments = 120
      
      // Draw thick glowing path
      ctx.strokeStyle = color
      ctx.lineWidth = isSelected ? 6 : 4
      ctx.shadowBlur = isSelected ? 25 : 15
      ctx.shadowColor = color
      
      ctx.beginPath()
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const point = getPointOnEllipse(path, t, w, h)
        
        if (i === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      }
      ctx.stroke()
      
      ctx.shadowBlur = 0
      
      // Draw center point (bigger when selected)
      const center = { x: path.cx * w, y: path.cy * h }
      ctx.fillStyle = color
      ctx.shadowBlur = isSelected ? 35 : 25
      ctx.shadowColor = color
      ctx.beginPath()
      ctx.arc(center.x, center.y, isSelected ? 14 : 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      
      // Draw center crosshair (bigger when selected)
      ctx.strokeStyle = color
      ctx.lineWidth = isSelected ? 4 : 3
      ctx.shadowBlur = isSelected ? 20 : 12
      ctx.shadowColor = color
      ctx.beginPath()
      const crossSize = isSelected ? 30 : 20
      ctx.moveTo(center.x - crossSize, center.y)
      ctx.lineTo(center.x + crossSize, center.y)
      ctx.moveTo(center.x, center.y - crossSize)
      ctx.lineTo(center.x, center.y + crossSize)
      ctx.stroke()
      ctx.shadowBlur = 0
    }
    
    const animate = () => {
      const w = canvas.width
      const h = canvas.height
      
      ctx.clearRect(0, 0, w, h)
      
      // Draw paths with selection highlighting
      drawPath(ctx, path1, w, h, '#00FF00', selectedPath === 1)
      drawPath(ctx, path2, w, h, '#FF00FF', selectedPath === 2)
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      window.removeEventListener('resize', resize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [path1, path2, selectedPath])
  
  const copyToClipboard = () => {
    const code = `const paths = [
  // Path 1
  { 
    cx: ${path1.cx.toFixed(2)},
    cy: ${path1.cy.toFixed(2)},
    rx: ${path1.rx.toFixed(2)},
    ry: ${path1.ry.toFixed(2)},
    rotation: ${path1.rotation},
    speed: 0.25,
    lightProgress1: 0,
    lightProgress2: 0.5
  },
  // Path 2
  { 
    cx: ${path2.cx.toFixed(2)},
    cy: ${path2.cy.toFixed(2)},
    rx: ${path2.rx.toFixed(2)},
    ry: ${path2.ry.toFixed(2)},
    rotation: ${path2.rotation},
    speed: 0.22,
    lightProgress1: 0,
    lightProgress2: 0.5
  }
]`
    navigator.clipboard.writeText(code)
    alert('✅ Path configuration copied to clipboard!\n\nPaste it into PersonaCanvasOverlay.jsx to replace the paths array.')
  }
  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000', zIndex: 1500 }}>
      {/* Reference Image */}
      {showReference && (
        <img 
          src="/refrences/refrencep5.png" 
          alt="P5R Reference"
          onError={(e) => {
            console.error('Failed to load reference image. Make sure /public/refrences/refrencep5.png exists')
            e.target.style.display = 'none'
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: opacity,
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      )}
      
      {/* Canvas Overlay */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2
        }}
      />
      
      {/* Controls Panel */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.95)',
        padding: '20px',
        borderRadius: '10px',
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: '13px',
        maxHeight: '90vh',
        overflowY: 'auto',
        width: '340px',
        border: '2px solid #00FF00',
        zIndex: 3
      }}>
        <h2 style={{ margin: '0 0 15px 0', color: '#00FF00', fontSize: '18px' }}>🎮 PATH EDITOR</h2>
        
        {/* Selected Path Indicator */}
        <div style={{ 
          marginBottom: '15px', 
          padding: '12px', 
          background: selectedPath === 1 ? 'rgba(0, 255, 0, 0.15)' : 'rgba(255, 0, 255, 0.15)',
          borderRadius: '5px',
          border: `3px solid ${selectedPath === 1 ? '#00FF00' : '#FF00FF'}`,
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          CONTROLLING: PATH {selectedPath}<br/>
          <span style={{ fontSize: '12px' }}>({selectedPath === 1 ? 'Green' : 'Magenta'})</span>
        </div>
        
        {/* Keyboard Controls */}
        <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(255, 215, 0, 0.1)', borderRadius: '5px', fontSize: '12px', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#FFD700' }}>⌨️ KEYBOARD SHORTCUTS:</div>
          <div style={{ lineHeight: '1.6' }}>
            • <strong>1</strong> / <strong>2</strong> = Switch path<br/>
            • <strong>Arrow Keys</strong> or <strong>ZQSD</strong> = Move position<br/>
            • <strong>A</strong> / <strong>E</strong> = Rotate ±1°<br/>
            • <strong>R</strong> / <strong>F</strong> = Height ±<br/>
            • <strong>T</strong> / <strong>G</strong> = Width ±
          </div>
          <div style={{ marginTop: '10px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#AAA' }}>
              Step Size: {stepSize.toFixed(3)}
              <input 
                type="range"
                min="0.001"
                max="0.05"
                step="0.001"
                value={stepSize}
                onChange={(e) => setStepSize(parseFloat(e.target.value))}
                style={{ width: '100%', display: 'block', marginTop: '4px' }}
              />
            </label>
          </div>
        </div>
        
        {/* Reference Image Controls */}
        <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #333' }}>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showReference}
              onChange={(e) => setShowReference(e.target.checked)}
              style={{ marginRight: '10px' }}
            />
            Show Reference Image
          </label>
          
          {showReference && (
            <label style={{ display: 'block' }}>
              Opacity: {opacity.toFixed(2)}
              <input 
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                style={{ width: '100%', display: 'block', marginTop: '5px' }}
              />
            </label>
          )}
        </div>
        
        {/* PATH 1 CONTROLS */}
        <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(0, 255, 0, 0.08)', borderRadius: '5px', border: selectedPath === 1 ? '2px solid #00FF00' : '1px solid rgba(0, 255, 0, 0.3)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#00FF00', fontSize: '14px' }}>PATH 1 (Green)</h3>
          
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
            Center X: {path1.cx.toFixed(2)}
            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={path1.cx}
              onChange={(e) => setPath1({...path1, cx: parseFloat(e.target.value)})}
              style={{ width: '100%', display: 'block', marginTop: '3px' }}
            />
          </label>
          
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
            Center Y: {path1.cy.toFixed(2)}
            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={path1.cy}
              onChange={(e) => setPath1({...path1, cy: parseFloat(e.target.value)})}
              style={{ width: '100%', display: 'block', marginTop: '3px' }}
            />
          </label>
          
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
            Width (rx): {path1.rx.toFixed(2)}
            <input 
              type="range"
              min="0.1"
              max="1.0"
              step="0.01"
              value={path1.rx}
              onChange={(e) => setPath1({...path1, rx: parseFloat(e.target.value)})}
              style={{ width: '100%', display: 'block', marginTop: '3px' }}
            />
          </label>
          
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
            Height (ry): {path1.ry.toFixed(2)}
            <input 
              type="range"
              min="0.1"
              max="1.0"
              step="0.01"
              value={path1.ry}
              onChange={(e) => setPath1({...path1, ry: parseFloat(e.target.value)})}
              style={{ width: '100%', display: 'block', marginTop: '3px' }}
            />
          </label>
          
          <label style={{ display: 'block', fontSize: '12px' }}>
            Rotation: {path1.rotation}°
            <input 
              type="range"
              min="-180"
              max="180"
              step="1"
              value={path1.rotation}
              onChange={(e) => setPath1({...path1, rotation: parseInt(e.target.value)})}
              style={{ width: '100%', display: 'block', marginTop: '3px' }}
            />
          </label>
        </div>
        
        {/* PATH 2 CONTROLS */}
        <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(255, 0, 255, 0.08)', borderRadius: '5px', border: selectedPath === 2 ? '2px solid #FF00FF' : '1px solid rgba(255, 0, 255, 0.3)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#FF00FF', fontSize: '14px' }}>PATH 2 (Magenta)</h3>
          
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
            Center X: {path2.cx.toFixed(2)}
            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={path2.cx}
              onChange={(e) => setPath2({...path2, cx: parseFloat(e.target.value)})}
              style={{ width: '100%', display: 'block', marginTop: '3px' }}
            />
          </label>
          
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
            Center Y: {path2.cy.toFixed(2)}
            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={path2.cy}
              onChange={(e) => setPath2({...path2, cy: parseFloat(e.target.value)})}
              style={{ width: '100%', display: 'block', marginTop: '3px' }}
            />
          </label>
          
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
            Width (rx): {path2.rx.toFixed(2)}
            <input 
              type="range"
              min="0.1"
              max="1.0"
              step="0.01"
              value={path2.rx}
              onChange={(e) => setPath2({...path2, rx: parseFloat(e.target.value)})}
              style={{ width: '100%', display: 'block', marginTop: '3px' }}
            />
          </label>
          
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
            Height (ry): {path2.ry.toFixed(2)}
            <input 
              type="range"
              min="0.1"
              max="1.0"
              step="0.01"
              value={path2.ry}
              onChange={(e) => setPath2({...path2, ry: parseFloat(e.target.value)})}
              style={{ width: '100%', display: 'block', marginTop: '3px' }}
            />
          </label>
          
          <label style={{ display: 'block', fontSize: '12px' }}>
            Rotation: {path2.rotation}°
            <input 
              type="range"
              min="-180"
              max="180"
              step="1"
              value={path2.rotation}
              onChange={(e) => setPath2({...path2, rotation: parseInt(e.target.value)})}
              style={{ width: '100%', display: 'block', marginTop: '3px' }}
            />
          </label>
        </div>
        
        {/* Copy Button */}
        <button
          onClick={copyToClipboard}
          style={{
            width: '100%',
            padding: '15px',
            background: 'linear-gradient(135deg, #00FF00, #00DD00)',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: 'monospace',
            boxShadow: '0 4px 15px rgba(0, 255, 0, 0.3)'
          }}
          onMouseOver={(e) => e.target.style.background = 'linear-gradient(135deg, #00DD00, #00BB00)'}
          onMouseOut={(e) => e.target.style.background = 'linear-gradient(135deg, #00FF00, #00DD00)'}
        >
          📋 COPY PATH CODE
        </button>
        
        <div style={{ marginTop: '15px', fontSize: '11px', color: '#888', textAlign: 'center', lineHeight: '1.5' }}>
          Press <strong>1</strong> or <strong>2</strong> to switch paths<br/>
          Use ZQSD or arrows for precision<br/>
          Adjust opacity to see reference better
        </div>
      </div>
    </div>
  )
}