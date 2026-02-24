import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

// Preload all models
useGLTF.preload('/models/japanese_house_banner/scene.gltf')
useGLTF.preload('/models/pizza/scene.gltf')
useGLTF.preload('/models/pool/scene.gltf')
useGLTF.preload('/models/robot_eye/fixed_scene.glb')
useGLTF.preload('/models/mircophone/scene.gltf')
useGLTF.preload('/models/camera_tape/vintage_camera.glb')
useGLTF.preload('/models/book/Books.glb')
useGLTF.preload('/models/videogame/Videogame.glb')
useGLTF.preload('/models/clapperboard/clapperboard.glb')
useGLTF.preload('/models/scissors/scissors.glb')
useGLTF.preload('/models/pdf/file_shelf.glb')
useGLTF.preload('/models/stats/statistic_charts.glb') // UPDATED PATH

// Japanese House Model for HiraganaGo (proj-16)
export const JapaneseHouseModel = ({ modelSettings = { position: [0, 3.7, 0], rotation: [0, 0, 0], scale: [3, 3, 3], autoRotate: true } }) => {
  const { scene } = useGLTF('/models/japanese_house_banner/scene.gltf')
  const houseRef = useRef()
  
  useFrame((state) => {
    if (houseRef.current && modelSettings.autoRotate) {
      const time = state.clock.elapsedTime
      houseRef.current.rotation.y = time * 0.5
    }
  })
  
  return (
    <primitive 
      ref={houseRef}
      object={scene.clone()} 
      scale={modelSettings.scale} 
      position={modelSettings.position} 
      rotation={modelSettings.rotation}
    />
  )
}

// Pizza Model for Food Delivery Platform (proj-8)
export const PizzaModel = ({ modelSettings = { position: [0, 2, 0], rotation: [-0.14, -0.84, -0.34], scale: [2, 2, 2], autoRotate: true } }) => {
  const { scene } = useGLTF('/models/pizza/scene.gltf')
  const pizzaRef = useRef()
  
  useFrame((state) => {
    if (pizzaRef.current && modelSettings.autoRotate) {
      const time = state.clock.elapsedTime
      pizzaRef.current.rotation.y = time * 0.5
    }
  })
  
  return (
    <primitive 
      ref={pizzaRef}
      object={scene.clone()} 
      scale={modelSettings.scale} 
      position={modelSettings.position} 
      rotation={modelSettings.rotation}
    />
  )
}

// Pool Model for Swimming Club Management (proj-4)
export const PoolModel = ({ modelSettings = { position: [0, 1.5, 0], rotation: [0, 0, 0], scale: [0.018, 0.018, 0.018], autoRotate: true } }) => {
  const { scene } = useGLTF('/models/pool/scene.gltf')
  const poolRef = useRef()
  
  useFrame((state) => {
    if (poolRef.current && modelSettings.autoRotate) {
      const time = state.clock.elapsedTime
      poolRef.current.rotation.y = time * 0.5
    }
  })
  
  return (
    <primitive 
      ref={poolRef}
      object={scene.clone()} 
      scale={modelSettings.scale} 
      position={modelSettings.position} 
      rotation={modelSettings.rotation}
    />
  )
}

// Robot Eye Model for AI Image Detector API (proj-6)
export const RobotEyeModel = ({ modelSettings = { position: [0, 2.5, 0], rotation: [0, 0, 0], scale: [12, 12, 12], autoRotate: true } }) => {
  const { scene } = useGLTF('/models/robot_eye/fixed_scene.glb')
  const eyeRef = useRef()
  
  useFrame((state) => {
    if (eyeRef.current && modelSettings.autoRotate) {
      const time = state.clock.elapsedTime
      eyeRef.current.rotation.y = time * 0.5
    }
  })
  
  return (
    <primitive 
      ref={eyeRef}
      object={scene.clone()} 
      scale={modelSettings.scale} 
      position={modelSettings.position} 
      rotation={modelSettings.rotation}
    />
  )
}

// Microphone Model for VoiceRemovingAI Web App (proj-14)
export const MicroPhoneModel = ({ modelSettings = { position: [0, 2, 0], rotation: [0, 0, 0], scale: [13, 13, 13], autoRotate: true } }) => {
  const { scene } = useGLTF('/models/mircophone/scene.gltf')
  const microPhoneRef = useRef()
  
  useFrame((state) => {
    if (microPhoneRef.current && modelSettings.autoRotate) {
      const time = state.clock.elapsedTime
      microPhoneRef.current.rotation.y = time * 0.5
    }
  })
  
  return (
    <primitive 
      ref={microPhoneRef}
      object={scene.clone()} 
      scale={modelSettings.scale} 
      position={modelSettings.position} 
      rotation={modelSettings.rotation}
    />
  )
}

// Camera Tape Model for Laravel-Video-Tools (proj-12)
export const CameraTapeModel = ({ modelSettings = { position: [0, 2, 0], rotation: [0, 0, 0], scale: [4, 4, 4], autoRotate: true } }) => {
  const { scene } = useGLTF('/models/camera_tape/vintage_camera.glb')
  const cameraTypeRef = useRef()
  
  useFrame((state) => {
    if (cameraTypeRef.current && modelSettings.autoRotate) {
      const time = state.clock.elapsedTime
      cameraTypeRef.current.rotation.y = time * 0.5
    }
  })
  
  return (
    <primitive 
      ref={cameraTypeRef}
      object={scene.clone()} 
      scale={modelSettings.scale} 
      position={modelSettings.position} 
      rotation={modelSettings.rotation}
    />
  )
}

