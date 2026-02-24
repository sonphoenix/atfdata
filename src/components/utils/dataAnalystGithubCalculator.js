// utils/dataAnalystGithubCalculator.js
import { analyzeGitHubRepo } from './githubAnalyzer'

/**
 * GitHub-enhanced Data Analyst stats calculator
 * Combines GitHub repository analysis with data science/AI/ML tool detection
 */
export const getDataAnalystStatsFromGitHub = async (project) => {
  if (!project.github) {
    throw new Error('No GitHub URL provided')
  }
  
  try {
    const repoAnalysis = await analyzeGitHubRepo(project.github)
    
    // Calculate stats based on repository analysis with data science focus
    const stats = {
      frontend: calculateDataVisualizationFromGitHub(repoAnalysis, project),
      backend: calculateDataProcessingFromGitHub(repoAnalysis, project),
      database: calculateDataStorageFromGitHub(repoAnalysis, project),
      devops: calculateDataOpsFromGitHub(repoAnalysis, project),
      features: calculateDataScienceFromGitHub(repoAnalysis, project)
    }
    
    // Add repository metadata
    const metadata = extractRepositoryMetadata(repoAnalysis)
    
    // Calculate derived stats
    stats.complexity = calculateDataComplexity(stats, metadata)
    stats.impact = calculateDataImpact(stats, metadata)
    stats.overall = calculateDataOverallScore(stats, metadata)
    
    return {
      ...stats,
      metadata,
      source: 'data-analyst-github',
      lastUpdated: new Date().toISOString(),
      confidence: calculateDataConfidenceScore(repoAnalysis)
    }
    
  } catch (error) {
    console.error('Data Analyst GitHub analysis failed:', error)
    throw error
  }
}

/**
 * DATA VISUALIZATION: Calculate based on visualization libraries
 */
const calculateDataVisualizationFromGitHub = (analysis, project) => {
  let score = 70 // Base score for data projects
  
  const { requirementsTxt, tree, readme } = analysis
  
  // 1. Python visualization libraries
  if (requirementsTxt) {
    const requirements = requirementsTxt.toLowerCase()
    
    // Streamlit - interactive dashboards (+22)
    if (requirements.includes('streamlit')) {
      score += 22
    }
    
    // Plotly - interactive plots (+18)
    if (requirements.includes('plotly')) {
      score += 18
    }
    
    // Matplotlib & Seaborn (+16)
    const vizLibs = ['matplotlib', 'seaborn', 'bokeh', 'altair']
    const vizCount = vizLibs.filter(lib => requirements.includes(lib)).length
    score += Math.min(vizCount * 8, 16)
  }
  
  // 2. Check for dashboard files
  const hasDashboardFiles = tree.some(item => 
    item.path.includes('dashboard') || 
    item.path.includes('app.py') ||
    item.path.includes('visualization') ||
    item.path.endsWith('.ipynb') // Jupyter notebooks
  )
  
  if (hasDashboardFiles) {
    score += 12
  }
  
  // 3. Check for plot/image files
  const hasPlotFiles = tree.some(item => 
    item.path.endsWith('.png') && (
      item.path.includes('plot') || 
      item.path.includes('chart') ||
      item.path.includes('figure')
    )
  )
  
  if (hasPlotFiles) {
    score += 8
  }
  
  // 4. Check README for visualization mentions
  if (readme) {
    const readmeLower = readme.toLowerCase()
    const vizKeywords = ['visualization', 'dashboard', 'plot', 'chart', 'graph', 'interactive']
    const vizKeywordCount = vizKeywords.filter(keyword => readmeLower.includes(keyword)).length
    
    score += Math.min(vizKeywordCount * 3, 9)
  }
  
  return Math.min(Math.max(score, 70), 100)
}

/**
 * DATA PROCESSING: Calculate based on data processing libraries
 */
