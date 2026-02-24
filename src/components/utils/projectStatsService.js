// src/components/utils/projectStatsService.js
import { getProjectStatsFromGitHub } from './advancedStatsCalculator'
import { getDataAnalystStatsFromGitHub } from './dataAnalystGithubCalculator'
import { getBasicProjectStats } from './statsCalculator'
import { getDataAnalystProjectStats, isDataAnalystProject } from './dataAnalystStatsCalculator'
import { checkRepoAccess, validateGitHubToken } from './githubAnalyzer'

// Cache for project stats
const statsCache = new Map()
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour

// Token validation cache
let tokenValidated = false
let tokenStatus = null

/**
 * Validate GitHub token on first use
 */
const ensureTokenValidated = async () => {
  if (!tokenValidated) {
    console.log('🔐 Validating GitHub token...')
    tokenStatus = await validateGitHubToken()
    tokenValidated = true
    
    if (tokenStatus.valid) {
      console.log(`✅ GitHub token valid for: ${tokenStatus.username}`)
      console.log(`   Scopes: ${tokenStatus.scopes}`)
    } else {
      console.warn(`⚠️ GitHub token invalid or missing: ${tokenStatus.error}`)
      console.warn('   Public repos will work, but private repos will fail')
    }
  }
  return tokenStatus
}

/**
 * Main function to get project stats with intelligent calculator selection
 */