// Books Model for Religious Text Analysis (proj-5)
export const BooksModel = ({ modelSettings = { position: [0, 2, 0], rotation: [0, 0, 0], scale: [15, 15, 15], autoRotate: true } }) => {
  const { scene } = useGLTF('/models/book/Books.glb')
  const booksRef = useRef()
  
  useFrame((state) => {
    if (booksRef.current && modelSettings.autoRotate) {
      const time = state.clock.elapsedTime
      booksRef.current.rotation.y = time * 0.5
    }
  })
  
  return (
    <primitive 
      ref={booksRef}
      object={scene.clone()} 
      scale={modelSettings.scale} 
      position={modelSettings.position} 
      rotation={modelSettings.rotation}
    />
  )
}

// Videogame Model for Spanish Open Data Ingestion (proj-7)
export const VideogameModel = ({ modelSettings = { position: [0, 2, 0], rotation: [0, 0, 0], scale: [0.2, 0.2, 0.2], autoRotate: true } }) => {
  const { scene } = useGLTF('/models/videogame/Videogame.glb')
  const videogameRef = useRef()
  
  useFrame((state) => {
    if (videogameRef.current && modelSettings.autoRotate) {
      const time = state.clock.elapsedTime
      videogameRef.current.rotation.y = time * 0.5
    }
  })
  
  return (
    <primitive 
      ref={videogameRef}
      object={scene.clone()} 
      scale={modelSettings.scale} 
      position={modelSettings.position} 
      rotation={modelSettings.rotation}
    />
  )
}

// Clapperboard Model for ETL Movies Pipeline (proj-3 - DATA path)
export const ClapperboardModel = ({ modelSettings = { position: [0, 2, 0], rotation: [0, 0, 0], scale: [0.1, 0.1, 0.1], autoRotate: true } }) => {
  const { scene } = useGLTF('/models/clapperboard/clapperboard.glb')
  const clapperboardRef = useRef()
  
  useFrame((state) => {
    if (clapperboardRef.current && modelSettings.autoRotate) {
      const time = state.clock.elapsedTime
      clapperboardRef.current.rotation.y = time * 0.5
    }
  })
  
  return (
    <primitive 
      ref={clapperboardRef}
      object={scene.clone()} 
      scale={modelSettings.scale} 
      position={modelSettings.position} 
      rotation={modelSettings.rotation}
    />
  )
}

// Scissors Model for YouTube Video Trimmer (proj-2 - SOFTWARE path)
export const ScissorsModel = ({ modelSettings = { position: [0, 2, 0], rotation: [3, 1, 4], scale: [8,8,8], autoRotate: true } }) => {
  const { scene } = useGLTF('/models/scissors/scissors.glb')
  const scissorsRef = useRef()
  
  useFrame((state) => {
    if (scissorsRef.current && modelSettings.autoRotate) {
      const time = state.clock.elapsedTime
      scissorsRef.current.rotation.y = time * 0.5
    }
  })
  
  return (
    <primitive 
      ref={scissorsRef}
      object={scene.clone()} 
      scale={modelSettings.scale} 
      position={modelSettings.position} 
      rotation={modelSettings.rotation}
    />
  )
}

// File Shelf Model for PPT to PDF Converter (proj-10 - SOFTWARE path)
export const FileShelfModel = ({ modelSettings = { position: [0, 2, 0], rotation: [0, 0, 0], scale: [2, 2, 2], autoRotate: true } }) => {
  const { scene } = useGLTF('/models/pdf/file_shelf.glb')
  const fileShelfRef = useRef()
  
  useFrame((state) => {
    if (fileShelfRef.current && modelSettings.autoRotate) {
      const time = state.clock.elapsedTime
      fileShelfRef.current.rotation.y = time * 0.5
    }
  })
  
  return (
    <primitive 
      ref={fileShelfRef}
      object={scene.clone()} 
      scale={modelSettings.scale} 
      position={modelSettings.position} 
      rotation={modelSettings.rotation}
    />
  )
}

// Chart Model for EU GDP ELT Pipeline (proj-13 - DATA path)
export const ChartModel = ({ modelSettings = { position: [0, 2, 0], rotation: [0, 0, 0], scale: [1, 1, 1], autoRotate: true } }) => {
  const { scene } = useGLTF('/models/stats/statistic_charts.glb') // UPDATED PATH
  const chartRef = useRef()
  
  useFrame((state) => {
    if (chartRef.current && modelSettings.autoRotate) {
      const time = state.clock.elapsedTime
      chartRef.current.rotation.y = time * 0.5
    }
  })
  
  return (
    <primitive 
      ref={chartRef}
      object={scene.clone()} 
      scale={modelSettings.scale} 
      position={modelSettings.position} 
      rotation={modelSettings.rotation}
    />
  )
}


export const CarModel = ({ modelSettings = { position: [0, 2, 0], rotation: [0, 0, 0], scale: [0.7, 0.7, 0.7], autoRotate: true } }) => {
  const { scene } = useGLTF('/models/car/car.glb')
  const carRef = useRef()

  useFrame((state) => {
    if (carRef.current && modelSettings.autoRotate) {
      const time = state.clock.elapsedTime
      carRef.current.rotation.y = time * 0.5
    }
  })

  return (
    <primitive
      ref={carRef}
      object={scene.clone()}
      scale={modelSettings.scale}
      position={modelSettings.position}
      rotation={modelSettings.rotation}
    />
  )
}