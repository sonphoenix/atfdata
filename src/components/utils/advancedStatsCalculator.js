// utils/advancedStatsCalculator.js
import { analyzeGitHubRepo } from './githubAnalyzer'

/**
 * Calculate project stats from GitHub repository analysis
 */
export const getProjectStatsFromGitHub = async (project) => {
  if (!project.github) {
    throw new Error('No GitHub URL provided')
  }
  
  try {
    const repoAnalysis = await analyzeGitHubRepo(project.github)
    
    // Calculate stats based on repository analysis
    const stats = {
      frontend: calculateFrontendFromAnalysis(repoAnalysis, project),
      backend: calculateBackendFromAnalysis(repoAnalysis, project),
      database: calculateDatabaseFromAnalysis(repoAnalysis, project),
      devops: calculateDevOpsFromAnalysis(repoAnalysis, project),
      features: calculateFeaturesFromAnalysis(repoAnalysis, project)
    }
    
    // Add repository metadata
    const metadata = extractRepositoryMetadata(repoAnalysis)
    
    // Calculate derived stats
    stats.complexity = calculateComplexity(stats, metadata)
    stats.impact = calculateImpact(stats, metadata)
    stats.overall = calculateOverallScore(stats, metadata)
    
    return {
      ...stats,
      metadata,
      source: 'github-analysis',
      lastUpdated: new Date().toISOString(),
      confidence: calculateConfidenceScore(repoAnalysis)
    }
    
  } catch (error) {
    console.error('GitHub analysis failed:', error)
    throw error
  }
}

/**
 * FRONTEND: Calculate based on actual frontend code
 */
const calculateFrontendFromAnalysis = (analysis, project) => {
  let score = 60 // Base score
  
  const { packageJson, languages, tree, metrics } = analysis
  
  // 1. Framework detection
  if (packageJson) {
    const deps = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) }
    
    // Modern frameworks with weights
    const frameworkScores = {
      'next': 22,          // Next.js (SSR, optimization)
      'react': 18,         // React
      'vue': 16,           // Vue.js
      'angular': 17,       // Angular
      'svelte': 19,        // Svelte (modern, compiled)
      'react-native': 20,  // React Native (mobile)
      'expo': 21,          // Expo (React Native framework)
      'nuxt': 20,          // Nuxt.js (Vue framework)
      'gatsby': 19         // Gatsby (React static)
    }
    
    // Find the highest scoring framework
    let frameworkScore = 0
    Object.entries(frameworkScores).forEach(([pkg, points]) => {
      if (deps[pkg]) {
        frameworkScore = Math.max(frameworkScore, points)
      }
    })
    score += frameworkScore
    
    // 2. UI libraries and styling
    const uiLibraries = [
      'tailwindcss', '@material-ui/core', 'chakra-ui', 'styled-components',
      'sass', 'less', 'bootstrap', 'antd', 'shadcn'
    ]
    const uiCount = uiLibraries.filter(lib => deps[lib]).length
    score += Math.min(uiCount * 5, 15)
    
    // 3. State management
    const stateLibs = ['redux', 'zustand', 'mobx', 'recoil', 'vuex', 'pinia']
    if (stateLibs.some(lib => deps[lib])) {
      score += 8
    }
    
    // 4. TypeScript
    if (deps.typescript || languages.TypeScript) {
      score += 7
    }
    
    // 5. Advanced UI features
    const advancedUI = ['three', 'd3', 'framer-motion', 'gsap', 'chart.js', 'recharts']
    if (advancedUI.some(lib => deps[lib])) {
      score += 10
    }
  }
  
  // 6. Check for frontend structure
  const hasFrontendStructure = metrics.folderStructure.hasSrc || 
    tree.some(item => 
      item.path.includes('components/') || 
      item.path.includes('pages/') ||
      item.path.includes('views/')
    )
  
  if (hasFrontendStructure) {
    score += 8
  }
  
  // 7. Check for responsive design indicators
  const hasResponsiveFiles = tree.some(item => 
    item.path.includes('responsive') || 
    item.path.includes('mobile') ||
    item.path.includes('breakpoints')
  )
  
  if (hasResponsiveFiles) {
    score += 5
  }
  
  // 8. PWA capabilities
  const hasPWA = tree.some(item => 
    item.path.includes('manifest.json') || 
    item.path.includes('service-worker')
  )
  
  if (hasPWA) {
    score += 7
  }
  
  return Math.min(Math.max(score, 60), 100)
}