const calculateDataProcessingFromGitHub = (analysis, project) => {
  let score = 70
  
  const { requirementsTxt, tree, languages } = analysis
  
  // 1. Pandas - KING of data processing (+25)
  if (requirementsTxt && requirementsTxt.toLowerCase().includes('pandas')) {
    score += 25
  }
  
  // 2. NumPy for numerical computing (+15)
  if (requirementsTxt && requirementsTxt.toLowerCase().includes('numpy')) {
    score += 15
  }
  
  // 3. Other data processing libraries (+12 max)
  if (requirementsTxt) {
    const requirements = requirementsTxt.toLowerCase()
    const processingLibs = ['scipy', 'scikit-learn', 'statsmodels', 'dask', 'polars', 'modin']
    const procCount = processingLibs.filter(lib => requirements.includes(lib)).length
    score += Math.min(procCount * 4, 12)
  }
  
  // 4. Python language bonus (since most data work is in Python)
  if (languages.Python || (requirementsTxt && requirementsTxt.length > 0)) {
    score += 8
  }
  
  // 5. Check for data processing files
  const hasProcessingFiles = tree.some(item => 
    item.path.includes('pipeline') || 
    item.path.includes('processing') ||
    item.path.includes('transform') ||
    item.path.includes('etl') ||
    item.path.includes('preprocessing')
  )
  
  if (hasProcessingFiles) {
    score += 10
  }
  
  // 6. Check for large/complex data files
  const hasDataFiles = tree.some(item => 
    item.path.endsWith('.csv') || 
    item.path.endsWith('.parquet') ||
    item.path.endsWith('.feather') ||
    item.path.endsWith('.h5') ||
    item.path.includes('data/')
  )
  
  if (hasDataFiles) {
    score += 7
  }
  
  return Math.min(Math.max(score, 70), 100)
}

/**
 * DATA STORAGE: Calculate based on data storage libraries
 */
const calculateDataStorageFromGitHub = (analysis, project) => {
  let score = 70
  
  const { requirementsTxt, tree, packageJson } = analysis
  
  // 1. SQLAlchemy - Python ORM (+20)
  if (requirementsTxt && requirementsTxt.toLowerCase().includes('sqlalchemy')) {
    score += 20
  }
  
  // 2. Database connectors (+15 max)
  if (requirementsTxt) {
    const requirements = requirementsTxt.toLowerCase()
    const dbLibs = ['psycopg2', 'mysql-connector', 'sqlite3', 'pymongo', 'redis', 'sqlite']
    const dbCount = dbLibs.filter(lib => requirements.includes(lib)).length
    score += Math.min(dbCount * 5, 15)
  }
  
  // 3. Check for SQL files and migrations
  const hasSQLFiles = tree.some(item => 
    item.path.endsWith('.sql') || 
    item.path.includes('migrations/') ||
    item.path.includes('schema')
  )
  
  if (hasSQLFiles) {
    score += 12
  }
  
  // 4. Check for data models/classes
  const hasModels = tree.some(item => 
    item.path.includes('models/') || 
    item.path.includes('entities/') ||
    (item.path.endsWith('.py') && (
      item.path.includes('model') || 
      item.path.includes('schema')
    ))
  )
  
  if (hasModels) {
    score += 10
  }
  
  // 5. Check for database configuration
  const hasDbConfig = tree.some(item => 
    item.path.includes('database') || 
    item.path.includes('db_config') ||
    item.path.includes('connection')
  )
  
  if (hasDbConfig) {
    score += 8
  }
  
  return Math.min(Math.max(score, 70), 100)
}

/**
 * DATAOPS: Calculate based on data operations tools
 */
