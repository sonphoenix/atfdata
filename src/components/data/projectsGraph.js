// Project data graph - Two parallel career paths
// Layout:
//                    p2---p4---p6---p8---p10---p12---p14---p16  (Software Engineer path)
// p1                  
//                    p3---p5---p7---p9---p11---p13  (Data Analyst path)

export const projectsGraph = {
  nodes: [
    // Starting point
    {
      id: 'proj-1',
      position: [-30, 0, 0],
      project: {
        name: 'Portfolio Start',
        description: 'ATF-DATA Website',
        tech: ['HTML', 'CSS', 'JavaScript', 'Three.js', 'React three fiber'],
        image: '🚀',
        github: 'https://github.com/sonphoenix',
        hasRepo: true,
        isPublic: true
      },
      connections: ['proj-2', 'proj-3']
    },
    
    // SOFTWARE ENGINEER PATH (top) - 8 Key Projects
    {
      id: 'proj-2',
      position: [0, 0, -15],
      project: {
        name: 'YouTube Video Trimmer',
        description: 'Full-stack SaaS platform enabling users to trim, split and download YouTube videos. Built a custom Node.js pipeline integrating ytdl-core and FFmpeg for server-side video processing, with a React frontend and MongoDB for session management. Deployed at cutyv.com.',
        tech: ['React', 'Node.js', 'ytdl-core', 'ffmpeg', 'MongoDB'],
        image: '📹',
        github: 'https://github.com/sonphoenix/cutyv',
        live: 'https://cutyv.com',
        hasRepo: true,
        hasModel: true,
        isPublic: false,
        projectImages: {
          path: '/pictures/cutyv',
          count: 4
        },
        manualStats: {
          frontend: 85,
          backend: 88,
          database: 82,
          devops: 75,
          features: 90
        }
      },
      connections: ['proj-1', 'proj-4']
    },
    {
      id: 'proj-4',
      position: [20, 0, -15],
      project: {
        name: 'Swimming Club Management',
        description: 'Cross-platform mobile application built as a final year project for managing swimming club operations — member registration, attendance tracking, and scheduling. Architected a RESTful Laravel backend with MariaDB and delivered a React Native mobile client for iOS and Android.',
        tech: ['React Native', 'Laravel', 'MariaDB', 'Bootstrap'],
        image: '🏊',
        github: 'https://github.com/sonphoenix/SibahaDz',
        hasRepo: true,
        hasModel: true,
        isPublic: false,
        manualStats: {
          frontend: 82,
          backend: 85,
          database: 80,
          devops: 70,
          features: 83
        }
      },
      connections: ['proj-2', 'proj-6']
    },
    {
      id: 'proj-6',
      position: [40, 0, -15],
      project: {
        name: 'AI Image Detector API',
        description: 'Published machine learning API on RapidAPI marketplace that classifies images as AI-generated or real. Trained and deployed a Python ML model as a scalable REST endpoint, making it accessible to thousands of developers. Live on RapidAPI.',
        tech: ['Python', 'Machine Learning', 'RapidAPI'],
        image: '🤖',
        github: 'https://github.com/sonphoenix/ai_or_real_image_detector',
        live: 'https://rapidapi.com/sonphoenix2002/api/ai-image-detector-api',
        hasRepo: true,
        hasModel: true,
        isPublic: true,
        manualStats: {
          frontend: 75,
          backend: 92,
          database: 78,
          devops: 85,
          features: 95
        }
      },
      connections: ['proj-4', 'proj-8']
    },
    {
      id: 'proj-8',
      position: [60, 0, -15],
      project: {
        name: 'Food Delivery Platform',
        description: 'Multi-role food delivery web platform with separate dashboards for customers, restaurants, and delivery drivers. Built with Laravel featuring authentication, order lifecycle management, real-time status tracking, and a MySQL relational schema handling complex role-based access control.',
        tech: ['Laravel', 'PHP', 'MySQL', 'Bootstrap'],
        image: '🍕',
        github: 'https://github.com/sonphoenix/Foodio-tp',
        hasRepo: true,
        hasModel: true,
        isPublic: false,
        manualStats: {
          frontend: 80,
          backend: 90,
          database: 85,
          devops: 75,
          features: 88
        }
      },
      connections: ['proj-6', 'proj-10']
    },
    {
      id: 'proj-10',
      position: [80, 0, -15],
      project: {
        name: 'All to PDF Conversion API',
        description: 'Developer-facing SaaS API that converts documents, presentations and images to PDF at scale. Integrated Stripe for subscription billing, built a React dashboard for API key management and usage analytics, with a Node.js processing engine and MongoDB for customer data.',
        tech: ['React', 'Node.js', 'MongoDB', 'TailwindCSS', 'Stripe'],
        image: '📄',
        github: 'https://github.com/sonphoenix/ppt2pdf',
        hasRepo: true,
        hasModel: true,
        isPublic: true,
        projectImages: {
          path: '/pictures/ppt2pdf',
          count: 8
        },
        manualStats: {
          frontend: 85,
          backend: 88,
          database: 82,
          devops: 80,
          features: 85
        }
      },
      connections: ['proj-8', 'proj-12']
    },
    {
      id: 'proj-12',
      position: [100, 0, -15],
      project: {
        name: 'Laravel-Video-Tools',
        description: 'Open-source Composer package that wraps FFmpeg for Laravel developers, providing a clean fluent API for video trimming, compression, thumbnail generation and format conversion. Designed for production use with configurable binaries and chainable method syntax.',
        tech: ['Laravel', 'PHP', 'FFmpeg', 'Composer'],
        image: '🎬',
        github: 'https://github.com/sonphoenix/laravel-video-tools',
        hasRepo: true,
        hasModel: true,
        isPublic: true,
        manualStats: {
          frontend: 70,
          backend: 92,
          database: 75,
          devops: 88,
          features: 90
        }
      },
      connections: ['proj-10', 'proj-14']
    },
    {
      id: 'proj-14',
      position: [120, 0, -15],
      project: {
        name: 'VoiceRemovingAI Web App',
        description: 'AI-powered vocal separation web app using Meta\'s Demucs deep learning model to isolate vocals, drums, bass and other stems from any audio track. Built a Streamlit interface around a PyTorch inference pipeline with FFmpeg post-processing for clean audio output.',
        tech: ['Python', 'Streamlit', 'Demucs', 'PyTorch', 'FFmpeg'],
        image: '🎵',
        github: 'https://github.com/sonphoenix/ai-music-remover',
        hasRepo: true,
        hasModel: true,
        isPublic: false,
        manualStats: {
          frontend: 78,
          backend: 95,
          database: 70,
          devops: 85,
          features: 92
        }
      },
      connections: ['proj-12', 'proj-16']
    },
    {
      id: 'proj-16',
      position: [140, 0, -15],
      project: {
        name: 'HiraganaGo',
        description: 'Japanese hiragana learning app published on the Google Play Store with spaced repetition quizzes, stroke order guides, and progress tracking. Built with React Native and Expo for a smooth cross-platform experience, achieving a polished production release.',
        tech: ['React Native', 'Expo', 'JavaScript'],
        image: '🏮',
        github: 'https://github.com/sonphoenix/HiraganaGo',
        playStore: 'https://play.google.com/store/apps/details?id=com.omarfr.HiraganaApp',
        hasRepo: true,
        hasModel: true,
        isPublic: true,
        manualStats: {
          frontend: 90,
          backend: 82,
          database: 78,
          devops: 88,
          features: 92
        }
      },
      connections: ['proj-14']
    },
    
    // DATA ANALYST PATH (bottom)
    {
      id: 'proj-3',
      position: [0, 0, 15],
      project: {
        name: 'ETL Movies Pipeline',
        description: 'End-to-end ETL pipeline that ingests raw movie datasets, applies multi-stage Pandas transformations for cleaning and enrichment, and loads structured data into a SQLite database via SQLAlchemy. Designed with modular batch processing stages and reusable transformation logic.',
        tech: ['Python', 'Pandas', 'SQLAlchemy', 'SQLite', 'Data Processing'],
        image: '🎬',
        github: 'https://github.com/Ferradj04/etl-movies',
        hasRepo: true,
        hasModel: true,
        isPublic: true
      },
      connections: ['proj-1', 'proj-5']
    },
    {
      id: 'proj-5',
      position: [20, 0, 15],
      project: {
        name: 'Religious Text Analysis',
        description: 'NLP pipeline performing linguistic analysis on large religious text corpora — tokenization, frequency analysis, part-of-speech tagging and named entity recognition using NLTK and SpaCy. Produced statistical visualizations with Matplotlib and Seaborn revealing vocabulary distribution and linguistic patterns.',
        tech: ['Python', 'NLTK', 'SpaCy', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn'],
        image: '📖',
        github: 'https://github.com/Ferradj04/wordscount-analysis',
        hasRepo: true,
        hasModel: true,
        isPublic: true
      },
      connections: ['proj-3', 'proj-7']
    },
    {
      id: 'proj-7',
      position: [40, 0, 15],
      project: {
        name: 'Spanish Open Data Ingestion',
        description: 'Automated ingestion pipeline that pulls datasets from the Spanish government\'s datos.gob.es REST API, processes and validates them with Pandas, and persists structured records into PostgreSQL via SQLAlchemy. Implements pagination handling, schema validation and idempotent batch upserts.',
        tech: ['Python', 'Pandas', 'SQLAlchemy', 'PostgreSQL', 'REST API'],
        image: '🇪🇸',
        github: 'https://github.com/Ferradj04/datos.gob.es.ingestion',
        hasRepo: true,
        hasModel: true,
        isPublic: true
      },
      connections: ['proj-5', 'proj-9']
    },
    {
      id: 'proj-9',
      position: [60, 0, 15],
      project: {
        name: 'Helmholtz PINN',
        description: 'Physics-Informed Neural Network (PINN) implemented in PyTorch to approximate solutions of the Helmholtz PDE without labeled training data. The model enforces physical laws as soft constraints in the loss function, demonstrating deep learning applied to scientific computing and numerical simulation.',
        tech: ['Python', 'PyTorch', 'NumPy', 'SciPy', 'Matplotlib'],
        image: '⚛️',
        github: 'https://github.com/Ferradj04/Helmholtz-PINN',
        hasRepo: true,
        isPublic: true
      },
      connections: ['proj-7', 'proj-11']
    },
    {
      id: 'proj-11',
      position: [80, 0, 15],
      project: {
        name: 'ArXiv Photonic Visualizer',
        description: 'Research analytics tool that scrapes ArXiv for photonics papers, applies NLP keyword extraction and topic clustering, then renders an interactive Plotly dashboard showing publication trends, author networks and technology co-occurrence. Combines web scraping, text mining and data visualization in a single pipeline.',
        tech: ['Python', 'Pandas', 'Matplotlib', 'Plotly', 'NLP', 'Web Scraping'],
        image: '📡',
        github: 'https://github.com/Ferradj04/arxiv-photonic-data-vizualizer',
        hasRepo: true,
        isPublic: true
      },
      connections: ['proj-9', 'proj-13']
    },
    {
      id: 'proj-13',
      position: [100, 0, 15],
      project: {
        name: 'EU GDP ELT Pipeline',
        description: 'Production-grade ELT pipeline orchestrated with Apache Airflow that ingests EU GDP data, transforms it through layered SQL logic in PostgreSQL, and exposes results in a live Streamlit + Plotly dashboard. Fully containerized with Docker Compose for reproducible local and cloud deployment.',
        tech: ['Apache Airflow', 'Python', 'Pandas', 'Streamlit', 'Plotly', 'Docker', 'PostgreSQL'],
        image: '📊',
        github: 'https://github.com/Ferradj04/airflow-gdp-elt-EU',
        hasRepo: true,
        hasModel: true,
        isPublic: true
      },
      connections: ['proj-11', 'proj-15']
    },
    {
      id: 'proj-15',
      position: [120, 0, 15],
      project: {
        name: 'Cars 2025 Data Analysis',
        description: 'Exploratory data analysis of 2025 car market data sourced from Kaggle — uncovering price distributions, brand positioning, depreciation trends, and market segmentation insights. Delivered a structured notebook with statistical summaries, correlation analysis and publication-quality visualizations.',
        tech: ['Python', 'Pandas', 'Matplotlib', 'Data Analysis', 'Kaggle'],
        image: '🚗',
        github: 'https://github.com/Ferradj04/Cars-2025-Data-Analysis',
        hasRepo: true,
        hasModel: true,
        isPublic: true,
        manualStats: {
          frontend: 60,
          backend: 72,
          database: 78,
          devops: 65,
          features: 80
        }
      },
      connections: ['proj-13']
    }
  ]
}

// Helper functions to access projects
export const getAllProjects = () => {
  return projectsGraph.nodes.map(node => ({
    id: node.id,
    ...node.project,
    position: node.position,
    connections: node.connections
  }))
}

export const getProjectById = (id) => {
  const node = projectsGraph.nodes.find(node => node.id === id)
  return node ? { id: node.id, ...node.project } : null
}

export const getProjectsByPath = (path = 'software') => {
  const pathIds = {
    software: ['proj-2', 'proj-4', 'proj-6', 'proj-8', 'proj-10', 'proj-12', 'proj-14', 'proj-16'],
    data: ['proj-3', 'proj-5', 'proj-7', 'proj-9', 'proj-11', 'proj-13', 'proj-15']
  }
  
  const ids = pathIds[path] || pathIds.software
  return ids.map(id => getProjectById(id)).filter(Boolean)
}

export const getProjectsWithGitHub = () => {
  return getAllProjects().filter(project => project.github && project.hasRepo)
}

export const getPublicRepos = () => {
  return getAllProjects().filter(project => 
    project.github && project.hasRepo && project.isPublic === true
  )
}

export const getProjectConnections = (id) => {
  const node = projectsGraph.nodes.find(node => node.id === id)
  return node ? node.connections : []
}