/**
 * BACKEND: Calculate based on backend code and APIs
 */
const calculateBackendFromAnalysis = (analysis, project) => {
  let score = 60
  
  const { packageJson, requirementsTxt, composerJson, tree, languages } = analysis
  
  // 1. Detect backend framework/language
  if (packageJson) {
    const deps = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) }
    
    // Node.js frameworks
    const backendFrameworks = {
      'express': 16,
      'nestjs': 22,      // Enterprise Node.js
      'fastify': 18,     // Fast Node.js framework
      'koa': 15,
      'hapi': 16,
      'sails': 17
    }
    
    Object.entries(backendFrameworks).forEach(([pkg, points]) => {
      if (deps[pkg]) {
        score += points
      }
    })
    
    // API related libraries
    const apiLibs = ['graphql', 'apollo-server', 'socket.io', 'ws', 'trpc']
    const apiCount = apiLibs.filter(lib => deps[lib]).length
    score += Math.min(apiCount * 6, 15)
    
    // Authentication/security
    const authLibs = ['passport', 'jsonwebtoken', 'bcrypt', 'argon2', 'helmet', 'cors']
    const authCount = authLibs.filter(lib => deps[lib]).length
    score += Math.min(authCount * 4, 12)
  }
  
  // 2. Python backend detection
  if (requirementsTxt) {
    const requirements = requirementsTxt.toLowerCase()
    
    if (requirements.includes('django')) score += 22
    if (requirements.includes('flask')) score += 18
    if (requirements.includes('fastapi')) score += 20
    
    // API libraries
    if (requirements.includes('graphql') || requirements.includes('graphene')) score += 8
    if (requirements.includes('websocket')) score += 7
    
    // Async/performance
    if (requirements.includes('asyncio') || requirements.includes('aiohttp')) score += 6
    if (requirements.includes('celery')) score += 8 // Task queue
  }
  
  // 3. PHP backend detection
  if (composerJson) {
    const require = { ...(composerJson.require || {}), ...(composerJson['require-dev'] || {}) }
    
    if (require['laravel/framework']) score += 22
    if (require['symfony/symfony']) score += 21
    
    // API packages
    if (require['league/fractal'] || require['dingo/api']) score += 8
  }
  
  // 4. Check for backend structure
  const hasBackendStructure = tree.some(item => 
    item.path.includes('api/') || 
    item.path.includes('routes/') ||
    item.path.includes('controllers/') ||
    item.path.includes('middleware/') ||
    item.path.includes('services/')
  )
  
  if (hasBackendStructure) {
    score += 10
  }
  
  // 5. Check for API documentation
  const hasAPIDocs = tree.some(item => 
    item.path.includes('swagger') || 
    item.path.includes('openapi') ||
    item.path.includes('postman')
  )
  
  if (hasAPIDocs) {
    score += 7
  }
  
  // 6. Language specific bonuses
  if (languages.Go) score += 5 // Go is performant
  if (languages.Rust) score += 8 // Rust is very performant
  if (languages.Java || languages['Java Server Pages']) score += 6 // Enterprise
  
  return Math.min(Math.max(score, 60), 100)
}

/**
 * DATABASE: Calculate based on database usage
 */