const calculateDataOpsFromGitHub = (analysis, project) => {
  let score = 70
  
  const { requirementsTxt, tree, dockerfile, githubActions, metrics } = analysis
  
  // 1. Apache Airflow - data pipeline orchestration (+25)
  if (requirementsTxt && requirementsTxt.toLowerCase().includes('apache-airflow')) {
    score += 25
  } else if (requirementsTxt && requirementsTxt.toLowerCase().includes('airflow')) {
    score += 22
  }
  
  // 2. Docker support for data pipelines (+15)
  if (dockerfile) {
    score += 15
    
    // Check for multi-stage builds (common in data pipelines)
    const dockerContent = dockerfile.toLowerCase()
    if (dockerContent.includes('multi-stage')) score += 5
    if (dockerContent.includes('python') && dockerContent.includes('data')) score += 5
  }
  
  // 3. CI/CD for data pipelines (+12)
  if (metrics.hasCI) {
    score += 12
    
    // GitHub Actions workflows
    if (githubActions.length > 0) {
      score += 5
      
      // Check for data-specific workflows
      const hasDataWorkflow = githubActions.some(action => 
        action.name && (
          action.name.toLowerCase().includes('data') ||
          action.name.toLowerCase().includes('pipeline') ||
          action.name.toLowerCase().includes('etl')
        )
      )
      
      if (hasDataWorkflow) score += 5
    }
  }
  
  // 4. Testing for data pipelines (+10)
  if (metrics.hasTests) {
    score += 10
    
    // Test coverage bonus
    if (metrics.testCoverage > 50) score += 5
    if (metrics.testCoverage > 80) score += 5
  }
  
  // 5. Check for data pipeline configuration
  const hasPipelineConfig = tree.some(item => 
    item.path.includes('dag') || // Airflow DAGs
    item.path.includes('pipeline') ||
    item.path.includes('orchestration') ||
    item.path.includes('schedule')
  )
  
  if (hasPipelineConfig) {
    score += 8
  }
  
  // 6. Environment management for data projects
  const hasEnvManagement = tree.some(item => 
    item.path.includes('.env') ||
    item.path.includes('config/') && (
      item.path.endsWith('.yaml') || 
      item.path.endsWith('.yml') ||
      item.path.endsWith('.json')
    )
  )
  
  if (hasEnvManagement) {
    score += 7
  }
  
  return Math.min(Math.max(score, 70), 100)
}

/**
 * DATA SCIENCE: Calculate based on AI/ML/NLP libraries
 */
