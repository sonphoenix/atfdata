// utils/githubAnalyzer.js
import { Octokit } from '@octokit/rest'

// Initialize Octokit with your GitHub token
const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN || '',
  userAgent: 'portfolio-analytics/v1.0'
})

// Cache for GitHub API responses
const cache = new Map()
const CACHE_DURATION = 1000 * 60 * 30 // 30 minutes

/**
 * Extract owner and repo name from GitHub URL
 */
const parseGitHubUrl = (url) => {
  if (!url) return null
  
  // Handle different URL formats
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/?#]+)/,
    /^([^\/]+)\/([^\/]+)$/ // For "owner/repo" format
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      const owner = match[1]
      let repo = match[2]
      
      // Remove .git suffix if present
      if (repo.endsWith('.git')) {
        repo = repo.slice(0, -4)
      }
      
      // Remove any trailing slash or query params
      repo = repo.split('/')[0].split('?')[0]
      
      return { owner, repo }
    }
  }
  
  return null
}

/**
 * Fetch file content from repository (works for private repos with token)
 */
const fetchFileContent = async (owner, repo, path) => {
  const cacheKey = `${owner}/${repo}/${path}`
  
  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  
  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path,
      headers: {
        'Accept': 'application/vnd.github.v3.raw'
      }
    })
    
    const content = response.data
    
    // Cache the result
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: content
    })
    
    return content
  } catch (error) {
    if (error.status === 404) {
      return null // File doesn't exist
    }
    throw error
  }
}

/**
 * Analyze GitHub repository comprehensively (works for private repos with token)
 */