const calculateDatabaseFromAnalysis = (analysis, project) => {
  let score = 60
  
  const { packageJson, requirementsTxt, composerJson, tree } = analysis
  
  // 1. Database libraries detection
  if (packageJson) {
    const deps = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) }
    
    // ORMs and query builders
    const orms = ['prisma', 'mongoose', 'sequelize', 'typeorm', 'knex', 'objection']
    if (orms.some(orm => deps[orm])) {
      score += 12
    }
    
    // Database clients
    const dbClients = ['pg', 'mysql2', 'mongodb', 'redis', 'sqlite3', 'ioredis']
    const dbCount = dbClients.filter(client => deps[client]).length
    score += Math.min(dbCount * 6, 18)
  }
  
  // 2. Python database libraries
  if (requirementsTxt) {
    const requirements = requirementsTxt.toLowerCase()
    
    const pythonDbLibs = ['sqlalchemy', 'psycopg2', 'mysql-connector', 'pymongo', 'redis']
    const dbCount = pythonDbLibs.filter(lib => requirements.includes(lib)).length
    score += Math.min(dbCount * 6, 18)
    
    // ORMs
    if (requirements.includes('django orm') || requirements.includes('peewee')) {
      score += 10
    }
  }
  
  // 3. PHP database libraries
  if (composerJson) {
    const require = { ...(composerJson.require || {}), ...(composerJson['require-dev'] || {}) }
    
    const phpDbLibs = ['illuminate/database', 'doctrine/dbal', 'propel/propel']
    if (phpDbLibs.some(lib => require[lib])) {
      score += 12
    }
  }
  
  // 4. Check for database-related files
  const hasMigrations = tree.some(item => 
    item.path.includes('migrations/') || 
    item.path.includes('database/migrations')
  )
  
  const hasModels = tree.some(item => 
    item.path.includes('models/') || 
    item.path.includes('entities/')
  )
  
  const hasSeeds = tree.some(item => 
    item.path.includes('seeds/') || 
    item.path.includes('seeders/')
  )
  
  if (hasMigrations) score += 8
  if (hasModels) score += 7
  if (hasSeeds) score += 5
  
  // 5. Check for database configuration
  const hasDbConfig = tree.some(item => 
    item.path.includes('.env') && item.path.includes('DB_') ||
    item.path.includes('config/database') ||
    item.path.includes('database.yml') ||
    item.path.includes('ormconfig')
  )
  
  if (hasDbConfig) {
    score += 6
  }
  
  // 6. Check for multiple database support
  const dbFileCount = tree.filter(item => 
    item.path.endsWith('.sql') || 
    item.path.includes('schema')
  ).length
  
  if (dbFileCount > 1) {
    score += 7 // Multiple database files indicate complex schema
  }
  
  return Math.min(Math.max(score, 60), 100)
}

/**
 * DEVOPS: Calculate based on deployment and infrastructure
 */
const calculateDevOpsFromAnalysis = (analysis, project) => {
  let score = 60
  
  const { dockerfile, dockerCompose, githubActions, tree, metrics, basicInfo } = analysis
  
  // 1. Docker support
  if (dockerfile) {
    score += 18
    
    // Advanced Docker features
    const dockerContent = dockerfile.toLowerCase()
    if (dockerContent.includes('multi-stage')) score += 5
    if (dockerContent.includes('healthcheck')) score += 3
    if (dockerContent.includes('volume')) score += 3
  }
  
  if (dockerCompose) {
    score += 12
  }
  
  // 2. CI/CD pipelines
  if (metrics.hasCI) {
    score += 15
    
    // GitHub Actions
    if (githubActions.length > 0) {
      score += 5
      // Check for multiple workflows
      if (githubActions.length > 1) score += 3
    }
  }
  
  // 3. Testing infrastructure
  if (metrics.hasTests) {
    score += 12
    
    // Test coverage based on test file ratio
    if (metrics.testCoverage > 20) score += 5
    if (metrics.testCoverage > 50) score += 5
    if (metrics.testCoverage > 80) score += 5
  }
  
  // 4. Deployment configuration
  const hasDeployConfig = tree.some(item => 
    item.path.includes('deploy') || 
    item.path.includes('prod') ||
    item.path.includes('staging') ||
    item.path.includes('serverless') ||
    item.path.includes('terraform') ||
    item.path.includes('kubernetes') ||
    item.path.includes('helm')
  )
  
  if (hasDeployConfig) {
    score += 10
  }
  
  // 5. Environment management
  const hasEnvManagement = tree.some(item => 
    item.path.includes('.env.example') ||
    item.path.includes('.env.sample') ||
    item.path.includes('config/env')
  )
  
  if (hasEnvManagement) {
    score += 7
  }
  
  // 6. Monitoring and logging
  const hasMonitoring = tree.some(item => 
    item.path.includes('monitoring') ||
    item.path.includes('logs') ||
    item.path.includes('metrics') ||
    item.path.includes('sentry') ||
    item.path.includes('newrelic')
  )
  
  if (hasMonitoring) {
    score += 8
  }
  
  // 7. Repository health indicators
  if (basicInfo) {
    // Active maintenance
    const updatedAt = new Date(basicInfo.updated_at)
    const now = new Date()
    const daysSinceUpdate = (now - updatedAt) / (1000 * 60 * 60 * 24)
    
    if (daysSinceUpdate < 30) score += 5 // Recently updated
    if (daysSinceUpdate < 7) score += 5 // Very recently updated
    
    // Community engagement
    if (basicInfo.stargazers_count > 10) score += 3
    if (basicInfo.stargazers_count > 50) score += 3
    if (basicInfo.stargazers_count > 100) score += 4
    
    // Forks indicate collaboration
    if (basicInfo.forks_count > 5) score += 3
  }
  
  // 8. Documentation
  const hasDeploymentDocs = tree.some(item => 
    item.path.includes('deploy.md') ||
    item.path.includes('DEPLOYMENT') ||
    item.path.includes('setup.md')
  )
  
  if (hasDeploymentDocs) {
    score += 6
  }
  
  return Math.min(Math.max(score, 60), 100)
}

