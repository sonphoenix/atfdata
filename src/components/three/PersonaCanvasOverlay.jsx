import { useEffect, useRef, useMemo, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { AnimatedModelWrapper } from './AnimatedModelWrapper'
import { MODEL_CONFIGS } from '../utils/constants'
import {
  JapaneseHouseModel, PizzaModel, PoolModel, RobotEyeModel,
  MicroPhoneModel, CameraTapeModel, BooksModel, VideogameModel,
  ClapperboardModel, ScissorsModel, FileShelfModel, ChartModel, CarModel
} from './Models3D'

const MODEL_COMPONENTS = {
  JapaneseHouseModel, PizzaModel, PoolModel, RobotEyeModel,
  MicroPhoneModel, CameraTapeModel, BooksModel, VideogameModel,
  ClapperboardModel, ScissorsModel, FileShelfModel, ChartModel, CarModel
}

// ─── Easing helpers ───────────────────────────────────────────────────────────
const easeOutCubic = t => 1 - Math.pow(1 - t, 3)
const easeOutQuart = t => 1 - Math.pow(1 - t, 4)
const clamp01      = t => Math.max(0, Math.min(1, t))

// ─── Responsive hook ──────────────────────────────────────────────────────────
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 640 : false
  )
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

// ============================================
// UNIVERSAL GLOW WRAPPER
// ============================================
const UniversalGlow = ({ children, color = '#FFD700', intensity = 2.0, thickness = 1.0 }) => {
  const originalGroupRef = useRef()
  const glowGroupRef     = useRef()
  const glowMeshesRef    = useRef([])
  const materialsRef     = useRef([])

  const createGlowMaterial = (baseColor, glowIntensity) =>
    new THREE.ShaderMaterial({
      uniforms: {
        color:     { value: new THREE.Color(baseColor) },
        intensity: { value: glowIntensity },
        time:      { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal; varying vec3 vViewPosition; varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz; vUv = uv;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color; uniform float intensity; uniform float time;
        varying vec3 vNormal; varying vec3 vViewPosition; varying vec2 vUv;
        void main() {
          vec3 normal = normalize(vNormal); vec3 viewDir = normalize(vViewPosition);
          float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 3.0);
          float pulse = 0.8 + sin(time * 3.0 + vUv.x * 10.0) * 0.2;
          float g = smoothstep(0.1, 0.6, fresnel * intensity * pulse);
          gl_FragColor = vec4(color, g);
        }
      `,
      transparent: true, side: THREE.FrontSide,
      blending: THREE.AdditiveBlending, depthWrite: false
    })

  useEffect(() => {
    if (!originalGroupRef.current) return
    const timeout = setTimeout(() => {
      const og = originalGroupRef.current, gg = glowGroupRef.current
      if (!gg) return
      glowMeshesRef.current.forEach(m => gg.remove(m)); glowMeshesRef.current = []
      materialsRef.current.forEach(m => m.dispose());   materialsRef.current = []
      og.updateWorldMatrix(true, true)
      const inv = new THREE.Matrix4().copy(og.matrixWorld).invert()
      og.traverse(child => {
        if (!child.isMesh) return
        const mat  = createGlowMaterial(color, intensity)
        const mesh = new THREE.Mesh(child.geometry.clone(), mat)
        const rel  = child.matrixWorld.clone().premultiply(inv)
        const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3()
        rel.decompose(p, q, s)
        mesh.position.copy(p); mesh.quaternion.copy(q)
        mesh.scale.copy(s).multiplyScalar(1 + thickness * 0.1)
        gg.add(mesh)
        glowMeshesRef.current.push(mesh)
        materialsRef.current.push(mat)
      })
    }, 100)
    return () => {
      clearTimeout(timeout)
      glowMeshesRef.current.forEach(m => glowGroupRef.current?.remove(m))
      materialsRef.current.forEach(m => m.dispose())
    }
  }, [children, color, intensity, thickness])

  useFrame(state => {
    materialsRef.current.forEach(mat => {
      if (mat.uniforms) mat.uniforms.time.value = state.clock.elapsedTime
    })
  })

  return (
    <group>
      <group ref={originalGroupRef} visible={false}>{children}</group>
      <group ref={glowGroupRef} />
    </group>
  )
}

// ============================================
// ELLIPSE HELPER — unchanged from original
// ============================================
const getEllipsePoint = (path, progress, viewportW, viewportH) => {
  const angle = progress * Math.PI * 2
  const x = Math.cos(angle) * path.rx * viewportW
  const y = Math.sin(angle) * path.ry * viewportH
  const rad  = (path.rotation * Math.PI) / 180
  const cosR = Math.cos(rad), sinR = Math.sin(rad)
  return new THREE.Vector3(
    path.cx * viewportW  + (x * cosR - y * sinR) - viewportW  / 2,
    viewportH / 2 - (path.cy * viewportH + (x * sinR + y * cosR)),
    0
  )
}

// ============================================
// PERSONA LIGHT RIBBON
// ============================================
const PersonaLightRibbon = ({
  path, offset = 0, color = '#FFD700',
  ribbonWidth = 5, trailLength = 0.38, speed = 1,
  viewportW, viewportH,
  entryDelay = 0,
}) => {
  const meshRef      = useRef()
  const mountTimeRef = useRef(null)
  const SEGMENTS     = 60

  const texture = useMemo(() => {
    const c   = document.createElement('canvas')
    c.width   = 256; c.height = 16
    const ctx = c.getContext('2d')
    const gradH = ctx.createLinearGradient(0, 0, 256, 0)
    gradH.addColorStop(0.000, 'rgba(255,255,255,0.00)')
    gradH.addColorStop(0.015, 'rgba(255,255,255,0.00)')
    gradH.addColorStop(0.040, 'rgba(255,255,255,1.00)')
    gradH.addColorStop(0.200, 'rgba(255,255,255,1.00)')
    gradH.addColorStop(0.750, 'rgba(255,255,255,1.00)')
    gradH.addColorStop(0.960, 'rgba(255,255,255,1.00)')
    gradH.addColorStop(0.985, 'rgba(255,255,255,0.00)')
    gradH.addColorStop(1.000, 'rgba(255,255,255,0.00)')
    ctx.fillStyle = gradH; ctx.fillRect(0, 0, 256, 16)
    const gradV = ctx.createLinearGradient(0, 0, 0, 16)
    gradV.addColorStop(0.00, 'rgba(255,255,255,0.00)')
    gradV.addColorStop(0.30, 'rgba(255,255,255,0.00)')
    gradV.addColorStop(0.44, 'rgba(255,255,255,1.00)')
    gradV.addColorStop(0.56, 'rgba(255,255,255,1.00)')
    gradV.addColorStop(0.70, 'rgba(255,255,255,0.00)')
    gradV.addColorStop(1.00, 'rgba(255,255,255,0.00)')
    ctx.globalCompositeOperation = 'destination-in'
    ctx.fillStyle = gradV; ctx.fillRect(0, 0, 256, 16)
    ctx.globalCompositeOperation = 'source-over'
    return new THREE.CanvasTexture(c)
  }, [])

  const geometry = useMemo(() => {
    const geo       = new THREE.BufferGeometry()
    const vertCount = (SEGMENTS + 1) * 2
    const positions = new Float32Array(vertCount * 3)
    const uvs       = new Float32Array(vertCount * 2)
    const indices   = []
    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS
      uvs[(i * 2) * 2]         = t; uvs[(i * 2) * 2 + 1]         = 0
      uvs[(i * 2 + 1) * 2]     = t; uvs[(i * 2 + 1) * 2 + 1]     = 1
      if (i < SEGMENTS) {
        const a = i*2, b = i*2+1, c = i*2+2, d = i*2+3
        indices.push(a, b, c, b, d, c)
      }
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('uv',       new THREE.BufferAttribute(uvs, 2))
    geo.setIndex(indices)
    return geo
  }, [])

  const _tangent = useMemo(() => new THREE.Vector3(), [])
  const _perp    = useMemo(() => new THREE.Vector3(), [])

  useFrame(state => {
    if (!meshRef.current) return
    if (mountTimeRef.current === null) mountTimeRef.current = state.clock.elapsedTime
    const age       = state.clock.elapsedTime - mountTimeRef.current - entryDelay
    const opacityT  = clamp01(age / 1.2)
    const opacity   = easeOutCubic(opacityT)
    const lengthT   = clamp01(age / 1.8)
    const curLength = trailLength * easeOutQuart(lengthT)
    meshRef.current.material.opacity = opacity
    if (opacity === 0) return
    const positions    = meshRef.current.geometry.attributes.position.array
    const time         = state.clock.elapsedTime
    const headProgress = ((time * speed * 0.04 + offset) % 1 + 1) % 1
    for (let i = 0; i <= SEGMENTS; i++) {
      const t        = i / SEGMENTS
      const progress = ((headProgress - curLength + t * curLength) % 1 + 1) % 1
      const pCur  = getEllipsePoint(path, progress,               viewportW, viewportH)
      const pNext = getEllipsePoint(path, (progress + 0.002) % 1, viewportW, viewportH)
      _tangent.subVectors(pNext, pCur).normalize()
      _perp.set(-_tangent.y, _tangent.x, 0).multiplyScalar(ribbonWidth)
      const top = (i * 2)     * 3
      const bot = (i * 2 + 1) * 3
      positions[top]   = pCur.x + _perp.x; positions[top+1] = pCur.y + _perp.y; positions[top+2] = 0
      positions[bot]   = pCur.x - _perp.x; positions[bot+1] = pCur.y - _perp.y; positions[bot+2] = 0
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial
        map={texture} color={color}
        transparent opacity={0}
        side={THREE.DoubleSide} depthWrite={false}
        blending={THREE.CustomBlending}
        blendEquation={THREE.AddEquation}
        blendSrc={THREE.SrcAlphaFactor}
        blendDst={THREE.OneFactor}
        blendEquationAlpha={THREE.AddEquation}
        blendSrcAlpha={THREE.ZeroFactor}
        blendDstAlpha={THREE.OneFactor}
      />
    </mesh>
  )
}

// ============================================
// CIRCUITS SCENE
// Mobile: same ribbon widths as desktop — they cover the FULL viewport now.
// Only bloom is slightly reduced to help GPU.
// ============================================
const CircuitsScene = ({ paths, viewportW, viewportH, isMobile }) => (
  <>
    <ambientLight intensity={0.2} />
    <PersonaLightRibbon
      path={paths[0]} offset={0}   color="#FFE55C"
      ribbonWidth={18} trailLength={0.38} speed={1.5}
      viewportW={viewportW} viewportH={viewportH} entryDelay={0.0}
    />
    <PersonaLightRibbon
      path={paths[0]} offset={0.5} color="#FFD700"
      ribbonWidth={13} trailLength={0.38} speed={1.5}
      viewportW={viewportW} viewportH={viewportH} entryDelay={0.15}
    />
    <PersonaLightRibbon
      path={paths[1]} offset={0}   color="#FFA500"
      ribbonWidth={16} trailLength={0.38} speed={1.4}
      viewportW={viewportW} viewportH={viewportH} entryDelay={0.25}
    />
    <PersonaLightRibbon
      path={paths[1]} offset={0.5} color="#FF8C00"
      ribbonWidth={11} trailLength={0.38} speed={1.4}
      viewportW={viewportW} viewportH={viewportH} entryDelay={0.40}
    />
    <EffectComposer>
      <Bloom
        intensity={isMobile ? 2.8 : 3.5}
        luminanceThreshold={0.05}
        luminanceSmoothing={0.85}
        mipmapBlur
      />
    </EffectComposer>
  </>
)

// ============================================
// 3D MODEL SCENE
// ============================================
const ModelScene = ({ selectedProject, isMobile }) => {
  const { ModelComponent, modelConfig } = useMemo(() => {
    if (!selectedProject) return { ModelComponent: null, modelConfig: null }
    const config    = MODEL_CONFIGS[selectedProject.name]
    if (!config)    return { ModelComponent: null, modelConfig: null }
    const component = MODEL_COMPONENTS[config.component]
    return { ModelComponent: component, modelConfig: config }
  }, [selectedProject])

  const modelGroupRef = useRef()
  useFrame((_, delta) => {
    if (modelGroupRef.current) modelGroupRef.current.rotation.y += delta * 0.5
  })

  if (!ModelComponent || !modelConfig) return null
  const auraColor     = modelConfig.settings.auraColor     || '#FFD700'
  const auraIntensity = modelConfig.settings.auraIntensity || 2.0

  // On mobile: centre the model horizontally, shift up a bit so it clears the bottom sheet
  const posX = isMobile ?  0   : -3
  const posY = isMobile ?  1.5 :  0

  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={1.5} />
      <pointLight position={[-5,  5, 10]} intensity={5} color={auraColor} distance={50} />
      <pointLight position={[ 5, -5,  5]} intensity={3} color="#FFA500"   distance={40} />
      <pointLight position={[ 0,  0, 15]} intensity={2} color="#FFFFFF" />
      <pointLight position={[ 0, 10, -5]} intensity={2} color="#4a9eff"   distance={30} />
      <group
        ref={modelGroupRef}
        position={[posX, posY, 0]}
        rotation={modelConfig.settings.rotation || [0, 0, 0]}
      >
        <Suspense fallback={null}>
          <AnimatedModelWrapper animateIn={true} delay={0}>
            <UniversalGlow color={auraColor} intensity={auraIntensity} thickness={1.2}>
              <ModelComponent modelSettings={modelConfig.settings} />
            </UniversalGlow>
          </AnimatedModelWrapper>
        </Suspense>
      </group>
      <EffectComposer>
        <Bloom intensity={0.8} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>
    </>
  )
}

// ============================================
// MAIN OVERLAY COMPONENT
// ============================================
export const PersonaCanvasOverlay = ({ selectedProject }) => {
  const canvasRef    = useRef(null)
  const animationRef = useRef(null)
  const isMobile     = useIsMobile()
  const [viewport, setViewport] = useState({ width: 1600, height: 900 })

  useEffect(() => {
    const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // ── Ribbon ellipse paths ──────────────────────────────────────────────────
  // On mobile the viewport is portrait, so we use taller ry values so the
  // ribbons sweep across the FULL height just like desktop does in landscape.
  // cx/cy are kept near the top-centre so they don't fight the bottom sheet.
  const paths = isMobile
    ? [
        // Wide diagonal sweep — covers left→right and top→bottom
        { cx: 0.38, cy: 0.30, rx: 0.52, ry: 0.62, rotation: -38, speed: 0.9  },
        { cx: 0.52, cy: 0.28, rx: 0.60, ry: 0.52, rotation: -14, speed: 0.45 }
      ]
    : [
        { cx: 0.35, cy: 0.26, rx: 0.43, ry: 0.53, rotation: -42, speed: 0.9  },
        { cx: 0.42, cy: 0.26, rx: 0.57, ry: 0.47, rotation: -16, speed: 0.45 }
      ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const sceneStartTime = performance.now()
    const GRID_FADE_IN   = { start: 0.0, duration: 1.2 }
    const STAR_FADE_IN   = { start: 0.3, duration: 0.9 }
    const NEST_FADE_IN   = { start: 0.5, duration: 1.0 }

    const getFade = (elapsed, cfg) =>
      easeOutCubic(clamp01((elapsed - cfg.start) / cfg.duration))

    // ── Nest objects ─────────────────────────────────────────────────────────
    // Mobile: same object count as desktop but sizes scaled to ~75% so they
    // feel proportional on a smaller screen without looking tiny.
    // Offsets are also scaled down proportionally.
    const S = isMobile ? 0.72 : 1   // uniform size/offset scale for mobile

    const nests = [
      {
        pathIndex: 0, baseProgress: 0, speed: 0.0012,
        objects: [
          { offsetProgress: 0,      offsetX: 0,        offsetY: 0,        type: 'star',   size: 45*S, color: '#FFD700', rotation: 0,   rotationSpeed: 0.02  },
          { offsetProgress: 0.02,   offsetX: -70*S,    offsetY: 40*S,     type: 'moon',   size: 40*S, color: '#FFA500', rotation: 0.5, rotationSpeed: 0.015 },
          { offsetProgress: 0.025,  offsetX: 75*S,     offsetY: -50*S,    type: 'star',   size: 38*S, color: '#FFD700', rotation: 1.2, rotationSpeed: 0.025 },
          { offsetProgress: -0.02,  offsetX: -80*S,    offsetY: -55*S,    type: 'circle', size: 35*S, color: '#FFEB3B', rotation: 0,   rotationSpeed: 0     },
          { offsetProgress: 0.022,  offsetX: 55*S,     offsetY: 70*S,     type: 'moon',   size: 42*S, color: '#FFA500', rotation: 0.8, rotationSpeed: 0.018 },
          { offsetProgress: -0.022, offsetX: 35*S,     offsetY: -75*S,    type: 'star',   size: 36*S, color: '#FFD700', rotation: 2.1, rotationSpeed: 0.022 },
        ]
      },
      {
        pathIndex: 0, baseProgress: 0.5, speed: 0.0011,
        objects: [
          { offsetProgress: 0,      offsetX: 0,        offsetY: 0,        type: 'moon',   size: 46*S, color: '#FFA500', rotation: 0,   rotationSpeed: 0.018 },
          { offsetProgress: 0.023,  offsetX: 72*S,     offsetY: -45*S,    type: 'star',   size: 40*S, color: '#FFD700', rotation: 1.5, rotationSpeed: 0.023 },
          { offsetProgress: -0.023, offsetX: -68*S,    offsetY: 58*S,     type: 'star',   size: 42*S, color: '#FFD700', rotation: 0.6, rotationSpeed: 0.021 },
          { offsetProgress: 0.026,  offsetX: 50*S,     offsetY: 78*S,     type: 'circle', size: 36*S, color: '#FFEB3B', rotation: 0,   rotationSpeed: 0     },
        ]
      },
      {
        pathIndex: 1, baseProgress: 0, speed: 0.0011,
        objects: [
          { offsetProgress: 0,      offsetX: 0,        offsetY: 0,        type: 'star',   size: 43*S, color: '#FFD700', rotation: 0,   rotationSpeed: 0.02  },
          { offsetProgress: 0.024,  offsetX: -65*S,    offsetY: 72*S,     type: 'moon',   size: 44*S, color: '#FFA500', rotation: 0.3, rotationSpeed: 0.017 },
          { offsetProgress: -0.021, offsetX: 70*S,     offsetY: -62*S,    type: 'star',   size: 39*S, color: '#FFD700', rotation: 1.8, rotationSpeed: 0.023 },
          { offsetProgress: 0.027,  offsetX: -78*S,    offsetY: -48*S,    type: 'circle', size: 35*S, color: '#FFEB3B', rotation: 0,   rotationSpeed: 0     },
        ]
      },
      {
        pathIndex: 1, baseProgress: 0.5, speed: 0.0012,
        objects: [
          { offsetProgress: 0,      offsetX: 0,        offsetY: 0,        type: 'moon',   size: 44*S, color: '#FFA500', rotation: 0,   rotationSpeed: 0.019 },
          { offsetProgress: 0.025,  offsetX: 73*S,     offsetY: 66*S,     type: 'star',   size: 41*S, color: '#FFD700', rotation: 1.3, rotationSpeed: 0.022 },
          { offsetProgress: -0.025, offsetX: -80*S,    offsetY: -56*S,    type: 'star',   size: 40*S, color: '#FFD700', rotation: 0.7, rotationSpeed: 0.024 },
        ]
      }
    ]

    const starDots = Array.from({ length: 40 }, () => ({
      x: Math.random(), y: Math.random(),
      size: 1.5 + Math.random() * 3,
      twinkleOffset: Math.random() * Math.PI * 2
    }))

    const getPointOnEllipse = (path, progress, w, h) => {
      const angle = progress * Math.PI * 2
      const x = Math.cos(angle) * path.rx * w
      const y = Math.sin(angle) * path.ry * h
      const rad = (path.rotation * Math.PI) / 180
      const cosR = Math.cos(rad), sinR = Math.sin(rad)
      return { x: path.cx * w + (x * cosR - y * sinR), y: path.cy * h + (x * sinR + y * cosR) }
    }

    const drawGrid = (ctx, time, w, h, alpha) => {
      if (alpha <= 0) return
      const gridSize = 80
      ctx.strokeStyle = '#4a9eff'; ctx.lineWidth = 1.5
      const centerX = w / 2, centerY = h / 2
      for (let y = -gridSize; y < h + gridSize; y += gridSize / 2) {
        for (let x = -gridSize; x < w + gridSize; x += gridSize) {
          const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
          const maxDist = Math.sqrt(centerX ** 2 + centerY ** 2)
          const fadeStart = maxDist * 0.3, fadeEnd = maxDist * 0.8
          if (dist > fadeStart) {
            const gridAlpha = Math.min((dist - fadeStart) / (fadeEnd - fadeStart), 1) * (0.3 + Math.sin(time * 2 + dist * 0.01) * 0.2)
            ctx.globalAlpha = gridAlpha * alpha
            ctx.beginPath()
            ctx.moveTo(x, y - gridSize / 2); ctx.lineTo(x + gridSize / 2, y)
            ctx.lineTo(x, y + gridSize / 2); ctx.lineTo(x - gridSize / 2, y)
            ctx.closePath(); ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1
    }

    const drawStar = (ctx, x, y, size, color, rotation, alpha) => {
      ctx.save(); ctx.globalAlpha = alpha
      ctx.translate(x, y); ctx.rotate(rotation)
      ctx.fillStyle = color; ctx.shadowBlur = 30; ctx.shadowColor = color
      ctx.beginPath()
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2
        const r = i % 2 === 0 ? size : size * 0.4
        i === 0 ? ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r)
                : ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r)
      }
      ctx.closePath(); ctx.fill()
      ctx.shadowBlur = 40; ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.beginPath(); ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2); ctx.fill()
      ctx.shadowBlur = 0; ctx.restore()
    }

    const drawMoon = (ctx, x, y, size, color, rotation, alpha) => {
      const pad = size * 2; const dim = Math.ceil(pad * 2)
      const off = document.createElement('canvas')
      off.width = dim; off.height = dim
      const offCtx = off.getContext('2d')
      const cx = dim / 2, cy = dim / 2
      offCtx.fillStyle = color
      offCtx.shadowBlur = 30; offCtx.shadowColor = color
      offCtx.beginPath(); offCtx.arc(cx, cy, size, 0, Math.PI * 2); offCtx.fill()
      offCtx.globalCompositeOperation = 'destination-out'
      offCtx.beginPath(); offCtx.arc(cx + size * 0.38, cy, size * 0.72, 0, Math.PI * 2); offCtx.fill()
      offCtx.globalCompositeOperation = 'source-over'
      offCtx.shadowBlur = 20; offCtx.shadowColor = 'rgba(255,220,120,0.6)'
      offCtx.fillStyle = 'rgba(255,200,80,0.25)'
      offCtx.beginPath(); offCtx.arc(cx - size * 0.15, cy, size * 0.5, 0, Math.PI * 2); offCtx.fill()
      offCtx.shadowBlur = 0
      ctx.save(); ctx.globalAlpha = alpha
      ctx.translate(x, y); ctx.rotate(rotation)
      ctx.drawImage(off, -dim / 2, -dim / 2)
      ctx.restore()
    }

    const drawCircle = (ctx, x, y, size, color, alpha) => {
      ctx.save(); ctx.globalAlpha = alpha
      ctx.fillStyle = color; ctx.shadowBlur = 30; ctx.shadowColor = color
      ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill()
      ctx.shadowBlur = 35; ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.beginPath(); ctx.arc(x, y, size * 0.5, 0, Math.PI * 2); ctx.fill()
      ctx.shadowBlur = 0; ctx.restore()
    }

    const animate = currentTime => {
      const time    = currentTime / 1000
      const elapsed = (performance.now() - sceneStartTime) / 1000
      const w = canvas.width, h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const gridAlpha = getFade(elapsed, GRID_FADE_IN)
      const starAlpha = getFade(elapsed, STAR_FADE_IN)
      const nestAlpha = getFade(elapsed, NEST_FADE_IN)

      drawGrid(ctx, time, w, h, gridAlpha)

      if (starAlpha > 0) {
        starDots.forEach(dot => {
          const twinkle = 0.3 + Math.sin(time * 2 + dot.twinkleOffset) * 0.7
          ctx.globalAlpha = twinkle * starAlpha
          ctx.fillStyle = 'white'
          ctx.beginPath(); ctx.arc(dot.x * w, dot.y * h, dot.size, 0, Math.PI * 2); ctx.fill()
        })
        ctx.globalAlpha = 1
      }

      if (nestAlpha > 0) {
        nests.forEach(nest => {
          const path = paths[nest.pathIndex]
          nest.baseProgress = (nest.baseProgress + nest.speed) % 1
          nest.objects.forEach(obj => {
            const p    = (nest.baseProgress + obj.offsetProgress + 1) % 1
            const base = getPointOnEllipse(path, p, w, h)
            obj.rotation += obj.rotationSpeed
            const fx = base.x + obj.offsetX, fy = base.y + obj.offsetY
            if      (obj.type === 'star')   drawStar  (ctx, fx, fy, obj.size, obj.color, obj.rotation, nestAlpha)
            else if (obj.type === 'moon')   drawMoon  (ctx, fx, fy, obj.size, obj.color, obj.rotation, nestAlpha)
            else                            drawCircle(ctx, fx, fy, obj.size, obj.color, nestAlpha)
          })
        })
      }

      animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isMobile])

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 1500
    }}>
      {/* 3D Model — always full screen, model Y-shifted up on mobile */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
        <Canvas
          camera={{ position: [0, 0, 10], fov: isMobile ? 58 : 50, near: 0.1, far: 1000 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <ModelScene selectedProject={selectedProject} isMobile={isMobile} />
        </Canvas>
      </div>

      {/* Light ribbons — ALWAYS full screen, paths tuned per orientation */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }}>
        <Canvas
          orthographic
          camera={{
            position: [0, 0, 100], zoom: 1,
            left:   -viewport.width  / 2,
            right:   viewport.width  / 2,
            top:     viewport.height / 2,
            bottom: -viewport.height / 2
          }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <CircuitsScene
            paths={paths}
            viewportW={viewport.width}
            viewportH={viewport.height}
            isMobile={isMobile}
          />
        </Canvas>
      </div>

      {/* 2D canvas — grid, star dots, orbiting objects — always full screen */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 3 }}
      />
    </div>
  )
}