// StarCanvas.jsx
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { AnimatedStar } from './AnimatedStar'

export const StarCanvas = ({ projectStats, starAnimateIn, animateOut }) => {
  return (
    <>
      {/* 3D Star Canvas */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        height: '80%',
        zIndex: 1,
        pointerEvents: 'none'
      }}>
        <Canvas 
          style={{ width: '100%', height: '100%' }}
          gl={{ 
            alpha: true, 
            antialias: true,
            preserveDrawingBuffer: true
          }}
        >
          <ambientLight intensity={1.5} />
          <directionalLight position={[0, 0, 5]} intensity={1} color="#FFD700" />
          <PerspectiveCamera makeDefault position={[0, 0, 8]} />
          
          <Suspense fallback={null}>
            <AnimatedStar 
              stats={projectStats} 
              maxValue={100} 
              animateIn={starAnimateIn && !animateOut}
              onFlip={() => {
                //console.log("⭐ Star flipped!")
              }}
            />
          </Suspense>
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            enabled={false}
          />
        </Canvas>

        {/* Star entrance rings */}
        {starAnimateIn && !animateOut && (
          <>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) scale(0)',
              width: '380px',
              height: '380px',
              border: '2px solid rgba(255, 215, 0, 0.5)',
              borderRadius: '50%',
              animation: 'starRingExpand 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 1.0s forwards',
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) scale(0)',
              width: '420px',
              height: '420px',
              border: '2px solid rgba(255, 165, 0, 0.3)',
              borderRadius: '50%',
              animation: 'starRingExpand 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 1.1s forwards',
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) scale(0)',
              width: '460px',
              height: '460px',
              border: '1px solid rgba(255, 140, 0, 0.2)',
              borderRadius: '50%',
              animation: 'starRingExpand 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s forwards',
              pointerEvents: 'none'
            }} />
          </>
        )}
        
        {/* Continuous rings (after entrance) */}
        {starAnimateIn && !animateOut && (
          <>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '380px',
              height: '380px',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '50%',
              animation: 'pulseRing 4s infinite linear 1.9s',
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '420px',
              height: '420px',
              border: '1px solid rgba(255, 165, 0, 0.2)',
              borderRadius: '50%',
              animation: 'pulseRing 4s infinite linear 2.1s',
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '460px',
              height: '460px',
              border: '1px solid rgba(255, 140, 0, 0.1)',
              borderRadius: '50%',
              animation: 'pulseRing 4s infinite linear 2.3s',
              pointerEvents: 'none'
            }} />
          </>
        )}
      </div>
    </>
  )
}