/**
 * FEATURES: Calculate based on special features and integrations
 */
const calculateFeaturesFromAnalysis = (analysis, project) => {
  let score = 60
  
  const { packageJson, requirementsTxt, composerJson, tree, readme } = analysis
  
  // 1. AI/ML features
  if (packageJson) {
    const deps = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) }
    
    const aiLibraries = [
      '@tensorflow/tfjs', '@openai/api', 'brain.js', 'ml5', 'natural',
      'compromise', 'franc-min', '@huggingface/transformers'
    ]
    
    const aiCount = aiLibraries.filter(lib => deps[lib]).length
    if (aiCount > 0) {
      score += Math.min(aiCount * 8, 25)
    }
  }
  
  // 2. Python AI/ML
  if (requirementsTxt) {
    const requirements = requirementsTxt.toLowerCase()
    
    const pythonAILibs = [
      'tensorflow', 'torch', 'pytorch', 'transformers', 'openai',
      'nltk', 'spacy', 'scikit-learn', 'keras', 'pandas', 'numpy'
    ]
    
    const aiCount = pythonAILibs.filter(lib => requirements.includes(lib)).length
    if (aiCount > 0) {
      score += Math.min(aiCount * 7, 25)
    }
  }
  
  // 3. Third-party integrations
  let integrationCount = 0
  
  if (packageJson) {
    const deps = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) }
    
    const integrations = [
      'stripe', '@stripe/stripe-js', 'paypal', 'twilio', '@sendgrid/mail',
      'cloudinary', 'aws-sdk', '@google/maps', 'mailchimp', 'firebase',
      'axios', 'node-fetch', 'request', 'superagent'
    ]
    
    integrationCount += integrations.filter(lib => deps[lib]).length
  }
  
  if (requirementsTxt) {
    const requirements = requirementsTxt.toLowerCase()
    
    const pythonIntegrations = [
      'boto3', 'stripe', 'twilio', 'sendgrid', 'google-cloud',
      'requests', 'aiohttp', 'websockets'
    ]
    
    integrationCount += pythonIntegrations.filter(lib => requirements.includes(lib)).length
  }
  
  score += Math.min(integrationCount * 4, 15)
  
  // 4. Real-time features
  const hasRealTime = tree.some(item => 
    item.path.includes('socket') ||
    item.path.includes('websocket') ||
    item.path.includes('ws-server') ||
    item.path.includes('pusher') ||
    item.path.includes('socket.io')
  )
  
  if (hasRealTime) {
    score += 12
  }
  
  // 5. Media handling
  const hasMedia = tree.some(item => 
    item.path.includes('media/') ||
    item.path.includes('uploads/') ||
    item.path.includes('public/') && (
      item.path.endsWith('.mp4') ||
      item.path.endsWith('.mp3') ||
      item.path.endsWith('.jpg') ||
      item.path.endsWith('.png')
    )
  )
  
  if (hasMedia) {
    score += 10
  }
  
  // 6. Mobile features
  const hasMobile = tree.some(item => 
    item.path.includes('android/') ||
    item.path.includes('ios/') ||
    item.path.includes('capacitor') ||
    item.path.includes('cordova')
  )
  
  if (hasMobile) {
    score += 12
  }
  
  // 7. Internationalization
  const hasI18n = tree.some(item => 
    item.path.includes('i18n') ||
    item.path.includes('locales') ||
    item.path.includes('translations')
  )
  
  if (hasI18n) {
    score += 8
  }
  
  // 8. Check README for feature mentions
  if (readme) {
    const readmeLower = readme.toLowerCase()
    const featureKeywords = [
      'real-time', 'websocket', 'ai', 'machine learning', 'api',
      'mobile', 'responsive', 'progressive', 'offline', 'push',
      'notification', 'analytics', 'dashboard', 'admin', 'cms'
    ]
    
    const featureCount = featureKeywords.filter(keyword => 
      readmeLower.includes(keyword)
    ).length
    
    score += Math.min(featureCount * 3, 12)
  }
  
  return Math.min(Math.max(score, 60), 100)
}

