import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF, Html } from '@react-three/drei'

// Preload models
useGLTF.preload('/models/terminal/terminal.glb')
useGLTF.preload('/models/chart/chart.glb')

function Model({ serviceType }) {
  const terminal = useGLTF('/models/terminal/terminal.glb')
  const chart = useGLTF('/models/chart/chart.glb')
  
  if (serviceType === 'SOFTWARE ENGINEERING') {
    return (
      <primitive 
        object={terminal.scene} 
        scale={0.8} 
        position={[0, -0.5, 0]}
        rotation={[0, Math.PI / 8, 0]}
      />
    )
  }
  
  return (
    <primitive 
      object={chart.scene} 
      scale={1.2} 
      position={[0, 0, 0]}
      rotation={[0, Math.PI / 6, 0]}
    />
  )
}

function Loader() {
  return (
    <Html center>
      <div className="text-white">Loading model...</div>
    </Html>
  )
}

export default function ServiceModel({ serviceType }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      style={{ pointerEvents: 'none' }}
    >
      <Suspense fallback={<Loader />}>
        <Model serviceType={serviceType} />
        <Environment preset="studio" />
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <directionalLight position={[-5, 5, 5]} intensity={0.5} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.8}
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Suspense>
    </Canvas>
  )
}