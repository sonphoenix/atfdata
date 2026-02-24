import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { NeuralNetwork } from './Network'

// ─── Camera constants (must match SceneWrapper: fov=50, z=5) ─────────────────
// visible half-width at z=0 ≈ tan(25°)*5 * aspect ≈ 5.8
const HALF_W = 6.2
const HALF_H = 3.4

// ─── Ribbon trail texture (same technique as PersonaCanvasOverlay) ────────────
const makeTrailTexture = () => {
  const c   = document.createElement('canvas')
  c.width   = 512; c.height = 32
  const ctx = c.getContext('2d')

  // Horizontal gradient: transparent → bright → bright → transparent (tail→head)
  const gradH = ctx.createLinearGradient(0, 0, 512, 0)
  gradH.addColorStop(0.000, 'rgba(255,255,255,0.00)')
  gradH.addColorStop(0.020, 'rgba(255,255,255,0.00)')
  gradH.addColorStop(0.060, 'rgba(255,255,255,0.60)')
  gradH.addColorStop(0.200, 'rgba(255,255,255,0.95)')
  gradH.addColorStop(0.780, 'rgba(255,255,255,1.00)')
  gradH.addColorStop(0.940, 'rgba(255,255,255,1.00)')
  gradH.addColorStop(0.980, 'rgba(255,255,255,0.00)')
  gradH.addColorStop(1.000, 'rgba(255,255,255,0.00)')
  ctx.fillStyle = gradH
  ctx.fillRect(0, 0, 512, 32)

  // Vertical feathering (thin bright core, soft edges)
  const gradV = ctx.createLinearGradient(0, 0, 0, 32)
  gradV.addColorStop(0.00, 'rgba(255,255,255,0.00)')
  gradV.addColorStop(0.20, 'rgba(255,255,255,0.55)')
  gradV.addColorStop(0.50, 'rgba(255,255,255,1.00)')
  gradV.addColorStop(0.80, 'rgba(255,255,255,0.55)')
  gradV.addColorStop(1.00, 'rgba(255,255,255,0.00)')
  ctx.globalCompositeOperation = 'destination-in'
  ctx.fillStyle = gradV
  ctx.fillRect(0, 0, 512, 32)

  const tex = new THREE.CanvasTexture(c)
  return tex
}

// ─── Ribbon geometry (built once per star, updated every frame) ───────────────
const RIBBON_SEGS = 80

const buildRibbonGeo = () => {
  const geo     = new THREE.BufferGeometry()
  const verts   = new Float32Array((RIBBON_SEGS + 1) * 2 * 3)
  const uvs     = new Float32Array((RIBBON_SEGS + 1) * 2 * 2)
  const indices = []

  for (let i = 0; i <= RIBBON_SEGS; i++) {
    const t  = i / RIBBON_SEGS
    const vi = i * 2
    uvs[vi * 2]           = t; uvs[vi * 2 + 1]           = 0
    uvs[(vi + 1) * 2]     = t; uvs[(vi + 1) * 2 + 1]     = 1
    if (i < RIBBON_SEGS) {
      const a = vi, b = vi + 1, c = vi + 2, d = vi + 3
      indices.push(a, b, c, b, d, c)
    }
  }

  geo.setAttribute('position', new THREE.BufferAttribute(verts, 3))
  geo.setAttribute('uv',       new THREE.BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  return geo
}

// ─── Single shooting star ─────────────────────────────────────────────────────
const ShootingStar = ({ starData, logoTex, trailTex }) => {
  const headRef  = useRef()
  const trailRef = useRef()
  const geoRef   = useRef(buildRibbonGeo())
  const _perp    = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const s = starData
    if (s.dead) return

    // Advance
    s.x    += s.vx
    s.y    += s.vy
    s.life += s.lifeSpeed

    // Opacity: fade in over first 8%, hold, fade out over last 20%
    const fadeIn  = Math.min(s.life / 0.08, 1)
    const fadeOut = s.life > 0.80 ? Math.max(0, 1 - (s.life - 0.80) / 0.20) : 1
    const alpha   = fadeIn * fadeOut * s.maxOpacity

    // ── Head ──
    if (headRef.current) {
      headRef.current.position.set(s.x, s.y, s.z)
      headRef.current.material.opacity = alpha
      headRef.current.rotation.z      += 0.012
    }

    // ── Ribbon ──
    if (trailRef.current && geoRef.current) {
      trailRef.current.material.opacity = alpha

      const positions = geoRef.current.attributes.position.array
      const len = Math.sqrt(s.vx * s.vx + s.vy * s.vy) || 1
      const nx  = s.vx / len, ny = s.vy / len
      _perp.set(-ny, nx, 0)

      for (let i = 0; i <= RIBBON_SEGS; i++) {
        const t  = i / RIBBON_SEGS          // 0 = tail, 1 = head
        const px = s.x - nx * s.trailLen * (1 - t)
        const py = s.y - ny * s.trailLen * (1 - t)

        // Ribbon tapers to a point at the tail
        const halfW = s.ribbonHalfW * Math.pow(t, 0.5)

        const top = (i * 2) * 3
        const bot = (i * 2 + 1) * 3
        positions[top]     = px + _perp.x * halfW
        positions[top + 1] = py + _perp.y * halfW
        positions[top + 2] = s.z
        positions[bot]     = px - _perp.x * halfW
        positions[bot + 1] = py - _perp.y * halfW
        positions[bot + 2] = s.z
      }

      geoRef.current.attributes.position.needsUpdate = true
      trailRef.current.geometry = geoRef.current
    }

    if (s.life >= 1 || s.x > HALF_W + 1.5) s.dead = true
  })

  return (
    <group>
      {/* Ribbon trail */}
      <mesh ref={trailRef} geometry={geoRef.current}>
        <meshBasicMaterial
          map={trailTex}
          color={starData.color}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Logo head */}
      <mesh ref={headRef}>
        <planeGeometry args={[0.22, 0.22]} />
        <meshBasicMaterial
          map={logoTex}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// ─── Star factory ─────────────────────────────────────────────────────────────
