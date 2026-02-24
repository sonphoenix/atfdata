// utils/statsCalculator.js
// Improved project stats calculator with clearer, layer-based criteria

/**
 * Calculate programming stats based on project architecture layers
 * Stats range from 60-100 to allow for meaningful differentiation
 * 
 * NEW CATEGORIES:
 * 1. Frontend - UI/UX quality and framework sophistication
 * 2. Backend - Server-side logic and API complexity
 * 3. Database - Data persistence and query optimization
 * 4. DevOps - Deployment, testing, and production readiness
 * 5. Features - Functionality breadth and technical complexity
 */

// Helper functions (keep them but don't export)
const calculateFrontend = (project) => {
  let score = 60 // Base score
  
  // Modern frontend frameworks (+20 max)
  const frontendFrameworks = {
    'React': 15,
    'Next.js': 20,
    'Vue': 15,
    'Angular': 15,
    'Svelte': 18,
    'React Native': 18
  }
  
  let maxFrameworkScore = 0
  Object.keys(frontendFrameworks).forEach(framework => {
    if (project.tech.includes(framework)) {
      maxFrameworkScore = Math.max(maxFrameworkScore, frontendFrameworks[framework])
    }
  })
  score += maxFrameworkScore
  
  // UI/Styling libraries (+12 max)
  const uiLibraries = ['Tailwind', 'Material-UI', 'Chakra', 'shadcn', 'styled-components', 'SASS', 'Bootstrap']
  const uiCount = project.tech.filter(t => uiLibraries.some(lib => t.includes(lib))).length
  score += Math.min(uiCount * 6, 12)
  
  // Advanced UI features (+10 max)
  const advancedUI = ['Three.js', 'D3.js', 'Framer Motion', 'GSAP', 'WebGL', 'Canvas']
  if (project.tech.some(t => advancedUI.includes(t))) {
    score += 10
  }
  
  // State management (+8 max)
  const stateManagement = ['Redux', 'Zustand', 'MobX', 'Recoil', 'Context API', 'Pinia', 'Vuex']
  if (project.tech.some(t => stateManagement.includes(t))) {
    score += 8
  }
  
  // TypeScript for type safety (+5)
  if (project.tech.includes('TypeScript')) {
    score += 5
  }
  
  return Math.min(Math.max(score, 60), 100)
}

const calculateBackend = (project) => {
  let score = 60 // Base score
  
  // Backend frameworks (+25 max)
  const backendFrameworks = {
    'Laravel': 20,
    'Django': 20,
    'Express': 15,
    'FastAPI': 18,
    'Spring Boot': 22,
    'ASP.NET': 20,
    'Flask': 15,
    'NestJS': 20,
    'Ruby on Rails': 20
  }
  
  let maxBackendScore = 0
  Object.keys(backendFrameworks).forEach(framework => {
    if (project.tech.includes(framework)) {
      maxBackendScore = Math.max(maxBackendScore, backendFrameworks[framework])
    }
  })
  score += maxBackendScore
  
  // API types (+10 max)
  const apiTypes = ['REST', 'GraphQL', 'gRPC', 'WebSocket', 'tRPC']
  const apiCount = project.tech.filter(t => apiTypes.some(api => t.includes(api))).length
  score += Math.min(apiCount * 5, 10)
  
  // Authentication & Security (+8 max)
  const authSecurity = ['OAuth', 'JWT', 'Auth0', 'Passport', 'bcrypt', 'CORS']
  const authCount = project.tech.filter(t => authSecurity.some(auth => t.includes(auth))).length
  score += Math.min(authCount * 4, 8)
  
  // Real-time features (+7 max)
  if (project.tech.includes('WebSocket') || 
      project.tech.includes('Socket.io') ||
      project.description.toLowerCase().includes('real-time') ||
      project.description.toLowerCase().includes('realtime')) {
    score += 7
  }
  
  return Math.min(Math.max(score, 60), 100)
}

const calculateDatabase = (project) => {
  let score = 60 // Base score
  
  // Database systems (+20 max)
  const databases = {
    'PostgreSQL': 18,
    'MySQL': 15,
    'MongoDB': 16,
    'Redis': 12,
    'SQLite': 10,
    'Firebase': 14,
    'Supabase': 16,
    'DynamoDB': 17,
    'Cassandra': 18,
    'Oracle': 18
  }
  
  let totalDbScore = 0
  let dbCount = 0
  Object.keys(databases).forEach(db => {
    if (project.tech.includes(db)) {
      totalDbScore += databases[db]
      dbCount++
    }
  })
  
  // Use highest DB score or average if multiple databases
  if (dbCount > 0) {
    score += Math.min(dbCount > 1 ? totalDbScore / dbCount + 5 : totalDbScore, 20)
  }
  
  // ORM/Query builders (+10 max)
  const orms = ['Prisma', 'Sequelize', 'TypeORM', 'Mongoose', 'Eloquent', 'SQLAlchemy', 'Drizzle']
  if (project.tech.some(t => orms.some(orm => t.includes(orm)))) {
    score += 10
  }
  
  // Caching layer (+8 max)
  if (project.tech.includes('Redis') || 
      project.description.toLowerCase().includes('cache') ||
      project.description.toLowerCase().includes('caching')) {
    score += 8
  }
  
  // Data validation (+7 max)
  const validation = ['Zod', 'Yup', 'Joi', 'class-validator']
  if (project.tech.some(t => validation.includes(t))) {
    score += 7
  }
  
  return Math.min(Math.max(score, 60), 100)
}

