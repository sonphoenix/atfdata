import { useRef, useMemo, useState } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import { RenderTexture, PerspectiveCamera, shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { projectsGraph } from '../data/projectsGraph'

const portalEdgeVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vUv = uv;
  }
`

const portalEdgeFrag = /* glsl */ `
  uniform float uTime;
  uniform vec3  uColorStart;
  uniform vec3  uColorEnd;
  uniform float uStrength;
  varying vec2  vUv;

  vec4 _permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 _taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }
  vec3 _fade(vec3 t){ return t*t*t*(t*(t*6.0-15.0)+10.0); }

  float cnoise(vec3 P){
    vec3 Pi0=floor(P), Pi1=Pi0+1.0;
    Pi0=mod(Pi0,289.0); Pi1=mod(Pi1,289.0);
    vec3 Pf0=fract(P), Pf1=Pf0-1.0;
    vec4 ix=vec4(Pi0.x,Pi1.x,Pi0.x,Pi1.x);
    vec4 iy=vec4(Pi0.yy,Pi1.yy);
    vec4 iz0=Pi0.zzzz, iz1=Pi1.zzzz;
    vec4 ixy =_permute(_permute(ix)+iy);
    vec4 ixy0=_permute(ixy+iz0), ixy1=_permute(ixy+iz1);
    vec4 gx0=ixy0/7.0; vec4 gy0=fract(floor(gx0)/7.0)-0.5; gx0=fract(gx0);
    vec4 gz0=0.5-abs(gx0)-abs(gy0); vec4 sz0=step(gz0,vec4(0.0));
    gx0-=sz0*(step(0.0,gx0)-0.5); gy0-=sz0*(step(0.0,gy0)-0.5);
    vec4 gx1=ixy1/7.0; vec4 gy1=fract(floor(gx1)/7.0)-0.5; gx1=fract(gx1);
    vec4 gz1=0.5-abs(gx1)-abs(gy1); vec4 sz1=step(gz1,vec4(0.0));
    gx1-=sz1*(step(0.0,gx1)-0.5); gy1-=sz1*(step(0.0,gy1)-0.5);
    vec3 g000=vec3(gx0.x,gy0.x,gz0.x), g100=vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010=vec3(gx0.z,gy0.z,gz0.z), g110=vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001=vec3(gx1.x,gy1.x,gz1.x), g101=vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011=vec3(gx1.z,gy1.z,gz1.z), g111=vec3(gx1.w,gy1.w,gz1.w);
    vec4 norm0=_taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
    g000*=norm0.x; g010*=norm0.y; g100*=norm0.z; g110*=norm0.w;
    vec4 norm1=_taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
    g001*=norm1.x; g011*=norm1.y; g101*=norm1.z; g111*=norm1.w;
    float n000=dot(g000,Pf0); float n100=dot(g100,vec3(Pf1.x,Pf0.yz));
    float n010=dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z)); float n110=dot(g110,vec3(Pf1.xy,Pf0.z));
    float n001=dot(g001,vec3(Pf0.xy,Pf1.z)); float n101=dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z));
    float n011=dot(g011,vec3(Pf0.x,Pf1.yz)); float n111=dot(g111,Pf1);
    vec3 fade_xyz=_fade(Pf0);
    vec4 n_z=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);
    vec2 n_yz=mix(n_z.xy,n_z.zw,fade_xyz.y);
    return 2.2*mix(n_yz.x,n_yz.y,fade_xyz.x);
  }

  void main() {
    vec2 displacedUv = vUv + cnoise(vec3(vUv * 7.0, uTime * 0.1)) * 0.3;
    float strength    = cnoise(vec3(displacedUv * 5.0, uTime * 0.2));
    float outerGlow   = distance(vUv, vec2(0.5)) * 4.0 - 1.4;
    strength += outerGlow;
    strength += step(-0.2, strength) * 0.8;
    strength  = clamp(strength, 0.0, 1.0);
    vec3 color = mix(uColorStart, uColorEnd, strength);
    float ring  = distance(vUv, vec2(0.5));
    float alpha = smoothstep(0.35, 0.5, ring) * uStrength;
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

const PortalSurfaceFrag = /* glsl */ `
  uniform float     uTime;
  uniform sampler2D uTexture;
  uniform float     uStrength;
  varying vec2 vUv;

  vec4 _permute2(vec4 x){ return mod(((x*34.0)+1.0)*x,289.0); }
  vec4 _taylorInvSqrt2(vec4 r){ return 1.79284291400159-0.85373472095314*r; }
  vec3 _fade2(vec3 t){ return t*t*t*(t*(t*6.0-15.0)+10.0); }
  float cnoise2(vec3 P){
    vec3 Pi0=floor(P),Pi1=Pi0+1.0; Pi0=mod(Pi0,289.0);Pi1=mod(Pi1,289.0);
    vec3 Pf0=fract(P),Pf1=Pf0-1.0;
    vec4 ix=vec4(Pi0.x,Pi1.x,Pi0.x,Pi1.x); vec4 iy=vec4(Pi0.yy,Pi1.yy);
    vec4 ixy=_permute2(_permute2(ix)+iy);
    vec4 ixy0=_permute2(ixy+Pi0.zzzz),ixy1=_permute2(ixy+Pi1.zzzz);
    vec4 gx0=ixy0/7.0;vec4 gy0=fract(floor(gx0)/7.0)-0.5;gx0=fract(gx0);
    vec4 gz0=0.5-abs(gx0)-abs(gy0);vec4 sz0=step(gz0,vec4(0.0));
    gx0-=sz0*(step(0.0,gx0)-0.5);gy0-=sz0*(step(0.0,gy0)-0.5);
    vec4 gx1=ixy1/7.0;vec4 gy1=fract(floor(gx1)/7.0)-0.5;gx1=fract(gx1);
    vec4 gz1=0.5-abs(gx1)-abs(gy1);vec4 sz1=step(gz1,vec4(0.0));
    gx1-=sz1*(step(0.0,gx1)-0.5);gy1-=sz1*(step(0.0,gy1)-0.5);
    vec3 g000=vec3(gx0.x,gy0.x,gz0.x),g100=vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010=vec3(gx0.z,gy0.z,gz0.z),g110=vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001=vec3(gx1.x,gy1.x,gz1.x),g101=vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011=vec3(gx1.z,gy1.z,gz1.z),g111=vec3(gx1.w,gy1.w,gz1.w);
    vec4 n0=_taylorInvSqrt2(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
    g000*=n0.x;g010*=n0.y;g100*=n0.z;g110*=n0.w;
    vec4 n1=_taylorInvSqrt2(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
    g001*=n1.x;g011*=n1.y;g101*=n1.z;g111*=n1.w;
    float n000=dot(g000,Pf0),n100=dot(g100,vec3(Pf1.x,Pf0.yz));
    float n010=dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z)),n110=dot(g110,vec3(Pf1.xy,Pf0.z));
    float n001=dot(g001,vec3(Pf0.xy,Pf1.z)),n101=dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z));
    float n011=dot(g011,vec3(Pf0.x,Pf1.yz)),n111=dot(g111,Pf1);
    vec3 fxyz=_fade2(Pf0);
    vec4 nz=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fxyz.z);
    vec2 nyz=mix(nz.xy,nz.zw,fxyz.y);
    return 2.2*mix(nyz.x,nyz.y,fxyz.x);
  }

  void main() {
    float warp    = cnoise2(vec3(vUv * 3.0, uTime * 0.05)) * 0.015 * uStrength;
    vec4  tex     = texture2D(uTexture, vUv + warp);
    float dist    = distance(vUv, vec2(0.5));
    float vignette= 1.0 - smoothstep(0.3, 0.5, dist) * 0.8;
    gl_FragColor  = vec4(tex.rgb * vignette, uStrength);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

const PortalEdgeMaterial = shaderMaterial(
  { uTime: 0, uColorStart: new THREE.Color('#00aaff'), uColorEnd: new THREE.Color('#ffffff'), uStrength: 1.0 },
  portalEdgeVert, portalEdgeFrag
)
const PortalSurfaceMaterial = shaderMaterial(
  { uTime: 0, uTexture: null, uStrength: 1.0 },
  portalEdgeVert, PortalSurfaceFrag
)
extend({ PortalEdgeMaterial, PortalSurfaceMaterial })

// ─────────────────────────────────────────────────────────────────────────────
// STATIC GALAXY SNAPSHOT — white bg, heavy nodes, zero interactivity
// ─────────────────────────────────────────────────────────────────────────────
const StaticGalaxyView = () => {
  const { nodePositions, nodeColors, connectionPoints } = useMemo(() => {
    const nodePositions = []
    const nodeColors    = []
    const palette = ['#6366f1', '#22d3ee', '#fbbf24', '#a78bfa', '#34d399', '#f472b6', '#60a5fa']

    projectsGraph.nodes.forEach((node, i) => {
      nodePositions.push(new THREE.Vector3(...node.position))
      nodeColors.push(new THREE.Color(palette[i % palette.length]))
    })

    const connectionPoints = []
    const seen = new Set()
    projectsGraph.nodes.forEach(node => {
      node.connections.forEach(connId => {
        const key = [node.id, connId].sort().join('-')
        if (seen.has(key)) return
        seen.add(key)
        const target = projectsGraph.nodes.find(n => n.id === connId)
        if (!target) return
        connectionPoints.push(
          new THREE.Vector3(...node.position),
          new THREE.Vector3(...target.position)
        )
      })
    })

    return { nodePositions, nodeColors, connectionPoints }
  }, [])

  const instancedRef = useRef()
  const glowRef      = useRef()

  useMemo(() => {
    const apply = (mesh) => {
      if (!mesh) return
      const dummy = new THREE.Object3D()
      nodePositions.forEach((pos, i) => {
        dummy.position.copy(pos)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
        mesh.setColorAt(i, nodeColors[i])
      })
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }
    apply(instancedRef.current)
    apply(glowRef.current)
  })

  const linesGeometry = useMemo(() =>
    new THREE.BufferGeometry().setFromPoints(connectionPoints),
  [connectionPoints])

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 15, 55]} fov={75} />

      {/* White background matching the real GalaxyScene */}
      <color attach="background" args={['#ffffff']} />

      <ambientLight intensity={1.4} />
      <directionalLight position={[50, 40, 0]}   intensity={2.5} color="#ffffff" />
      <directionalLight position={[-50, 30, -30]} intensity={1.2} color="#ffffff" />
      <pointLight position={[20,  20, -15]} intensity={4} color="#6366f1" distance={120} />
      <pointLight position={[70,  20, -15]} intensity={4} color="#22d3ee" distance={120} />
      <pointLight position={[120, 20, -15]} intensity={3} color="#a78bfa" distance={120} />
      <pointLight position={[20,  20,  15]} intensity={3} color="#fbbf24" distance={100} />
      <pointLight position={[-30, 25,   0]} intensity={2} color="#f472b6" distance={80}  />

      <lineSegments geometry={linesGeometry}>
        <lineBasicMaterial color="#94a3b8" transparent opacity={0.55} />
      </lineSegments>

      <instancedMesh ref={instancedRef} args={[null, null, nodePositions.length]} frustumCulled={false}>
        <sphereGeometry args={[0.75, 20, 20]} />
        <meshStandardMaterial roughness={0.2} metalness={0.5} toneMapped={false} />
      </instancedMesh>

      <instancedMesh ref={glowRef} args={[null, null, nodePositions.length]} frustumCulled={false}>
        <sphereGeometry args={[1.3, 10, 10]} />
        <meshBasicMaterial
          transparent opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false} toneMapped={false}
        />
      </instancedMesh>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
const PORTAL_RADIUS   = 1.8
const OVAL_SCALE_Y    = 1.4
const RIM_TUBE_RADIUS = 0.09

const PortalOval = ({ openProgress, isHovered }) => {
  const edgeRef    = useRef()
  const surfaceRef = useRef()
  const rimRef     = useRef()
  const glowRef    = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const s = openProgress
    if (edgeRef.current) {
      edgeRef.current.uTime     = t
      edgeRef.current.uStrength = s * (isHovered ? 1.3 : 1.0)
    }
    if (surfaceRef.current) {
      surfaceRef.current.uTime     = t
      surfaceRef.current.uStrength = s
    }
    if (rimRef.current)  rimRef.current.emissiveIntensity  = s * (isHovered ? 6.0 : 3.5)
    if (glowRef.current) glowRef.current.emissiveIntensity = s * (isHovered ? 3.5 : 1.5)
  })

  return (
    <group>
      <mesh scale={[1, OVAL_SCALE_Y, 1]}>
        <circleGeometry args={[PORTAL_RADIUS, 128]} />
        <portalSurfaceMaterial ref={surfaceRef} transparent depthWrite={false}>
          {/* frames={1}: render once, never again */}
          <RenderTexture attach="uTexture" width={384} height={384} anisotropy={2} frames={1}>
            <StaticGalaxyView />
          </RenderTexture>
        </portalSurfaceMaterial>
      </mesh>

      <mesh scale={[1, OVAL_SCALE_Y, 1]}>
        <ringGeometry args={[PORTAL_RADIUS * 0.88, PORTAL_RADIUS * 1.06, 128]} />
        <portalEdgeMaterial
          ref={edgeRef} transparent depthWrite={false}
          blending={THREE.AdditiveBlending} side={THREE.DoubleSide}
        />
      </mesh>

      <mesh scale={[1, OVAL_SCALE_Y, 1]}>
        <torusGeometry args={[PORTAL_RADIUS, RIM_TUBE_RADIUS, 20, 200]} />
        <meshStandardMaterial
          ref={rimRef} color="#00aaff" emissive="#00aaff"
          emissiveIntensity={3.5} metalness={0} roughness={0} toneMapped={false}
        />
      </mesh>

      <mesh scale={[1, OVAL_SCALE_Y, 1]}>
        <torusGeometry args={[PORTAL_RADIUS, RIM_TUBE_RADIUS * 2.8, 12, 200]} />
        <meshStandardMaterial
          ref={glowRef} color="#00cfff" emissive="#00cfff"
          emissiveIntensity={1.5} transparent opacity={0.25}
          toneMapped={false} blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

const RimParticles = ({ openProgress }) => {
  const ref = useRef()
  const { positions, count } = useMemo(() => {
    const count = 120
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      const r = PORTAL_RADIUS + (Math.random() - 0.5) * 0.3
      positions[i * 3]     = Math.cos(a) * r
      positions[i * 3 + 1] = Math.sin(a) * r * OVAL_SCALE_Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.15
    }
    return { positions, count }
  }, [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position.array
    const t   = clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + t * 0.35
      const r     = PORTAL_RADIUS + Math.sin(t * 1.5 + i * 0.3) * 0.2
      pos[i * 3]     = Math.cos(angle) * r
      pos[i * 3 + 1] = Math.sin(angle) * r * OVAL_SCALE_Y
      pos[i * 3 + 2] = Math.sin(t * 2.0 + i * 0.1) * 0.1 * openProgress
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04} color="#88ddff" transparent opacity={openProgress * 0.9}
        blending={THREE.AdditiveBlending} sizeAttenuation depthWrite={false}
      />
    </points>
  )
}

const PortalLights = ({ openProgress, isHovered }) => {
  const frontRef = useRef()
  const backRef  = useRef()
  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.5) * 0.12
    const base  = openProgress * pulse * (isHovered ? 1.6 : 1.0)
    if (frontRef.current) frontRef.current.intensity = base * 4
    if (backRef.current)  backRef.current.intensity  = base * 2
  })
  return (
    <>
      <pointLight ref={frontRef} position={[0, 0,  0.8]} distance={12} color="#00aaff" intensity={0} />
      <pointLight ref={backRef}  position={[0, 0, -0.8]} distance={8}  color="#0066cc" intensity={0} />
    </>
  )
}

const Portal3DScene = ({
  openProgress  = 0,
  isZooming     = false,
  onPortalClick = null,
  zoomProgress  = 0,
}) => {
  const groupRef = useRef()
  const tiltRef  = useRef()
  const [isHovered, setIsHovered] = useState(false)

  const mouse       = useRef({ x: 0, y: 0 })
  const smoothMouse = useRef({ x: 0, y: 0 })

  const { size } = useThree()
  const initialZ = useRef(null)

  const handlePointerMove = (e) => {
    mouse.current.x =  (e.clientX / size.width)  * 2 - 1
    mouse.current.y = -(e.clientY / size.height)  * 2 + 1
    if (openProgress > 0.5 && !isZooming) {
      const dist = Math.sqrt(mouse.current.x ** 2 + mouse.current.y ** 2)
      setIsHovered(dist < 0.45)
    }
  }

  const handleClick = () => {
    if (isHovered && openProgress > 0.7 && onPortalClick && !isZooming) onPortalClick()
  }

  useFrame(({ clock, camera: cam }) => {
    if (!groupRef.current) return
    if (initialZ.current === null) initialZ.current = cam.position.z

    smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * 0.06
    smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * 0.06

    if (isZooming && zoomProgress > 0) {
      cam.position.z = THREE.MathUtils.lerp(initialZ.current, initialZ.current - 15, zoomProgress)
      cam.fov        = THREE.MathUtils.lerp(50, 80, zoomProgress)
      cam.updateProjectionMatrix()
      const zs = 1 + zoomProgress * 6
      groupRef.current.scale.set(zs, zs, zs)
    } else {
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.45) * 0.08
      groupRef.current.scale.set(1, 1, 1)

      if (tiltRef.current && openProgress > 0.5) {
        const tiltMax    = isHovered ? 0.55 : 0.12
        const targetRotY =  smoothMouse.current.x * tiltMax
        const targetRotX = -smoothMouse.current.y * tiltMax * 0.55
        tiltRef.current.rotation.y += (targetRotY - tiltRef.current.rotation.y) * 0.07
        tiltRef.current.rotation.x += (targetRotX - tiltRef.current.rotation.x) * 0.07
        const cs = tiltRef.current.scale.x
        tiltRef.current.scale.setScalar(cs + ((isHovered ? 1.10 : 1.0) - cs) * 0.07)
      } else if (tiltRef.current) {
        tiltRef.current.rotation.y *= 0.92
        tiltRef.current.rotation.x *= 0.92
        const cs = tiltRef.current.scale.x
        tiltRef.current.scale.setScalar(cs + (1 - cs) * 0.07)
      }
    }
  })

  return (
    <group
      ref={groupRef}
      position={[0, 0, -2]}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
    >
      <group scale={[0.05 + openProgress * 0.95, 0.05 + openProgress * 0.95, 0.05 + openProgress * 0.95]}>
        <group ref={tiltRef}>
          <PortalOval   openProgress={openProgress} isHovered={isHovered} />
          <RimParticles openProgress={openProgress} />
          <PortalLights openProgress={openProgress} isHovered={isHovered} />
        </group>
      </group>
    </group>
  )
}

export default Portal3DScene