/**
 * Extract metadata from repository analysis
 */
const extractRepositoryMetadata = (analysis) => {
  const { basicInfo, languages, metrics } = analysis
  
  return {
    stars: basicInfo?.stargazers_count || 0,
    forks: basicInfo?.forks_count || 0,
    issues: basicInfo?.open_issues_count || 0,
    watchers: basicInfo?.watchers_count || 0,
    size: basicInfo?.size || 0,
    language: basicInfo?.language || Object.keys(languages)[0] || 'Unknown',
    languages: Object.keys(languages),
    lastUpdated: basicInfo?.updated_at,
    createdAt: basicInfo?.created_at,
    hasLicense: metrics.hasLicense,
    hasTests: metrics.hasTests,
    hasCI: metrics.hasCI,
    hasDocker: metrics.hasDocker,
    testCoverage: metrics.testCoverage,
    dependencyCount: metrics.dependencyCount,
    fileCount: metrics.fileCount
  }
}

/**
 * Calculate complexity score
 */
const calculateComplexity = (stats, metadata) => {
  const { backend, database, features } = stats
  const { dependencyCount, fileCount } = metadata
  
  let complexity = (backend + database + features) / 3
  
  // Adjust based on repository metrics
  if (dependencyCount > 20) complexity += 3
  if (dependencyCount > 50) complexity += 4
  if (fileCount > 100) complexity += 3
  if (fileCount > 500) complexity += 4
  
  return Math.min(Math.max(Math.round(complexity), 60), 100)
}

/**
 * Calculate impact score
 */
const calculateImpact = (stats, metadata) => {
  const { frontend, devops, features } = stats
  const { stars, forks, issues } = metadata
  
  let impact = (frontend + devops + features) / 3
  
  // Adjust based on repository popularity
  if (stars > 10) impact += 2
  if (stars > 50) impact += 3
  if (stars > 100) impact += 5
  if (forks > 5) impact += 2
  if (issues > 0) impact += 1 // Active issues show engagement
  
  return Math.min(Math.max(Math.round(impact), 60), 100)
}

/**
 * Calculate overall score
 */
const calculateOverallScore = (stats, metadata) => {
  const { frontend, backend, database, devops, features } = stats
  const baseScore = (frontend + backend + database + devops + features) / 5
  
  // Weight the scores slightly based on project type
  let weightedScore = baseScore
  
  // Repository health bonuses
  if (metadata.hasTests) weightedScore += 3
  if (metadata.hasCI) weightedScore += 3
  if (metadata.hasDocker) weightedScore += 2
  if (metadata.hasLicense) weightedScore += 1
  if (metadata.stars > 0) weightedScore += Math.min(metadata.stars / 20, 5)
  
  return Math.min(Math.max(Math.round(weightedScore), 60), 100)
}

/**
 * Calculate confidence in the analysis
 */
const calculateConfidenceScore = (analysis) => {
  let confidence = 70 // Base confidence
  
  const { packageJson, requirementsTxt, composerJson, tree } = analysis
  
  // More data sources = higher confidence
  if (packageJson) confidence += 10
  if (requirementsTxt) confidence += 10
  if (composerJson) confidence += 10
  
  // Good file structure
  if (tree.length > 20) confidence += 5
  if (tree.length > 50) confidence += 5
  
  // Has comprehensive data
  if (analysis.readme) confidence += 5
  if (analysis.dockerfile) confidence += 5
  
  return Math.min(Math.max(confidence, 50), 100)
}