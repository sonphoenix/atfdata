import { useRef, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, useTexture } from '@react-three/drei'
import { 
  JapaneseHouseModel, 
  PizzaModel, 
  PoolModel, 
  RobotEyeModel, 
  MicroPhoneModel,
  CameraTapeModel,
  BooksModel,
  VideogameModel,
  ClapperboardModel,
  ScissorsModel,
  FileShelfModel,
  ChartModel,
  CarModel
} from './Models3D'

// ─── Logo plane for proj-1 ────────────────────────────────────────────────────
// Loads /logo/Logo_final.svg as a texture and renders it on a flat plane above
// the landing pad, same position as the emoji Text nodes on other projects.
const LogoPlane = () => {
  const texture = useTexture('/logo/Logo_final.svg')
  return (
    <mesh position={[0, 2, 0]}>
      {/* 3 units wide, 3 tall — adjust to taste */}
      <planeGeometry args={[3, 3]} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.01}
        depthWrite={false}
      />
    </mesh>
  )
}

export const ProjectNode = ({ 
  node, 
  isActive, 
  isHovered, 
  onClick, 
  onHover
}) => {
  const groupRef = useRef()
  const { project } = node
  const hoverScale = useRef(1)
  
  useFrame((state) => {
    if (groupRef.current) {
      const targetScale = isHovered ? 1.1 : 1
      hoverScale.current += (targetScale - hoverScale.current) * 0.1
      
      let finalScale = hoverScale.current
      if (isActive) {
        const time = state.clock.elapsedTime
        finalScale *= (1 + Math.sin(time * 4) * 0.05)
      }
      
      groupRef.current.scale.setScalar(finalScale)
    }
  })

  return (
    <group 
      position={node.position} 
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation()
        onClick(node.id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover(node.id)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        onHover(null)
      }}
    >
      {/* Yellow landing platform */}
      <mesh position={[0, -0.5, 0]} rotation={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[2.5, 2.5, 0.3, 32]} />
        <meshStandardMaterial
          color={isActive ? "#fbbf24" : (isHovered ? "#fcd34d" : "#fbbf24")}
          emissive={isActive ? "#fbbf24" : (isHovered ? "#fcd34d" : "#f59e0b")}
          emissiveIntensity={isActive ? 0.6 : (isHovered ? 0.5 : 0.4)}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Project icon / 3D model */}
      {node.id === 'proj-1' ? (
        // SVG logo rendered as a texture plane
        <Suspense fallback={
          <Text position={[0, 2, 0]} fontSize={1.5} color="#333333" anchorX="center" anchorY="middle">
            🚀
          </Text>
        }>
          <LogoPlane />
        </Suspense>
      ) : node.id === 'proj-16' && project.hasModel ? (
        <Suspense fallback={
          <Text position={[0, 2, 0]} fontSize={1} color="white" anchorX="center" anchorY="middle">
            🏮
          </Text>
        }>
          <JapaneseHouseModel />
        </Suspense>
      ) : node.id === 'proj-8' && project.hasModel ? (
        <Suspense fallback={
          <Text position={[0, 2, 0]} fontSize={1} color="white" anchorX="center" anchorY="middle">
            🍕
          </Text>
        }>
          <PizzaModel />
        </Suspense>
      ) : node.id === 'proj-4' && project.hasModel ? (
        <Suspense fallback={
          <Text position={[0, 2, 0]} fontSize={1} color="white" anchorX="center" anchorY="middle">
            🏊
          </Text>
        }>
          <PoolModel />
        </Suspense>
      ) : node.id === 'proj-6' && project.hasModel ? (
        <Suspense fallback={
          <Text position={[0, 2, 0]} fontSize={1} color="white" anchorX="center" anchorY="middle">
            🤖
          </Text>
        }>
          <RobotEyeModel />
        </Suspense>
      ) : node.id === 'proj-14' && project.hasModel ? (
        <Suspense fallback={
          <Text position={[0, 2, 0]} fontSize={1} color="white" anchorX="center" anchorY="middle">
            🎵
          </Text>
        }>
          <MicroPhoneModel />
        </Suspense>
      ) : node.id === 'proj-12' && project.hasModel ? (
        <Suspense fallback={
          <Text position={[0, 2, 0]} fontSize={1} color="white" anchorX="center" anchorY="middle">
            📷
          </Text>
        }>
          <CameraTapeModel />
        </Suspense>
      ) : node.id === 'proj-5' && project.hasModel ? (
        <Suspense fallback={
          <Text position={[0, 2, 0]} fontSize={1} color="white" anchorX="center" anchorY="middle">
            📖
          </Text>
        }>
          <BooksModel />
        </Suspense>
      ) : node.id === 'proj-7' && project.hasModel ? (
        <Suspense fallback={
          <Text position={[0, 2, 0]} fontSize={1} color="white" anchorX="center" anchorY="middle">
            🇪🇸
          </Text>
        }>
          <VideogameModel />
        </Suspense>
      ) : node.id === 'proj-2' && project.hasModel ? (
        <Suspense fallback={
          <Text position={[0, 2, 0]} fontSize={1} color="white" anchorX="center" anchorY="middle">
            ✂️
          </Text>
        }>
          <ScissorsModel />
        </Suspense>
      ) : node.id === 'proj-3' && project.hasModel ? (
        <Suspense fallback={
          <Text position={[0, 2, 0]} fontSize={1} color="white" anchorX="center" anchorY="middle">
            🎬
          </Text>
        }>
          <ClapperboardModel />
        </Suspense>
      ) : node.id === 'proj-10' && project.hasModel ? (
        <Suspense fallback={
          <Text position={[0, 2, 0]} fontSize={1} color="white" anchorX="center" anchorY="middle">
            📄
          </Text>
        }>
          <FileShelfModel />
        </Suspense>
      ) : node.id === 'proj-13' && project.hasModel ? (
        <Suspense fallback={
          <Text position={[0, 2, 0]} fontSize={1} color="white" anchorX="center" anchorY="middle">
            📊
          </Text>
        }>
          <ChartModel />
        </Suspense>
      ) : node.id === 'proj-15' && project.hasModel ? (
        <Suspense fallback={
          <Text position={[0, 2, 0]} fontSize={1} color="white" anchorX="center" anchorY="middle">
            🚗
          </Text>
        }>
          <CarModel />
        </Suspense>
      ) : (
        <Text position={[0, 2, 0]} fontSize={1.5} color="#333333" anchorX="center" anchorY="middle">
          {project.image}
        </Text>
      )}
    </group>
  )
}