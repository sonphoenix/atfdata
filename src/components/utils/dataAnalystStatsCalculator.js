// utils/dataAnalystStatsCalculator.js
/**
 * CALIBRATED DATA ANALYST STATS CALCULATOR
 * 
 * Base score: 70 (not 60!)
 * Properly rewards: Pandas, NumPy, Matplotlib, Seaborn, NLTK, SpaCy, PyTorch, Airflow
 */

export const getDataAnalystProjectStats = (project) => {
  console.log(`🔍 Calculating stats for: ${project.name}`)
  console.log(`   Tech stack:`, project.tech)
  
  const stats = {
    frontend: calculateDataVisualization(project),
    backend: calculateDataProcessing(project),
    database: calculateDataStorage(project),
    devops: calculateDataOps(project),
    features: calculateDataScience(project)
  }
  
  stats.complexity = Math.floor((stats.backend + stats.database + stats.features) / 3)
  stats.impact = Math.floor((stats.frontend + stats.devops + stats.features) / 3)
  stats.overall = Math.floor((stats.frontend + stats.backend + stats.database + stats.devops + stats.features) / 5)
  
  console.log(`   📊 Final Stats:`, stats)
  
  return stats
}

// ============================================================================
// FRONTEND = DATA VISUALIZATION
// ============================================================================
const calculateDataVisualization = (project) => {
  let score = 70 // BASE INCREASED FROM 60
  const breakdown = []
  
  // Dashboard frameworks (+20)
  const dashboards = { 'Streamlit': 20, 'Dash': 18, 'Tableau': 20, 'Power BI': 20 }
  for (const [tool, points] of Object.entries(dashboards)) {
    if (project.tech.some(t => t.includes(tool))) {
      score += points
      breakdown.push(`${tool}:+${points}`)
      break
    }
  }
  
  // Viz libraries - THEY ADD UP! (+18 max)
  let vizScore = 0
  const vizLibs = { 'Plotly': 9, 'Matplotlib': 8, 'Seaborn': 8 }
  for (const [lib, points] of Object.entries(vizLibs)) {
    if (project.tech.some(t => t.includes(lib))) {
      vizScore += points
      breakdown.push(`${lib}:+${points}`)
    }
  }
  score += Math.min(vizScore, 18)
  
  // Keywords (+8)
  const desc = project.description.toLowerCase()
  if (desc.includes('visualiz') || desc.includes('dashboard') || desc.includes('chart')) {
    score += 8
    breakdown.push('viz_keywords:+8')
  }
  
  const final = Math.min(score, 100)
  console.log(`   📊 Frontend: ${final} [${breakdown.join(', ')}]`)
  return final
}

// ============================================================================
// BACKEND = DATA PROCESSING
// ============================================================================
const calculateDataProcessing = (project) => {
  let score = 70 // BASE INCREASED
  const breakdown = []
  
  // PANDAS IS KING! (+20)
  if (project.tech.some(t => t.includes('Pandas'))) {
    score += 20
    breakdown.push('Pandas:+20')
  } else if (project.tech.some(t => t.includes('NumPy'))) {
    score += 16
    breakdown.push('NumPy:+16')
  } else if (project.tech.some(t => t.includes('Python'))) {
    score += 10
    breakdown.push('Python:+10')
  }
  
  // ETL/Pipeline (+12)
  const desc = project.description.toLowerCase()
  if (desc.includes('etl') || desc.includes('elt') || desc.includes('pipeline') || desc.includes('ingestion')) {
    score += 12
    breakdown.push('pipeline:+12')
  }
  
  // Processing keywords (+8)
  if (desc.includes('processing') || desc.includes('analysis') || desc.includes('transform')) {
    score += 8
    breakdown.push('processing:+8')
  }
  
  const final = Math.min(score, 100)
  console.log(`   ⚙️ Backend: ${final} [${breakdown.join(', ')}]`)
  return final
}

// ============================================================================
// DATABASE = DATA STORAGE
// ============================================================================
const calculateDataStorage = (project) => {
  let score = 70 // BASE INCREASED
  const breakdown = []
  
  // Databases (+20)
  const dbs = { 'PostgreSQL': 20, 'MySQL': 16, 'MariaDB': 16, 'SQLite': 14, 'MongoDB': 15 }
  for (const [db, points] of Object.entries(dbs)) {
    if (project.tech.some(t => t.includes(db))) {
      score += points
      breakdown.push(`${db}:+${points}`)
      break
    }
  }
  
  // ORMs (+12)
  if (project.tech.some(t => t.includes('SQLAlchemy'))) {
    score += 12
    breakdown.push('SQLAlchemy:+12')
  }
  
  // SQL keywords (+8)
  if (project.tech.some(t => t.toLowerCase().includes('sql')) || 
      project.description.toLowerCase().includes('sql')) {
    score += 8
    breakdown.push('SQL:+8')
  }
  
  const final = Math.min(score, 100)
  console.log(`   💾 Database: ${final} [${breakdown.join(', ')}]`)
  return final
}

// ============================================================================
// DEVOPS = DATAOPS
// ============================================================================
const calculateDataOps = (project) => {
  let score = 70 // BASE INCREASED
  const breakdown = []
  
  // Orchestration (+22)
  if (project.tech.some(t => t.includes('Airflow'))) {
    score += 22
    breakdown.push('Airflow:+22')
  } else if (project.tech.some(t => t.includes('Prefect') || t.includes('Dagster'))) {
    score += 18
    breakdown.push('orchestration:+18')
  }
  
  // Docker (+12)
  if (project.tech.some(t => t.includes('Docker'))) {
    score += 12
    breakdown.push('Docker:+12')
  }
  
  // Automation keywords (+8)
  const desc = project.description.toLowerCase()
  if (desc.includes('automat') || desc.includes('orchestrat')) {
    score += 8
    breakdown.push('automation:+8')
  }
  
  const final = Math.min(score, 100)
  console.log(`   🚀 DevOps: ${final} [${breakdown.join(', ')}]`)
  return final
}