export const analyzeGitHubRepo = async (githubUrl) => {
  const repoInfo = parseGitHubUrl(githubUrl)
  if (!repoInfo) {
    throw new Error('Invalid GitHub URL')
  }
  
  const { owner, repo } = repoInfo
  const cacheKey = `repo_${owner}_${repo}`
  
  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Using cached data for ${owner}/${repo}`)
    return cached.data
  }
  
  console.log(`Analyzing GitHub repository: ${owner}/${repo}`)
  
  try {
    // Fetch multiple repository data in parallel
    const [
      repoData,
      languages,
      commits,
      readme,
      contributors,
      packageJson,
      requirementsTxt,
      composerJson,
      dockerfile,
      dockerCompose,
      githubActions,
      tree,
      license
    ] = await Promise.allSettled([
      // 1. Basic repository info (works for private repos with token)
      octokit.repos.get({ owner, repo }),
      
      // 2. Programming languages used
      octokit.repos.listLanguages({ owner, repo }),
      
      // 3. Recent commits (last 30)
      octokit.repos.listCommits({ 
        owner, 
        repo, 
        per_page: 30 
      }),
      
      // 4. README content
      fetchFileContent(owner, repo, 'README.md'),
      
      // 5. Contributors
      octokit.repos.listContributors({ owner, repo, per_page: 10 }),
      
      // 6. Package.json (Node.js projects)
      fetchFileContent(owner, repo, 'package.json'),
      
      // 7. requirements.txt (Python projects)
      fetchFileContent(owner, repo, 'requirements.txt'),
      
      // 8. composer.json (PHP projects)
      fetchFileContent(owner, repo, 'composer.json'),
      
      // 9. Dockerfile
      fetchFileContent(owner, repo, 'Dockerfile'),
      
      // 10. docker-compose.yml
      fetchFileContent(owner, repo, 'docker-compose.yml'),
      
      // 11. GitHub Actions workflows
      octokit.repos.getContent({ 
        owner, 
        repo, 
        path: '.github/workflows' 
      }).catch(() => ({ data: [] })),
      
      // 12. Repository tree structure
      octokit.git.getTree({
        owner,
        repo,
        tree_sha: 'HEAD',
        recursive: 1
      }),
      
      // 13. License
      fetchFileContent(owner, repo, 'LICENSE') || 
      fetchFileContent(owner, repo, 'LICENSE.md')
    ])
    
    // Parse and structure the data
    const analysis = {
      basicInfo: repoData.status === 'fulfilled' ? repoData.value.data : null,
      languages: languages.status === 'fulfilled' ? languages.value.data : {},
      commits: commits.status === 'fulfilled' ? commits.value.data : [],
      readme: readme.status === 'fulfilled' ? readme.value : null,
      contributors: contributors.status === 'fulfilled' ? contributors.value.data : [],
      packageJson: packageJson.status === 'fulfilled' ? 
        (() => {
          try {
            return typeof packageJson.value === 'string' ? 
              JSON.parse(packageJson.value) : packageJson.value
          } catch {
            return null
          }
        })() : null,
      requirementsTxt: requirementsTxt.status === 'fulfilled' ? requirementsTxt.value : null,
      composerJson: composerJson.status === 'fulfilled' ? 
        (() => {
          try {
            return typeof composerJson.value === 'string' ? 
              JSON.parse(composerJson.value) : composerJson.value
          } catch {
            return null
          }
        })() : null,
      dockerfile: dockerfile.status === 'fulfilled' ? dockerfile.value : null,
      dockerCompose: dockerCompose.status === 'fulfilled' ? dockerCompose.value : null,
      githubActions: githubActions.status === 'fulfilled' ? githubActions.value.data : [],
      tree: tree.status === 'fulfilled' ? tree.value.data.tree : [],
      license: license.status === 'fulfilled' ? license.value : null,
      
      // Derived metrics
      metrics: {
        hasTests: false,
        hasCI: false,
        hasDocker: false,
        hasDeployment: false,
        hasLicense: false,
        testCoverage: 0,
        dependencyCount: 0,
        fileCount: 0,
        folderStructure: {}
      }
    }
    
    // Analyze repository structure
    analyzeRepositoryStructure(analysis)
    
    // Cache the analysis
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: analysis
    })
    
    return analysis
    
  } catch (error) {
    console.error(`Error analyzing ${owner}/${repo}:`, error.message)
    
    // Check if it's an authentication error
    if (error.status === 401 || error.status === 403) {
      console.error('GitHub token might be invalid or expired. Check your VITE_GITHUB_TOKEN environment variable.')
    }
    
    // Return partial data if available
    return {
      basicInfo: null,
      languages: {},
      error: error.message,
      metrics: {
        hasTests: false,
        hasCI: false,
        hasDocker: false
      }
    }
  }
}

/**
 * Analyze repository structure for metrics
 */
const analyzeRepositoryStructure = (analysis) => {
  const { tree, packageJson, composerJson, requirementsTxt } = analysis
  
  // Count files and detect patterns
  let testCount = 0
  let srcCount = 0
  let configCount = 0
  let hasCI = false
  let hasDocker = false
  
  analysis.metrics.fileCount = tree.length
  
  tree.forEach(item => {
    const path = item.path.toLowerCase()
    
    // Test files
    if (path.includes('test') || 
        path.includes('spec') || 
        path.includes('__tests__') ||
        path.endsWith('.test.js') ||
        path.endsWith('.spec.js') ||
        path.endsWith('.test.ts') ||
        path.endsWith('.spec.ts')) {
      testCount++
    }
    
    // Source code
    if (path.includes('src/') || 
        path.includes('lib/') ||
        path.includes('app/')) {
      srcCount++
    }
    
    // Configuration files
    if (path.includes('config/') || 
        path.endsWith('.config.js') ||
        path.endsWith('.env') ||
        path.includes('.github/')) {
      configCount++
    }
    
    // CI/CD
    if (path.includes('.github/workflows') ||
        path.includes('.gitlab-ci') ||
        path.includes('circleci') ||
        path.includes('jenkinsfile') ||
        path.includes('.travis')) {
      hasCI = true
    }
    
    // Docker
    if (path.includes('dockerfile') || path.includes('docker-compose')) {
      hasDocker = true
    }
  })
  
  // Update metrics
  analysis.metrics.hasTests = testCount > 0
  analysis.metrics.hasCI = hasCI || analysis.githubActions.length > 0
  analysis.metrics.hasDocker = hasDocker || !!analysis.dockerfile
  analysis.metrics.hasLicense = !!analysis.license
  analysis.metrics.testCoverage = srcCount > 0 ? (testCount / srcCount) * 100 : 0
  
  // Dependency count
  if (packageJson) {
    const deps = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {})
    }
    analysis.metrics.dependencyCount = Object.keys(deps).length
  } else if (composerJson) {
    const deps = {
      ...(composerJson.require || {}),
      ...(composerJson['require-dev'] || {})
    }
    analysis.metrics.dependencyCount = Object.keys(deps).length
  } else if (requirementsTxt) {
    const lines = requirementsTxt.split('\n').filter(line => 
      line.trim() && !line.startsWith('#')
    )
    analysis.metrics.dependencyCount = lines.length
  }
  
  // Folder structure analysis
  analysis.metrics.folderStructure = {
    hasSrc: srcCount > 0,
    hasTests: testCount > 0,
    hasConfig: configCount > 0,
    hasPublic: tree.some(item => item.path.includes('public/')),
    hasAssets: tree.some(item => 
      item.path.includes('assets/') || 
      item.path.includes('static/')
    ),
    hasDocs: tree.some(item => 
      item.path.includes('docs/') || 
      item.path.includes('documentation/')
    )
  }
}

/**
 * Check if a GitHub repository is accessible (works for private repos with token)
 */
export const checkRepoAccess = async (githubUrl) => {
  const repoInfo = parseGitHubUrl(githubUrl)
  if (!repoInfo) {
    return {
      accessible: false,
      isPublic: false,
      error: 'Invalid GitHub URL',
      message: 'Cannot parse GitHub URL'
    }
  }
  
  const { owner, repo } = repoInfo
  const cacheKey = `access_${owner}_${repo}`
  
  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  
  try {
    // Try to fetch basic repo info - with token, this works for private repos too
    const repoData = await octokit.repos.get({ owner, repo })
    
    const result = {
      accessible: true,
      isPublic: !repoData.data.private, // Check the actual private field from API
      owner,
      repo,
      name: repoData.data.name,
      description: repoData.data.description,
      stars: repoData.data.stargazers_count,
      forks: repoData.data.forks_count,
      language: repoData.data.language,
      createdAt: repoData.data.created_at,
      updatedAt: repoData.data.updated_at,
      private: repoData.data.private, // Add this for debugging
      size: repoData.data.size,
      hasIssues: repoData.data.has_issues,
      hasProjects: repoData.data.has_projects,
      hasWiki: repoData.data.has_wiki
    }
    
    console.log(`✅ GitHub repo accessible: ${owner}/${repo} (${result.isPublic ? 'Public' : 'Private'})`)
    
    // Cache the result
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: result
    })
    
    return result
    
  } catch (error) {
    console.error(`❌ GitHub repo access error for ${owner}/${repo}:`, error.message)
    
    // Check if it's a 404 (not found) vs other error
    if (error.status === 404) {
      // Repository doesn't exist
      return {
        accessible: false,
        isPublic: false,
        owner,
        repo,
        error: 'Not found',
        message: 'Repository not found (404)'
      }
    } else if (error.status === 403) {
      // Rate limited or token doesn't have access
      return {
        accessible: false,
        isPublic: null,
        owner,
        repo,
        error: 'Access denied',
        message: 'GitHub API rate limit or token insufficient permissions (403)'
      }
    } else if (error.status === 401) {
      // Invalid token
      return {
        accessible: false,
        isPublic: null,
        owner,
        repo,
        error: 'Unauthorized',
        message: 'GitHub token invalid or expired (401)'
      }
    } else {
      // Other error
      return {
        accessible: false,
        isPublic: null,
        owner,
        repo,
        error: error.message,
        message: `GitHub API error: ${error.message}`
      }
    }
  }
}

/**
 * NEW: Check if GitHub token is valid and has repo access
 */
export const validateGitHubToken = async () => {
  try {
    const response = await octokit.users.getAuthenticated()
    console.log(`✅ GitHub token valid for user: ${response.data.login}`)
    return {
      valid: true,
      username: response.data.login,
      scopes: response.headers['x-oauth-scopes'] || 'unknown'
    }
  } catch (error) {
    console.error('❌ GitHub token invalid:', error.message)
    return {
      valid: false,
      error: error.message
    }
  }
}