const calculateDevOps = (project) => {
  let score = 60 // Base score
  
  // Deployment status (+25 max)
  const desc = project.description.toLowerCase()
  if (desc.includes('published') || desc.includes('production')) {
    score += 25
  } else if (desc.includes('deployed') || desc.includes('live')) {
    score += 20
  } else if (desc.includes('staging')) {
    score += 12
  }
  
  // Cloud platforms (+12 max)
  const cloudPlatforms = ['AWS', 'Azure', 'Google Cloud', 'Vercel', 'Netlify', 'Heroku', 'DigitalOcean', 'Railway']
  const cloudCount = project.tech.filter(t => cloudPlatforms.some(cloud => t.includes(cloud))).length
  score += Math.min(cloudCount * 6, 12)
  
  // Testing (+10 max)
  const testing = ['Jest', 'Vitest', 'Cypress', 'Playwright', 'Testing Library', 'Mocha', 'Chai', 'Pytest', 'PHPUnit']
  const testCount = project.tech.filter(t => testing.some(test => t.includes(test))).length
  if (testCount > 0) {
    score += 10
  } else if (desc.includes('test') || desc.includes('tested')) {
    score += 5
  }
  
  // CI/CD (+8 max)
  const cicd = ['GitHub Actions', 'GitLab CI', 'Jenkins', 'CircleCI', 'Travis CI']
  if (project.tech.some(t => cicd.some(ci => t.includes(ci)))) {
    score += 8
  }
  
  // Containerization (+5 max)
  if (project.tech.includes('Docker') || project.tech.includes('Kubernetes')) {
    score += 5
  }
  
  return Math.min(Math.max(score, 60), 100)
}

const calculateFeatures = (project) => {
  let score = 60 // Base score
  
  // AI/ML features (+25 max)
  const aiml = ['AI', 'ML', 'Machine Learning', 'TensorFlow', 'PyTorch', 'OpenAI', 'GPT', 'Neural', 'Computer Vision', 'NLP', 'Demucs']
  const aiCount = project.tech.filter(t => aiml.some(ai => t.includes(ai))).length
  if (aiCount > 0) {
    score += Math.min(aiCount * 10, 25)
  }
  
  // Third-party integrations (+12 max)
  const integrations = ['Stripe', 'PayPal', 'Twilio', 'SendGrid', 'Cloudinary', 'AWS S3', 'Google Maps', 'Mailchimp']
  const integrationCount = project.tech.filter(t => integrations.some(int => t.includes(int))).length
  score += Math.min(integrationCount * 6, 12)
  
  // Real-time/Interactive features (+10 max)
  const realTimeKeywords = ['real-time', 'realtime', 'live', 'streaming', 'chat', 'collaborative', 'multiplayer']
  const hasRealTime = realTimeKeywords.some(kw => project.description.toLowerCase().includes(kw))
  if (hasRealTime) {
    score += 10
  }
  
  // Media handling (+8 max)
  const media = ['FFmpeg', 'ImageMagick', 'Sharp', 'Multer', 'video', 'audio', 'image processing']
  const hasMedia = project.tech.some(t => media.some(m => t.includes(m))) ||
                   media.some(m => project.description.toLowerCase().includes(m))
  if (hasMedia) {
    score += 8
  }
  
  // Mobile support (+5 max)
  if (project.tech.includes('React Native') || 
      project.tech.includes('Flutter') ||
      project.tech.includes('Swift') ||
      project.tech.includes('Kotlin')) {
    score += 5
  }
  
  return Math.min(Math.max(score, 60), 100)
}

// Main export - this is what projectStatsService.js expects
export const getBasicProjectStats = (project) => {
  const stats = {
    frontend: calculateFrontend(project),
    backend: calculateBackend(project),
    database: calculateDatabase(project),
    devops: calculateDevOps(project),
    features: calculateFeatures(project)
  }
  
  // Calculate derived stats
  stats.complexity = Math.floor((stats.backend + stats.database + stats.features) / 3)
  stats.impact = Math.floor((stats.frontend + stats.devops + stats.features) / 3)
  stats.overall = Math.floor((stats.frontend + stats.backend + stats.database + stats.devops + stats.features) / 5)
  
  return stats
}

// Get sublabel based on stat value
export const getStatSubLabel = (statKey, value) => {
  const labels = {
    frontend: [
      { min: 95, label: 'Stunning' },
      { min: 90, label: 'Polished' },
      { min: 85, label: 'Modern' },
      { min: 80, label: 'Clean' },
      { min: 70, label: 'Functional' },
      { min: 0, label: 'Basic' }
    ],
    backend: [
      { min: 95, label: 'Enterprise' },
      { min: 90, label: 'Robust' },
      { min: 85, label: 'Scalable' },
      { min: 80, label: 'Solid' },
      { min: 70, label: 'Capable' },
      { min: 0, label: 'Simple' }
    ],
    database: [
      { min: 95, label: 'Optimized' },
      { min: 90, label: 'Efficient' },
      { min: 85, label: 'Structured' },
      { min: 80, label: 'Organized' },
      { min: 70, label: 'Adequate' },
      { min: 0, label: 'Basic' }
    ],
    devops: [
      { min: 95, label: 'Production' },
      { min: 90, label: 'Deployed' },
      { min: 85, label: 'Tested' },
      { min: 80, label: 'Ready' },
      { min: 70, label: 'Dev' },
      { min: 0, label: 'Local' }
    ],
    features: [
      { min: 95, label: 'Advanced' },
      { min: 90, label: 'Feature-rich' },
      { min: 85, label: 'Complete' },
      { min: 80, label: 'Well-rounded' },
      { min: 70, label: 'Functional' },
      { min: 0, label: 'MVP' }
    ]
  }
  
  const statLabels = labels[statKey] || labels.frontend
  const label = statLabels.find(l => value >= l.min)
  return label ? label.label : 'Basic'
}