export const getProjectStats = async (project, options = {}) => {
  const { forceRefresh = false } = options
  const startTime = performance.now()
  
  // Ensure GitHub token is validated
  await ensureTokenValidated()
  
  // Create a unique cache key
  const cacheKey = createCacheKey(project)
  
  // Check cache first (unless forcing refresh)
  if (!forceRefresh) {
    const cached = statsCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      const responseTime = performance.now() - startTime
      console.log(`📊 Using cached stats for: ${project.name}`)
      return {
        ...cached.stats,
        cached: true,
        responseTime
      }
    }
  }
  
  console.log(`🔍 Analyzing project: ${project.name}`)
  console.log(`   GitHub URL: ${project.github}`)
  console.log(`   Has Repo: ${project.hasRepo}`)
  console.log(`   Project isPublic flag: ${project.isPublic}`)
  console.log(`   Has Manual Stats: ${!!project.manualStats}`)
  console.log(`   Force Refresh: ${forceRefresh}`)
  console.log(`   GitHub Token Valid: ${tokenStatus?.valid ? 'Yes' : 'No'}`)
  
  // STEP 1: Determine project type
  const isDataProject = isDataAnalystProject(project)
  const projectType = isDataProject ? 'Data Analyst' : 'Software Engineer'
  console.log(`   📋 Project type: ${projectType}`)
  
  let stats
  let source = 'unknown'
  let confidence = 70
  
  try {
    // STEP 2: Try GitHub analysis for ALL projects with GitHub URLs
    if (project.github && project.hasRepo !== false) {
      console.log(`   🔍 Attempting GitHub analysis...`)
      const accessCheck = await checkRepoAccess(project.github)
      console.log(`   GitHub API Response:`, {
        accessible: accessCheck.accessible,
        apiIsPublic: accessCheck.isPublic,
        apiPrivateFlag: accessCheck.private,
        error: accessCheck.error,
        stars: accessCheck.stars,
        language: accessCheck.language
      })
      
      // ✅ KEY: We only need the repo to be accessible (public OR private with token)
      if (accessCheck.accessible) {
        const repoType = accessCheck.isPublic ? 'Public' : 'Private'
        console.log(`   ✅ GitHub ${repoType} repo accessible!`)
        
        try {
          // Use appropriate GitHub analyzer based on project type
          if (isDataProject) {
            console.log(`   🔍 Using Data Analyst GitHub analyzer`)
            stats = await getDataAnalystStatsFromGitHub(project)
            source = 'data-analyst-github'
            confidence = accessCheck.isPublic ? 95 : 90 // Slightly lower for private
          } else {
            console.log(`   🔍 Using Software Engineer GitHub analyzer`)
            stats = await getProjectStatsFromGitHub(project)
            source = 'github-analysis'
            confidence = accessCheck.isPublic ? 95 : 90 // Slightly lower for private
          }
          
          // Add GitHub metadata to stats
          stats.githubMetadata = {
            stars: accessCheck.stars || 0,
            forks: accessCheck.forks || 0,
            language: accessCheck.language || 'Unknown',
            lastUpdated: accessCheck.updatedAt,
            isPublic: accessCheck.isPublic,
            accessible: true
          }
          
        } catch (githubError) {
          console.log(`   ⚠️ GitHub analyzer failed:`, githubError.message)
          // Fallback based on availability
          if (project.manualStats) {
            console.log(`   🧮 Falling back to manual stats`)
            stats = calculateStatsFromManual(project.manualStats)
            source = 'manual'
            confidence = 85
          } else {
            console.log(`   🧮 Falling back to ${projectType} calculator`)
            stats = isDataProject ? 
              getDataAnalystProjectStats(project) : 
              getBasicProjectStats(project)
            source = isDataProject ? 'data-analyst-calculator' : 'software-calculator'
            confidence = 75
          }
        }
      } else {
        // GitHub not accessible at all
        console.log(`   ❌ GitHub not accessible:`, accessCheck.error || 'Unknown error')
        
        if (project.manualStats) {
          console.log(`   🧮 Using manual stats (GitHub failed)`)
          stats = calculateStatsFromManual(project.manualStats)
          source = 'manual'
          confidence = 85
        } else {
          console.log(`   🧮 Using ${projectType} calculator (GitHub failed)`)
          stats = isDataProject ? 
            getDataAnalystProjectStats(project) : 
            getBasicProjectStats(project)
          source = isDataProject ? 'data-analyst-calculator' : 'software-calculator'
          confidence = 75
        }
      }
    }
    // STEP 3: No GitHub URL - check for manual stats
    else if (project.manualStats) {
      console.log(`   ✋ Using manual stats (no GitHub URL)`)
      stats = calculateStatsFromManual(project.manualStats)
      source = 'manual'
      confidence = 85
    }
    // STEP 4: No GitHub, no manual - use appropriate calculator
    else {
      console.log(`   🧮 Using ${projectType} calculator (no GitHub or manual)`)
      stats = isDataProject ? 
        getDataAnalystProjectStats(project) : 
        getBasicProjectStats(project)
      source = isDataProject ? 'data-analyst-calculator' : 'software-calculator'
      confidence = 70
    }
    
    console.log(`   📈 Calculated stats from ${source}:`, {
      frontend: stats.frontend,
      backend: stats.backend,
      database: stats.database,
      devops: stats.devops,
      features: stats.features,
      overall: stats.overall || 'N/A'
    })
    
    if (stats.githubMetadata) {
      console.log(`   🌟 GitHub metadata:`, stats.githubMetadata)
    }
    
  } catch (error) {
    console.error(`❌ Error analyzing ${project.name}:`, error.message)
    console.error(error.stack)
    
    // Final fallback
    try {
      stats = isDataProject ? 
        getDataAnalystProjectStats(project) : 
        getBasicProjectStats(project)
      source = 'fallback-' + (isDataProject ? 'data' : 'software')
      confidence = 60
    } catch (fallbackError) {
      console.error(`❌ Even fallback failed:`, fallbackError)
      stats = {
        frontend: 70,
        backend: 70,
        database: 70,
        devops: 70,
        features: 70,
        complexity: 70,
        impact: 70,
        overall: 70
      }
      source = 'emergency-fallback'
      confidence = 30
    }
  }
  
  // Add metadata
  const finalStats = {
    ...stats,
    source,
    confidence,
    projectType,
    analyzedAt: new Date().toISOString(),
    projectName: project.name,
    hasGitHub: !!project.github,
    isDataProject,
    usedManual: source === 'manual',
    hasManualStats: !!project.manualStats,
    gitHubTokenValid: tokenStatus?.valid || false
  }
  
  // Cache the results
  statsCache.set(cacheKey, {
    timestamp: Date.now(),
    stats: finalStats
  })
  
  const responseTime = performance.now() - startTime
  console.log(`✅ ${project.name} → ${source} (${confidence}% confidence, ${responseTime.toFixed(0)}ms)`)
  console.log(`   Type: ${projectType}, GitHub: ${project.github ? 'Yes' : 'No'}, Manual: ${project.manualStats ? 'Yes' : 'No'}`)
  console.log(`   Scores: F:${stats.frontend} B:${stats.backend} D:${stats.database} O:${stats.devops} Fe:${stats.features}`)
  console.log('---')
  
  return {
    ...finalStats,
    cached: false,
    responseTime
  }
}

