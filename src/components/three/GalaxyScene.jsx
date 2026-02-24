import { useState, useEffect, useRef, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Player } from './Player'
import { ProjectNode } from './ProjectNode'
import { ConnectionPath, ConnectionParticles } from './Connections'
import { ScenePrewarmer } from './Sceneprewarmer'
import { projectsGraph } from '../data/projectsGraph'
import { findPathBFS } from '../utils/pathFinding'

// Deadzone threshold for analog sticks
const STICK_DEADZONE = 0.4

export const GalaxyScene = ({ 
  onSelectProject, 
  onCurrentProjectChange,
  onRegisterMove,
  selectedProject,
  cameraOffset = { x: 0, y: 7, z: 13 }, 
  cameraLerpSpeed = 0.16,
  onReady,
  zoomMode = false,
  zoomedProject = null
}) => {
  const [currentNodeId, setCurrentNodeId] = useState('proj-1')
  const [playerRotation, setPlayerRotation] = useState(0)
  const [isMoving, setIsMoving] = useState(false)
  const [movementProgress, setMovementProgress] = useState(0)
  const [targetNodeId, setTargetNodeId] = useState(null)
  const [hoveredNodeId, setHoveredNodeId] = useState(null)
  const [path, setPath] = useState([])
  const [currentPathIndex, setCurrentPathIndex] = useState(0)
  const [sceneReady, setSceneReady] = useState(false)
  
  const { camera } = useThree()
  
  const cameraOffsetRef = useRef(new THREE.Vector3(
    cameraOffset.x, 
    cameraOffset.y, 
    cameraOffset.z
  ))
  
  const zoomProgress = useRef(0)
  const zoomStartPos = useRef(new THREE.Vector3())
  const zoomStartLookAt = useRef(new THREE.Vector3())

  // Gamepad state refs (avoid re-renders)
  const gamepadMoveRef = useRef(null)
  const gamepadSelectRef = useRef(false)
  const gamepadRafRef = useRef(null)

  // Stale-closure-safe refs
  const isMovingRef = useRef(false)
  const sceneReadyRef = useRef(false)
  const selectedProjectRef = useRef(null)
  const zoomModeRef = useRef(false)
  const currentNodeIdRef = useRef('proj-1')
  const pathRef = useRef([])
  const currentPathIndexRef = useRef(0)
  const targetNodeIdRef = useRef(null)

  // Keep refs in sync
  useEffect(() => { isMovingRef.current = isMoving }, [isMoving])
  useEffect(() => { sceneReadyRef.current = sceneReady }, [sceneReady])
  useEffect(() => { selectedProjectRef.current = selectedProject }, [selectedProject])
  useEffect(() => { zoomModeRef.current = zoomMode }, [zoomMode])
  useEffect(() => { currentNodeIdRef.current = currentNodeId }, [currentNodeId])
  useEffect(() => { pathRef.current = path }, [path])
  useEffect(() => { currentPathIndexRef.current = currentPathIndex }, [currentPathIndex])
  useEffect(() => { targetNodeIdRef.current = targetNodeId }, [targetNodeId])

  // Notify parent which project the player is currently on
  useEffect(() => {
    const node = projectsGraph.nodes.find(n => n.id === currentNodeId)
    if (node && onCurrentProjectChange) onCurrentProjectChange(node.project)
  }, [currentNodeId, onCurrentProjectChange])

  useEffect(() => {
    cameraOffsetRef.current.set(cameraOffset.x, cameraOffset.y, cameraOffset.z)
  }, [cameraOffset.x, cameraOffset.y, cameraOffset.z])
  
  const targetCameraPosition = useRef(new THREE.Vector3())
  const targetLookAtPosition = useRef(new THREE.Vector3())

  const currentNode = projectsGraph.nodes.find(n => n.id === currentNodeId)
  const targetNode = projectsGraph.nodes.find(n => n.id === targetNodeId)
  
  const zoomedNode = useMemo(() => {
    if (!zoomedProject || !zoomMode) return null
    return projectsGraph.nodes.find(n => n.project.name === zoomedProject.name)
  }, [zoomedProject, zoomMode])

  useEffect(() => {
    if (zoomMode && zoomedNode) {
      zoomProgress.current = 0
      zoomStartPos.current.copy(camera.position)
      
      const currentLookAt = new THREE.Vector3()
      camera.getWorldDirection(currentLookAt)
      currentLookAt.multiplyScalar(10).add(camera.position)
      zoomStartLookAt.current.copy(currentLookAt)
    }
  }, [zoomMode, zoomedNode, camera])

  // ============================================
  // SHARED MOVEMENT LOGIC (keyboard + gamepad + d-pad)
  // ============================================
  const moveInDirection = (dx, dz) => {
    // Guard via refs so it's always safe to call from any context
    if (!sceneReadyRef.current || selectedProjectRef.current || zoomModeRef.current || isMovingRef.current) return

    const nodeId = currentNodeIdRef.current
    const node = projectsGraph.nodes.find(n => n.id === nodeId)
    if (!node) return

    const availableNodes = node.connections
      .map(id => projectsGraph.nodes.find(n => n.id === id))
      .filter(n => n)

    if (availableNodes.length === 0) return

    const currentPos = new THREE.Vector3(...node.position)

    const best = availableNodes.reduce((best, candidate) => {
      const nodePos = new THREE.Vector3(...candidate.position)
      const dir = nodePos.clone().sub(currentPos).normalize()
      const score = dir.x * dx + dir.z * dz
      if (!best || score > best.score) return { node: candidate, score }
      return best
    }, null)

    if (best && best.score > 0.3) {
      setTargetNodeId(best.node.id)
      setIsMoving(true)

      const dir = new THREE.Vector3(...best.node.position)
        .sub(new THREE.Vector3(...node.position))
      setPlayerRotation(Math.atan2(dir.x, dir.z))
    }
  }

  // Register moveInDirection with parent so mobile d-pad can call it
  useEffect(() => {
    if (onRegisterMove) onRegisterMove(moveInDirection)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRegisterMove]) // moveInDirection uses only refs, safe to register once

  // ============================================
  // GAMEPAD POLLING LOOP
  // ============================================
  useEffect(() => {
    const MOVE_COOLDOWN = 400

    const pollGamepad = () => {
      const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : []

      if (pads.length > 0 && sceneReadyRef.current && !selectedProjectRef.current && !zoomModeRef.current && !isMovingRef.current) {
        const pad = pads[0]

        const axisX = pad.axes[0] ?? 0
        const axisY = pad.axes[1] ?? 0

        const dUp    = pad.buttons[12]?.pressed
        const dDown  = pad.buttons[13]?.pressed
        const dLeft  = pad.buttons[14]?.pressed
        const dRight = pad.buttons[15]?.pressed

        const now = Date.now()
        const canMove = !gamepadMoveRef.current || now - gamepadMoveRef.current > MOVE_COOLDOWN

        if (canMove) {
          let dx = 0, dz = 0

          if (Math.abs(axisX) > STICK_DEADZONE) dx = Math.sign(axisX)
          if (Math.abs(axisY) > STICK_DEADZONE) dz = Math.sign(axisY)

          if (dUp)    dz = -1
          if (dDown)  dz =  1
          if (dLeft)  dx = -1
          if (dRight) dx =  1

          if (dx !== 0 || dz !== 0) {
            moveInDirection(dx, dz)
            gamepadMoveRef.current = now
          }
        }

        const aPressed = pad.buttons[0]?.pressed
        if (aPressed && !gamepadSelectRef.current) {
          const node = projectsGraph.nodes.find(n => n.id === currentNodeIdRef.current)
          if (node) onSelectProject(node.project)
        }
        gamepadSelectRef.current = aPressed
      } else if (!isMovingRef.current) {
        gamepadSelectRef.current = false
        gamepadMoveRef.current = null
      }

      gamepadRafRef.current = requestAnimationFrame(pollGamepad)
    }

    gamepadRafRef.current = requestAnimationFrame(pollGamepad)

    return () => {
      if (gamepadRafRef.current) cancelAnimationFrame(gamepadRafRef.current)
    }
  }, [onSelectProject])

  const handleNodeClick = (nodeId) => {
    if (!sceneReady || selectedProject || zoomMode) return
    if (isMoving || nodeId === currentNodeId) return
    
    const pathToTarget = findPathBFS(currentNodeId, nodeId, projectsGraph)
    
    if (pathToTarget && pathToTarget.length > 1) {
      const nextNodeId = pathToTarget[1]
      setPath(pathToTarget)
      setCurrentPathIndex(1)
      setTargetNodeId(nextNodeId)
      setIsMoving(true)
      
      const nextNode = projectsGraph.nodes.find(n => n.id === nextNodeId)
      if (nextNode) {
        const dir = new THREE.Vector3(...nextNode.position)
          .sub(new THREE.Vector3(...currentNode.position))
        setPlayerRotation(Math.atan2(dir.x, dir.z))
      }
    }
  }

  const handleNodeHover = (nodeId) => {
    if (!selectedProject && !zoomMode) {
      setHoveredNodeId(nodeId)
    }
  }

  const playerPosition = useMemo(() => {
    if (!isMoving || !targetNode) return currentNode.position
    
    const from = new THREE.Vector3(...currentNode.position)
    const to = new THREE.Vector3(...targetNode.position)
    const mid = new THREE.Vector3().lerpVectors(from, to, 0.5)
    mid.y += 1.5
    
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to)
    const point = curve.getPoint(movementProgress)
    
    return [point.x, point.y, point.z]
  }, [currentNode, targetNode, isMoving, movementProgress])

  useFrame((state, delta) => {
    if (!currentNode || !sceneReady) return
    
    // ZOOM MODE
    if (zoomMode && zoomedNode) {
      zoomProgress.current = Math.min(zoomProgress.current + delta * 1.2, 1)
      
      const nodePos = new THREE.Vector3(...zoomedNode.position)
      
      const targetZoomPos = new THREE.Vector3()
      targetZoomPos.copy(nodePos)
      targetZoomPos.y += 0.5
      targetZoomPos.z += 2
      
      camera.position.lerpVectors(
        zoomStartPos.current,
        targetZoomPos,
        easeInOutCubic(zoomProgress.current)
      )
      
      const targetLookAt = new THREE.Vector3()
      targetLookAt.copy(nodePos)
      targetLookAt.y += 1
      
      const currentLookAt = new THREE.Vector3()
      currentLookAt.lerpVectors(
        zoomStartLookAt.current,
        targetLookAt,
        easeInOutCubic(zoomProgress.current)
      )
      
      camera.lookAt(currentLookAt)
      return
    }
    
    // NORMAL MODE
    const playerPos = new THREE.Vector3(...playerPosition)
    
    targetCameraPosition.current.copy(playerPos).add(cameraOffsetRef.current)
    
    if (isMoving && targetNode) {
      const targetPos = new THREE.Vector3(...targetNode.position)
      targetLookAtPosition.current.lerpVectors(playerPos, targetPos, 0.3)
    } else {
      targetLookAtPosition.current.copy(playerPos)
    }
    
    camera.position.lerp(targetCameraPosition.current, cameraLerpSpeed)
    
    const currentLookAt = new THREE.Vector3()
    camera.getWorldDirection(currentLookAt)
    currentLookAt.multiplyScalar(10).add(camera.position)
    currentLookAt.lerp(targetLookAtPosition.current, cameraLerpSpeed)
    
    camera.lookAt(currentLookAt)
    
    if (isMoving && targetNode && !selectedProject && !zoomMode) {
      setMovementProgress(prev => {
        const newProgress = Math.min(prev + 0.025, 1)
        
        if (newProgress >= 1) {
          const newPathIndex = currentPathIndex + 1
          
          if (newPathIndex < path.length) {
            const nextNodeId = path[newPathIndex]
            setCurrentPathIndex(newPathIndex)
            setCurrentNodeId(targetNodeId)
            setTargetNodeId(nextNodeId)
            setMovementProgress(0)
            
            const nextNode = projectsGraph.nodes.find(n => n.id === nextNodeId)
            const currentPos = projectsGraph.nodes.find(n => n.id === targetNodeId).position
            if (nextNode) {
              const dir = new THREE.Vector3(...nextNode.position)
                .sub(new THREE.Vector3(...currentPos))
              setPlayerRotation(Math.atan2(dir.x, dir.z))
            }
          } else {
            setIsMoving(false)
            setCurrentNodeId(targetNodeId)
            setTargetNodeId(null)
            setMovementProgress(0)
            setPath([])
            setCurrentPathIndex(0)
          }
        }
        
        return newProgress
      })
    }
  })

  // ============================================
  // KEYBOARD HANDLER
  // ============================================
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!sceneReady || selectedProject || zoomMode) return
      if (isMoving) return

      const key = e.key.toLowerCase()

      if (key === 'enter' || key === ' ') {
        onSelectProject(currentNode.project)
        return
      }

      const dirMap = {
        arrowup:    [0, -1],
        w:          [0, -1],
        arrowdown:  [0,  1],
        s:          [0,  1],
        arrowright: [1,  0],
        d:          [1,  0],
        arrowleft:  [-1, 0],
        a:          [-1, 0],
      }

      const dir = dirMap[key]
      if (!dir) return

      // Reuse the shared moveInDirection (refs are already up to date)
      const connections = currentNode.connections
      const availableNodes = connections
        .map(id => projectsGraph.nodes.find(n => n.id === id))
        .filter(n => n)

      if (availableNodes.length === 0) return

      const currentPos = new THREE.Vector3(...currentNode.position)
      const [dx, dz] = dir

      const best = availableNodes.reduce((best, node) => {
        const nodePos = new THREE.Vector3(...node.position)
        const d = nodePos.clone().sub(currentPos).normalize()
        const score = d.x * dx + d.z * dz
        if (!best || score > best.score) return { node, score }
        return best
      }, null)

      if (best && best.score > 0.3) {
        setTargetNodeId(best.node.id)
        setIsMoving(true)
        const d = new THREE.Vector3(...best.node.position)
          .sub(new THREE.Vector3(...currentNode.position))
        setPlayerRotation(Math.atan2(d.x, d.z))
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentNodeId, isMoving, currentNode, onSelectProject, selectedProject, sceneReady, zoomMode])

  const handleSceneReady = () => {
    console.log('🎨 GalaxyScene ready!')
    setSceneReady(true)
    if (onReady) onReady()
  }

  return (
    <>
      <ScenePrewarmer onReady={handleSceneReady} />

      <color attach="background" args={[zoomMode ? '#0a0a0f' : '#ffffff']} />

      <ambientLight intensity={zoomMode ? 0.5 : 1.2} />
      
      <directionalLight 
        position={[50, 40, 0]} 
        intensity={2.0} 
        color="#ffffff" 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      
      {zoomMode && zoomedNode && (
        <>
          <pointLight 
            position={[zoomedNode.position[0], zoomedNode.position[1] + 5, zoomedNode.position[2] + 5]} 
            intensity={2.0} color="#FFD700" distance={20} 
          />
          <pointLight 
            position={[zoomedNode.position[0] - 5, zoomedNode.position[1] + 3, zoomedNode.position[2]]} 
            intensity={1.5} color="#4a9eff" distance={15} 
          />
          <pointLight 
            position={[zoomedNode.position[0] + 5, zoomedNode.position[1] + 3, zoomedNode.position[2]]} 
            intensity={1.5} color="#FFA500" distance={15} 
          />
        </>
      )}
      
      <directionalLight position={[-50, 30, -30]} intensity={1.0} color="#ffffff" />
      <directionalLight position={[0, 30, 50]} intensity={1.0} color="#ffffff" />
      
      <pointLight position={[20, 20, -15]} intensity={2.0} color="#6366f1" distance={80} />
      <pointLight position={[70, 20, -15]} intensity={2.0} color="#8b5cf6" distance={80} />
      <pointLight position={[120, 20, -15]} intensity={2.0} color="#a78bfa" distance={80} />
      <pointLight position={[20, 20, 15]} intensity={2.0} color="#22d3ee" distance={60} />
      <pointLight position={[-30, 25, 0]} intensity={1.5} color="#fbbf24" distance={50} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[50, -1, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <shadowMaterial transparent opacity={0.15} />
      </mesh>

      {!zoomMode && (
        <>
          {projectsGraph.nodes.map(node => (
            <ProjectNode
              key={node.id}
              node={node}
              isActive={node.id === currentNodeId}
              isHovered={node.id === hoveredNodeId}
              onClick={handleNodeClick}
              onHover={handleNodeHover}
            />
          ))}

          {projectsGraph.nodes.map(node =>
            node.connections.map(connId => {
              const targetNode = projectsGraph.nodes.find(n => n.id === connId)
              if (!targetNode) return null
              return (
                <group key={`${node.id}-${connId}`}>
                  <ConnectionPath
                    from={node.position}
                    to={targetNode.position}
                    fromId={node.id}
                    toId={targetNode.id}
                    active={node.id === currentNodeId || targetNode.id === currentNodeId}
                  />
                  <ConnectionParticles
                    from={node.position}
                    to={targetNode.position}
                    fromId={node.id}
                    toId={targetNode.id}
                  />
                </group>
              )
            })
          )}

          <Player position={playerPosition} rotation={playerRotation} />
        </>
      )}
    </>
  )
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}