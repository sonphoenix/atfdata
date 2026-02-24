import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { AnimatedModelWrapper } from './AnimatedModelWrapper'
import { MODEL_CONFIGS } from '../utils/constants'
import {
  JapaneseHouseModel, PizzaModel, PoolModel, RobotEyeModel,
  MicroPhoneModel, CameraTapeModel, BooksModel, VideogameModel,
  ClapperboardModel, ScissorsModel, FileShelfModel, ChartModel,CarModel
} from './Models3D'

const MODEL_COMPONENTS = {
  JapaneseHouseModel, PizzaModel, PoolModel, RobotEyeModel,
  MicroPhoneModel, CameraTapeModel, BooksModel, VideogameModel,
  ClapperboardModel, ScissorsModel, FileShelfModel, ChartModel,CarModel
}

const ROT_SPEED  = 1.8
const ZOOM_SPEED = 0.05
const ZOOM_MIN   = 3
const ZOOM_MAX   = 18

// Lives inside Canvas — reads axes ref every frame, no re-renders
const JoystickController = ({ modelGroupRef, joystickAxesRef }) => {
  useFrame(({ camera }, delta) => {
    const { lx, ly, ry } = joystickAxesRef.current
    if (modelGroupRef.current) {
      modelGroupRef.current.rotation.y += lx * ROT_SPEED * delta
      modelGroupRef.current.rotation.x += ly * ROT_SPEED * delta
    }
    const newZ = camera.position.z + ry * ZOOM_SPEED
    camera.position.z = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZ))
  })
  return null
}

export const ModelCanvas = ({ projectName, modelAnimateIn, animateOut, joystickAxesRef }) => {
  const modelConfig    = MODEL_CONFIGS[projectName]
  const ModelComponent = modelConfig ? MODEL_COMPONENTS[modelConfig.component] : null
  const modelGroupRef  = useRef()
  const fallbackAxes   = useRef({ lx: 0, ly: 0, rx: 0, ry: 0 })
  const axesRef        = joystickAxesRef ?? fallbackAxes

  return (
    <div style={{
      flex: 1, borderRadius: '12px', overflow: 'hidden',
      background: 'radial-gradient(circle at center, rgba(255,215,0,0.05) 0%, rgba(0,0,0,0.4) 100%)',
      border: '2px solid rgba(255,215,0,0.3)',
      boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8), 0 0 40px rgba(255,215,0,0.2)',
      animation: animateOut
        ? 'modelZoomOut 0.5s cubic-bezier(0.6,0,1,0.4) forwards'
        : 'modelReveal 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.5s forwards',
    }}>
      <Canvas shadows style={{ width: '100%', height: '100%' }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}>
        <ambientLight intensity={2.5} />
        <directionalLight position={[10, 10, 5]}    intensity={2.5} castShadow />
        <directionalLight position={[-10, -10, -5]} intensity={1.5} />
        <pointLight position={[0,  10, 0]} intensity={2}   color="#FFD700" />
        <pointLight position={[0, -10, 0]} intensity={1.2} color="#FFA500" />
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <JoystickController modelGroupRef={modelGroupRef} joystickAxesRef={axesRef} />
        <Suspense fallback={null}>
          <AnimatedModelWrapper animateIn={modelAnimateIn && !animateOut} delay={0}>
            <group ref={modelGroupRef}>
              {ModelComponent && <ModelComponent modelSettings={modelConfig.settings} />}
            </group>
          </AnimatedModelWrapper>
        </Suspense>
      </Canvas>

      {modelAnimateIn && !animateOut && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%) scale(0)',
          width: '120%', height: '120%',
          background: 'radial-gradient(circle at center, rgba(255,215,0,0) 30%, rgba(255,215,0,0.2) 50%, transparent 70%)',
          animation: 'modelGlowExpand 1.2s cubic-bezier(0.34,1.56,0.64,1) 0.8s forwards',
          pointerEvents: 'none', zIndex: 1
        }} />
      )}
    </div>
  )
}