/**
 * Calculate stats from manual input
 */
const calculateStatsFromManual = (manualStats) => {
  console.log(`   📝 Processing manual stats:`, manualStats)
  
  const stats = { ...manualStats }
  
  // Ensure all required fields
  if (!stats.complexity) {
    stats.complexity = Math.floor((stats.backend + stats.database + stats.features) / 3)
  }
  
  if (!stats.impact) {
    stats.impact = Math.floor((stats.frontend + stats.devops + stats.features) / 3)
  }
  
  if (!stats.overall) {
    stats.overall = Math.floor(
      (stats.frontend + stats.backend + stats.database + stats.devops + stats.features) / 5
    )
  }
  
  return stats
}

/**
 * Create cache key from project
 */
const createCacheKey = (project) => {
  const parts = [
    project.id || project.name,
    project.github || 'no-github',
    project.updatedAt || 'no-date'
  ]
  return parts.join('|')
}

/**
 * Force refresh stats for a project (skip cache)
 */
export const forceRefreshStats = async (project) => {
  const cacheKey = createCacheKey(project)
  statsCache.delete(cacheKey) // Clear cache for this project
  console.log(`🔄 Force refreshing stats for: ${project.name}`)
  return await getProjectStats(project, { forceRefresh: true })
}

/**
 * Clear cache
 */
export const clearStatsCache = () => {
  const previousSize = statsCache.size
  statsCache.clear()
  console.log(`📊 Stats cache cleared (was ${previousSize} entries)`)
  return { cleared: previousSize }
}

/**
 * Get GitHub-enhanced stats (force GitHub analysis even with manual stats)
 */
export const getGitHubEnhancedStats = async (project) => {
  console.log(`🚀 Force GitHub analysis for: ${project.name}`)
  
  // Clear cache for this project
  const cacheKey = createCacheKey(project)
  statsCache.delete(cacheKey)
  
  // Ensure token is validated
  await ensureTokenValidated()
  
  if (!project.github) {
    throw new Error('No GitHub URL available')
  }
  
  // Try GitHub analysis directly
  const accessCheck = await checkRepoAccess(project.github)
  
  if (!accessCheck.accessible) {
    throw new Error(`GitHub repo not accessible: ${accessCheck.error}`)
  }
  
  const isDataProject = isDataAnalystProject(project)
  
  try {
    let stats
    let source
    
    if (isDataProject) {
      stats = await getDataAnalystStatsFromGitHub(project)
      source = 'data-analyst-github-forced'
    } else {
      stats = await getProjectStatsFromGitHub(project)
      source = 'github-analysis-forced'
    }
    
    // Add metadata
    const finalStats = {
      ...stats,
      source,
      confidence: 95,
      projectType: isDataProject ? 'Data Analyst' : 'Software Engineer',
      analyzedAt: new Date().toISOString(),
      projectName: project.name,
      hasGitHub: true,
      isDataProject,
      usedManual: false,
      hasManualStats: !!project.manualStats,
      gitHubTokenValid: tokenStatus?.valid || false,
      githubMetadata: {
        stars: accessCheck.stars || 0,
        forks: accessCheck.forks || 0,
        language: accessCheck.language || 'Unknown',
        lastUpdated: accessCheck.updatedAt,
        isPublic: accessCheck.isPublic,
        accessible: true
      }
    }
    
    console.log(`✅ Force GitHub analysis successful: ${source}`)
    return finalStats
    
  } catch (error) {
    console.error(`❌ Force GitHub analysis failed:`, error)
    throw error
  }
}

/**
 * Compare different stat sources for debugging
 */
