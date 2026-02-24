// Stat configuration for the pentagon radar chart
export const STAT_CONFIG = [
  { 
    key: 'frontend', 
    label: 'Frontend', 
    angle: Math.PI / 2,
    color: '#61dafb'
  },
  { 
    key: 'backend', 
    label: 'Backend', 
    angle: Math.PI / 2 + (Math.PI * 2 / 5) * 1,
    color: '#68a063'
  },
  { 
    key: 'database', 
    label: 'Database', 
    angle: Math.PI / 2 + (Math.PI * 2 / 5) * 2,
    color: '#f29111'
  },
  { 
    key: 'devops', 
    label: 'DevOps', 
    angle: Math.PI / 2 + (Math.PI * 2 / 5) * 3,
    color: '#326ce5'
  },
  { 
    key: 'features', 
    label: 'Features', 
    angle: Math.PI / 2 + (Math.PI * 2 / 5) * 4,
    color: '#ab47bc'
  }
]

// Animation timing constants
export const ANIMATION_TIMINGS = {
  ENTRANCE_ANIMATION: 50,
  MODEL_ANIMATION_DELAY: 800,
  STAR_ANIMATION_DELAY: 1000,
  CLOSE_DURATION: 650
}

// 3D Model configurations by project name
export const MODEL_CONFIGS = {
  'HiraganaGo': {
    component: 'JapaneseHouseModel',
    settings: { 
      position: [0, 0, 0], 
      rotation: [0, 0, 0], 
      scale: [3, 3, 3], 
      autoRotate: true,
      zDistance: -50, // How far back from camera (negative = away)
      auraColor: '#FFD700', // Gold aura
      auraIntensity: 1.5
    }
  },
  'YouTube Video Trimmer': {
    component: 'ScissorsModel',
    settings: { 
      position: [0, 0, 0], 
      rotation: [3, 1, 4], 
      scale: [8, 8, 8], 
      autoRotate: true,
      zDistance: -80,
      auraColor: '#FF4444',
      auraIntensity: 1.8
    }
  },
  'Food Delivery Platform': {
    component: 'PizzaModel',
    settings: { 
      position: [0, -1, 0], 
      rotation: [-0.14, -0.84, -0.34], 
      scale: [2, 2, 2], 
      autoRotate: true,
      zDistance: -40,
      auraColor: '#FF6B35',
      auraIntensity: 1.6
    }
  },
  'Swimming Club Management': {
    component: 'PoolModel',
    settings: { 
      position: [0, 0, 0], 
      rotation: [0, 0, 0], 
      scale: [0.018, 0.018, 0.018], 
      autoRotate: true,
      zDistance: -60,
      auraColor: '#00BFFF',
      auraIntensity: 2.0
    }
  },
  'AI Image Detector API': {
    component: 'RobotEyeModel',
    settings: { 
      position: [0, 0, 0], 
      rotation: [0, 0, 0], 
      scale: [12, 12, 12], 
      autoRotate: true,
      zDistance: -100,
      auraColor: '#FF00FF',
      auraIntensity: 2.2
    }
  },
  'VoiceRemovingAI Web App': {
    component: 'MicroPhoneModel',
    settings: { 
      position: [0, -1.5, 0], 
      rotation: [0, 0, 0], 
      scale: [13, 13, 13], 
      autoRotate: true,
      zDistance: -90,
      auraColor: '#00FF88',
      auraIntensity: 1.7
    }
  },
  'Laravel-Video-Tools': {
    component: 'CameraTapeModel',
    settings: { 
      position: [0, -1.5, 0], 
      rotation: [0, 0, 0], 
      scale: [4, 4, 4], 
      autoRotate: true,
      zDistance: -70,
      auraColor: '#FFA500',
      auraIntensity: 1.5
    }
  },
  'All to PDF Conversion API': {
    component: 'FileShelfModel',
    settings: { 
      position: [0, -1, 0], 
      rotation: [0, 0, 0], 
      scale: [2, 2, 2], 
      autoRotate: true,
      zDistance: -50,
      auraColor: '#4169E1',
      auraIntensity: 1.4
    }
  },
  'ETL Movies Pipeline': {
    component: 'ClapperboardModel',
    settings: { 
      position: [0, -0.5, 0], 
      rotation: [0, 0, 0], 
      scale: [0.1, 0.1, 0.1], 
      autoRotate: true,
      zDistance: -45,
      auraColor: '#FFD700',
      auraIntensity: 1.6
    }
  },
  'Religious Text Analysis': {
    component: 'BooksModel',
    settings: { 
      position: [0, 0, 0], 
      rotation: [0, 0, 0], 
      scale: [15, 15, 15], 
      autoRotate: true,
      zDistance: -100,
      auraColor: '#9370DB',
      auraIntensity: 1.8
    }
  },
  'Spanish Open Data Ingestion': {
    component: 'VideogameModel',
    settings: { 
      position: [0, 0, 0], 
      rotation: [0, 0, 0], 
      scale: [0.2, 0.2, 0.2], 
      autoRotate: true,
      zDistance: -55,
      auraColor: '#00FF00',
      auraIntensity: 2.0
    }
  },
  'EU GDP ELT Pipeline': {
    component: 'ChartModel',
    settings: { 
      position: [0, 0, 0], 
      rotation: [0, 0, 0], 
      scale: [1, 1, 1], 
      autoRotate: true,
      zDistance: -60,
      auraColor: '#32CD32',
      auraIntensity: 1.5
    }
  },
  
  'Cars 2025 Data Analysis': {
    component: 'CarModel',
    settings: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [0.7, 0.7, 0.7],      // adjust after seeing the model in-scene
      autoRotate: true,
      zDistance: -55,
      auraColor: '#1bb5db',   // red-orange — sporty, automotive feel
      auraIntensity: 1.8
    }
  },

}