// ============================================================================
// FEATURES = DATA SCIENCE
// ============================================================================
const calculateDataScience = (project) => {
  let score = 70 // BASE INCREASED
  const breakdown = []
  
  // Deep Learning (+22)
  if (project.tech.some(t => t.includes('PyTorch'))) {
    score += 22
    breakdown.push('PyTorch:+22')
  } else if (project.tech.some(t => t.includes('TensorFlow'))) {
    score += 20
    breakdown.push('TensorFlow:+20')
  } else if (project.tech.some(t => t.includes('Scikit-learn'))) {
    score += 16
    breakdown.push('Scikit-learn:+16')
  }
  
  // NLP - THEY ADD UP! (+18 max)
  let nlpScore = 0
  if (project.tech.some(t => t.includes('NLTK'))) {
    nlpScore += 9
    breakdown.push('NLTK:+9')
  }
  if (project.tech.some(t => t.includes('SpaCy'))) {
    nlpScore += 9
    breakdown.push('SpaCy:+9')
  }
  if (project.tech.some(t => t.includes('NLP')) || 
      project.description.toLowerCase().includes('nlp')) {
    nlpScore += 8
    breakdown.push('NLP:+8')
  }
  score += Math.min(nlpScore, 18)
  
  // Scientific computing (+12)
  if (project.tech.some(t => t.includes('SciPy'))) {
    score += 12
    breakdown.push('SciPy:+12')
  } else if (project.tech.some(t => t.includes('NumPy'))) {
    score += 10
    breakdown.push('NumPy:+10')
  }
  
  // Keywords (+8)
  const desc = project.description.toLowerCase()
  if (desc.includes('neural network') || desc.includes('machine learning') || desc.includes('deep learning')) {
    score += 8
    breakdown.push('ML_keywords:+8')
  }
  
  // Text Analysis (+6)
  if (desc.includes('text analysis') || desc.includes('linguistic') || 
      project.tech.some(t => t.includes('Text Analysis'))) {
    score += 6
    breakdown.push('text_analysis:+6')
  }
  
  // Web Scraping (+6)
  if (project.tech.some(t => t.includes('Web Scraping')) || desc.includes('scrap')) {
    score += 6
    breakdown.push('scraping:+6')
  }
  
  const final = Math.min(score, 100)
  console.log(`   🧪 Features: ${final} [${breakdown.join(', ')}]`)
  return final
}

export const isDataAnalystProject = (project) => {
  const dataTech = [
    'Pandas', 'NumPy', 'Airflow', 'Streamlit', 'Plotly', 'Matplotlib', 'Seaborn',
    'PyTorch', 'TensorFlow', 'NLTK', 'SpaCy', 'NLP', 'SQLAlchemy', 'SciPy',
    'Data Processing', 'Text Analysis', 'Web Scraping', 'Data Ingestion'
  ]
  
  const hasDataTech = project.tech.some(t => dataTech.some(dt => t.includes(dt)))
  const desc = project.description.toLowerCase()
  const dataKeywords = ['pipeline', 'etl', 'elt', 'nlp', 'text analysis', 'linguistic', 'data visualization', 'dashboard', 'batch processing', 'machine learning', 'scraper']
  const hasDataKeyword = dataKeywords.some(kw => desc.includes(kw))
  
  return hasDataTech || hasDataKeyword
}

export const getDataAnalystStatSubLabel = (statKey, value) => {
  const labels = {
    frontend: [
      { min: 95, label: 'Executive-Ready' },
      { min: 90, label: 'Interactive' },
      { min: 85, label: 'Comprehensive' },
      { min: 80, label: 'Insightful' },
      { min: 70, label: 'Clear' },
      { min: 0, label: 'Basic' }
    ],
    backend: [
      { min: 95, label: 'Distributed' },
      { min: 90, label: 'Scalable' },
      { min: 85, label: 'Optimized' },
      { min: 80, label: 'Efficient' },
      { min: 70, label: 'Functional' },
      { min: 0, label: 'Simple' }
    ],
    database: [
      { min: 95, label: 'Enterprise DW' },
      { min: 90, label: 'Data Lake' },
      { min: 85, label: 'Optimized' },
      { min: 80, label: 'Structured' },
      { min: 70, label: 'Organized' },
      { min: 0, label: 'Basic' }
    ],
    devops: [
      { min: 95, label: 'Fully Automated' },
      { min: 90, label: 'Orchestrated' },
      { min: 85, label: 'Monitored' },
      { min: 80, label: 'Scheduled' },
      { min: 70, label: 'Manual' },
      { min: 0, label: 'Local' }
    ],
    features: [
      { min: 95, label: 'AI/Deep Learning' },
      { min: 90, label: 'ML/Predictive' },
      { min: 85, label: 'Advanced Analytics' },
      { min: 80, label: 'Statistical' },
      { min: 70, label: 'Analytical' },
      { min: 0, label: 'Descriptive' }
    ]
  }
  
  const statLabels = labels[statKey] || labels.frontend
  const label = statLabels.find(l => value >= l.min)
  return label ? label.label : 'Basic'
}