export const compareStatsSources = async (project) => {
  console.log(`📊 Comparing stats sources for: ${project.name}`)
  
  const manualStats = project.manualStats ? 
    calculateStatsFromManual(project.manualStats) : 
    null
  
  let githubStats = null
  let githubError = null
  
  if (project.github && project.hasRepo !== false) {
    try {
      const accessCheck = await checkRepoAccess(project.github)
      if (accessCheck.accessible) {
        const isDataProject = isDataAnalystProject(project)
        if (isDataProject) {
          githubStats = await getDataAnalystStatsFromGitHub(project)
        } else {
          githubStats = await getProjectStatsFromGitHub(project)
        }
      }
    } catch (error) {
      githubError = error.message
    }
  }
  
  const calculatorStats = isDataAnalystProject(project) ?
    getDataAnalystProjectStats(project) :
    getBasicProjectStats(project)
  
  return {
    project: project.name,
    manual: manualStats,
    github: githubStats,
    calculator: calculatorStats,
    hasManual: !!project.manualStats,
    hasGitHub: !!project.github,
    githubError
  }
}

/**
 * Get all projects with their current analysis source
 */
export const getProjectsAnalysisSummary = async (projects) => {
  console.log(`📋 Getting analysis summary for ${projects.length} projects`)
  
  const results = await Promise.allSettled(
    projects.map(async (project) => {
      try {
        const stats = await getProjectStats(project)
        return {
          name: project.name,
          source: stats.source,
          confidence: stats.confidence,
          hasGitHub: stats.hasGitHub,
          hasManualStats: stats.hasManualStats,
          isDataProject: stats.isDataProject,
          scores: {
            frontend: stats.frontend,
            backend: stats.backend,
            database: stats.database,
            devops: stats.devops,
            features: stats.features
          }
        }
      } catch (error) {
        return {
          name: project.name,
          error: error.message,
          source: 'error'
        }
      }
    })
  )
  
  const summary = {
    total: projects.length,
    successful: results.filter(r => r.status === 'fulfilled').length,
    failed: results.filter(r => r.status === 'rejected').length,
    bySource: {},
    byType: {}
  }
  
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      const project = result.value
      summary.bySource[project.source] = (summary.bySource[project.source] || 0) + 1
      summary.byType[project.isDataProject ? 'Data Analyst' : 'Software Engineer'] = 
        (summary.byType[project.isDataProject ? 'Data Analyst' : 'Software Engineer'] || 0) + 1
    }
  })
  
  return summary
}

/**
 * Pre-warm cache for specific projects
 */
export const preloadProjectStats = async (projects) => {
  console.log(`🔥 Pre-loading stats for ${projects.length} projects...`)
  
  const results = await Promise.allSettled(
    projects.map(project => getProjectStats(project))
  )
  
  const successful = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  
  console.log(`✅ Pre-loaded ${successful}/${projects.length} projects (${failed} failed)`)
  
  // Log failures for debugging
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.warn(`   ❌ Failed to pre-load ${projects[index].name}:`, result.reason.message)
    }
  })
  
  return {
    total: projects.length,
    successful,
    failed
  }
}

/**
 * Get performance statistics
 */
export const getPerformanceStats = () => {
  return {
    cacheSize: statsCache.size,
    cachedProjects: Array.from(statsCache.keys()).slice(0, 10),
    cacheAge: Array.from(statsCache.values()).map(item => ({
      age: Date.now() - item.timestamp,
      project: item.stats.projectName,
      source: item.stats.source
    })).slice(0, 5),
    tokenStatus: tokenStatus
  }
}

/**
 * Get analysis summary for debugging
 */
export const getAnalysisSummary = () => {
  const allStats = Array.from(statsCache.values())
  
  const bySource = {}
  const byType = {}
  const byHasManual = { hasManual: 0, noManual: 0 }
  const byHasGitHub = { hasGitHub: 0, noGitHub: 0 }
  
  allStats.forEach(item => {
    const source = item.stats.source
    const type = item.stats.projectType
    const hasManual = item.stats.hasManualStats
    const hasGitHub = item.stats.hasGitHub
    
    bySource[source] = (bySource[source] || 0) + 1
    byType[type] = (byType[type] || 0) + 1
    byHasManual[hasManual ? 'hasManual' : 'noManual']++
    byHasGitHub[hasGitHub ? 'hasGitHub' : 'noGitHub']++
  })
  
  return {
    totalCached: allStats.length,
    bySource,
    byType,
    byHasManual,
    byHasGitHub,
    tokenValid: tokenStatus?.valid || false,
    tokenUsername: tokenStatus?.username || 'none'
  }
}