/**
 * Calculate the position of a stat label around the star based on angle and value
 * @param {number} angle - Angle in radians
 * @param {number} value - Stat value (0-100)
 * @param {number} maxValue - Maximum value (default: 100)
 * @returns {object} CSS position object with left, top, and transform properties
 */
export const calculateStatPosition = (angle, value, maxValue = 100) => {
  const normalizedValue = value / maxValue
  const distance = 0.5 + (normalizedValue * 2.5)
  
  const scale = 60
  const vertexX = Math.cos(angle) * distance * scale
  const vertexY = -Math.sin(angle) * distance * scale
  
  return {
    left: `calc(50% + ${vertexX}px)`,
    top: `calc(50% + ${vertexY}px)`,
    transform: 'translate(-50%, -50%)'
  }
}

/**
 * Get project images from the project object
 * @param {object} selectedProject - The selected project object
 * @returns {object} Object containing hasImages, imageUrls, and allImageUrls
 */
export const getProjectImages = (selectedProject) => {
  const projectImages = selectedProject?.projectImages || selectedProject?.project?.projectImages
  const hasImages = projectImages && projectImages.count > 0
  
  const imageUrls = hasImages ? 
    Array.from({ length: Math.min(projectImages.count, 3) }, (_, i) => 
      `${projectImages.path}/${i + 1}.png`
    ) : []

  const allImageUrls = hasImages ?
    Array.from({ length: projectImages.count }, (_, i) => 
      `${projectImages.path}/${i + 1}.png`
    ) : []
  
  return { hasImages, imageUrls, allImageUrls }
}

/**
 * Get project links (github, live, playStore)
 * @param {object} selectedProject - The selected project object
 * @returns {object} Object containing github, live, and playStore links
 */
export const getProjectLinks = (selectedProject) => {
  return {
    github: selectedProject.github || selectedProject.project?.github,
    live: selectedProject.live || selectedProject.project?.live,
    playStore: selectedProject.playStore || selectedProject.project?.playStore
  }
}