const calculateDataScienceFromGitHub = (analysis, project) => {
  let score = 70
  
  const { requirementsTxt, tree, readme, languages } = analysis
  
  // 1. PyTorch - Deep Learning (+25)
  if (requirementsTxt && requirementsTxt.toLowerCase().includes('torch')) {
    score += 25
  }
  
  // 2. TensorFlow (+22)
  if (requirementsTxt && requirementsTxt.toLowerCase().includes('tensorflow')) {
    score += 22
  }
  
  // 3. Scikit-learn - ML (+18)
  if (requirementsTxt && requirementsTxt.toLowerCase().includes('scikit-learn')) {
    score += 18
  }
  
  // 4. NLP libraries (+15 max)
  if (requirementsTxt) {
    const requirements = requirementsTxt.toLowerCase()
    const nlpLibs = ['nltk', 'spacy', 'transformers', 'gensim', 'textblob']
    const nlpCount = nlpLibs.filter(lib => requirements.includes(lib)).length
    score += Math.min(nlpCount * 5, 15)
  }
  
  // 5. Check for Jupyter notebooks (data science work)
  const hasNotebooks = tree.some(item => 
    item.path.endsWith('.ipynb') || 
    item.path.includes('notebooks/')
  )
  
  if (hasNotebooks) {
    score += 12
  }
  
  // 6. Check for model files
  const hasModelFiles = tree.some(item => 
    item.path.endsWith('.pkl') || 
    item.path.endsWith('.joblib') ||
    item.path.endsWith('.h5') ||
    item.path.endsWith('.pt') ||
    item.path.includes('model') && (
      item.path.endsWith('.py') || 
      item.path.endsWith('.json')
    )
  )
  
  if (hasModelFiles) {
    score += 10
  }
  
  // 7. Check README for data science mentions
  if (readme) {
    const readmeLower = readme.toLowerCase()
    const dsKeywords = [
      'machine learning', 'deep learning', 'neural network', 
      'artificial intelligence', 'ai', 'ml', 'nlp', 'natural language',
      'predictive', 'regression', 'classification', 'clustering'
    ]
    
    const dsKeywordCount = dsKeywords.filter(keyword => readmeLower.includes(keyword)).length
    score += Math.min(dsKeywordCount * 3, 12)
  }
  
  // 8. Web scraping libraries (+8)
  if (requirementsTxt && requirementsTxt.toLowerCase().includes('beautifulsoup')) {
    score += 8
  } else if (requirementsTxt && requirementsTxt.toLowerCase().includes('scrapy')) {
    score += 8
  } else if (requirementsTxt && requirementsTxt.toLowerCase().includes('selenium')) {
    score += 8
  }
  
  return Math.min(Math.max(score, 70), 100)
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
 * Calculate complexity score for data projects
 */
const calculateDataComplexity = (stats, metadata) => {
  const { backend, database, features } = stats
  const { dependencyCount, fileCount } = metadata
  
  let complexity = (backend + database + features) / 3
  
  // Adjust based on repository metrics
  if (dependencyCount > 10) complexity += 3
  if (dependencyCount > 25) complexity += 4
  if (fileCount > 50) complexity += 3
  if (fileCount > 100) complexity += 4
  
  // Bonus for AI/ML projects
  if (features > 85) complexity += 5
  
  return Math.min(Math.max(Math.round(complexity), 70), 100)
}

/**
 * Calculate impact score for data projects
 */
const calculateDataImpact = (stats, metadata) => {
  const { frontend, devops, features } = stats
  const { stars, forks, issues } = metadata
  
  let impact = (frontend + devops + features) / 3
  
  // Adjust based on repository popularity
  if (stars > 5) impact += 2
  if (stars > 20) impact += 3
  if (stars > 50) impact += 5
  if (forks > 3) impact += 2
  if (issues > 0) impact += 2 // Active issues show engagement
  
  // Bonus for deployed data projects
  if (devops > 80) impact += 3
  
  return Math.min(Math.max(Math.round(impact), 70), 100)
}

/**
 * Calculate overall score for data projects
 */
const calculateDataOverallScore = (stats, metadata) => {
  const { frontend, backend, database, devops, features } = stats
  const baseScore = (frontend + backend + database + devops + features) / 5
  
  // Data project specific bonuses
  let weightedScore = baseScore
  
  // Repository health bonuses
  if (metadata.hasTests) weightedScore += 4  // Tests are extra important for data projects
  if (metadata.hasCI) weightedScore += 4     // CI/CD for data pipelines
  if (metadata.hasDocker) weightedScore += 3 // Docker for reproducibility
  if (metadata.hasLicense) weightedScore += 2
  
  // Popularity bonus
  if (metadata.stars > 0) weightedScore += Math.min(metadata.stars / 10, 8)
  
  // File count bonus (more files = more complex data project)
  if (metadata.fileCount > 50) weightedScore += 3
  
  return Math.min(Math.max(Math.round(weightedScore), 70), 100)
}

/**
 * Calculate confidence in the analysis for data projects
 */
const calculateDataConfidenceScore = (analysis) => {
  let confidence = 75 // Base confidence higher for data projects
  
  const { requirementsTxt, tree, readme } = analysis
  
  // Data science libraries indicate good analysis
  if (requirementsTxt) {
    const requirements = requirementsTxt.toLowerCase()
    
    // Key data science libraries
    const keyDataLibs = ['pandas', 'numpy', 'matplotlib', 'scikit-learn']
    const keyLibCount = keyDataLibs.filter(lib => requirements.includes(lib)).length
    
    confidence += keyLibCount * 10
    
    // Advanced libraries bonus
    if (requirements.includes('torch') || requirements.includes('tensorflow')) confidence += 10
    if (requirements.includes('sqlalchemy')) confidence += 8
    if (requirements.includes('streamlit') || requirements.includes('plotly')) confidence += 7
    if (requirements.includes('apache-airflow')) confidence += 10
  }
  
  // Good file structure
  if (tree.length > 30) confidence += 5
  if (tree.length > 75) confidence += 5
  
  // Has comprehensive data
  if (readme) confidence += 8
  if (analysis.dockerfile) confidence += 7
  
  // Jupyter notebooks indicate data work
  const hasNotebooks = tree.some(item => item.path.endsWith('.ipynb'))
  if (hasNotebooks) confidence += 10
  
  return Math.min(Math.max(confidence, 60), 100)
}