const COLORS = ['#00d4ff', '#6366f1', '#a78bfa', '#38bdf8', '#ffffff']

const createStar = (id) => {
  // Spawn off LEFT edge, travel to RIGHT edge — mostly horizontal, slight downward tilt
  const y     = (Math.random() - 0.4) * HALF_H * 1.8
  const angle = -(0.06 + Math.random() * 0.12)          // 3–10° downward
  const speed = 0.025 + Math.random() * 0.022            // ~3–5 s to cross screen

  // Life speed normalised so life=1 exactly when star exits right edge
  const totalDist  = HALF_W * 2 + 2.0
  const lifeSpeed  = speed / totalDist

  return {
    id,
    x: -HALF_W - 0.8,
    y,
    z: (Math.random() - 0.5) * 0.4,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 0,
    lifeSpeed,
    maxOpacity:  0.7 + Math.random() * 0.3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    trailLen:    3.5 + Math.random() * 2.5,   // world-space trail length
    ribbonHalfW: 0.06 + Math.random() * 0.08, // ribbon half-width at head
    dead: false,
  }
}

// ─── Manager ──────────────────────────────────────────────────────────────────
const ShootingStarsManager = ({ logoTex, trailTex }) => {
  const [, setVersion]  = useState(0)
  const starsRef  = useRef([])
  const nextId    = useRef(0)
  const lastSpawn = useRef(0)

  // Seed staggered stars on first render so screen isn't empty at start
  if (starsRef.current.length === 0) {
    for (let i = 0; i < 4; i++) {
      const s    = createStar(nextId.current++)
      // Place them mid-flight across the screen
      const frac = (i + 0.5) / 4
      s.x        = -HALF_W + frac * (HALF_W * 2)
      s.life     = frac * 0.7
      starsRef.current.push(s)
    }
  }

  useFrame((state) => {
    const now = state.clock.elapsedTime

    const before = starsRef.current.length
    starsRef.current = starsRef.current.filter(s => !s.dead)
    const removed = before - starsRef.current.length

    // Spawn 1 (or occasionally 2) stars every 1.0–2.2 s, max 7 alive
    const interval = 1.0 + Math.random() * 1.2
    if (starsRef.current.length < 7 && now - lastSpawn.current > interval) {
      const batch = Math.random() < 0.25 ? 2 : 1
      for (let i = 0; i < batch && starsRef.current.length < 7; i++) {
        starsRef.current.push(createStar(nextId.current++))
      }
      lastSpawn.current = now
    }

    if (removed > 0 || (starsRef.current.length > 0 && now - lastSpawn.current < 0.02)) {
      setVersion(v => v + 1)
    }
  })

  return (
    <>
      {starsRef.current.map(s => (
        <ShootingStar key={s.id} starData={s} logoTex={logoTex} trailTex={trailTex} />
      ))}
    </>
  )
}

// ─── HeroScene ────────────────────────────────────────────────────────────────
const HeroScene = ({ onReady }) => {
  const groupRef         = useRef()
  const introProgress    = useRef(0)
  const hasSignaledReady = useRef(false)
  const animStartTime    = useRef(null)

  const logoTex  = useTexture('/logo/Logo_final.svg')
  const trailTex = useMemo(() => makeTrailTexture(), [])

  useFrame((state) => {
    if (animStartTime.current === null) animStartTime.current = state.clock.elapsedTime

    const time         = state.clock.elapsedTime
    const timeSinceStart = time - animStartTime.current

    if (introProgress.current < 1) {
      introProgress.current = Math.min(1, timeSinceStart / 1.2)
      if (introProgress.current >= 0.3 && !hasSignaledReady.current && onReady) {
        hasSignaledReady.current = true
        onReady()
      }
    }

    const easeOutCubic = t => 1 - Math.pow(1 - t, 3)
    const progress     = easeOutCubic(introProgress.current)

    if (groupRef.current) {
      const floatY     = Math.sin(time * 0.4) * 0.12 * progress
      const introScale = 0.7 + 0.3 * progress

      groupRef.current.position.y = floatY
      groupRef.current.position.z = 0
      groupRef.current.scale.setScalar(introScale)
      groupRef.current.rotation.y = time * 0.05

      groupRef.current.traverse(child => {
        if (child.material) {
          child.material.opacity = progress
          child.material.transparent = true
          child.material.userData.introHandled = true
        }
      })
    }
  })

  return (
    <>
      {/* Shooting stars — rendered behind the globe */}
      <ShootingStarsManager logoTex={logoTex} trailTex={trailTex} />

      {/* Main hero scene */}
      <group ref={groupRef} position={[0, 0, 0]}>
        <NeuralNetwork />
      </group>
    </>
  )
}

export default HeroScene