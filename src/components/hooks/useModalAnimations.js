import { useState, useEffect, useRef } from 'react'
import { ANIMATION_TIMINGS } from '../utils/constants'

/**
 * Custom hook to manage all animation states for the PersonaStatsModal
 * @param {object} selectedProject - The currently selected project
 * @param {function} onClose - Callback function to close the modal
 * @returns {object} Animation states and handlers
 */
export const useModalAnimations = (selectedProject, onClose) => {
  const [animateIn, setAnimateIn] = useState(false)
  const [animateOut, setAnimateOut] = useState(false)
  const [modelAnimateIn, setModelAnimateIn] = useState(false)
  const [starAnimateIn, setStarAnimateIn] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const animationTimeoutsRef = useRef([])
  const closeTimeoutRef = useRef(null)
  const dropdownTimeoutRef = useRef(null)

  // Cleanup function for all timers
  const cleanupTimers = () => {
    animationTimeoutsRef.current.forEach(timer => clearTimeout(timer))
    animationTimeoutsRef.current = []
    
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
    }
  }

  // Trigger entrance animations
  const triggerAnimations = () => {
    //console.log('🚀 Triggering entrance animations')
    
    const timer1 = setTimeout(() => {
      //console.log('🚀 Triggering animateIn')
      setAnimateIn(true)
    }, ANIMATION_TIMINGS.ENTRANCE_ANIMATION)
    animationTimeoutsRef.current.push(timer1)
    
    const timer2 = setTimeout(() => {
      //console.log('📦 Triggering modelAnimateIn')
      setModelAnimateIn(true)
    }, ANIMATION_TIMINGS.MODEL_ANIMATION_DELAY)
    animationTimeoutsRef.current.push(timer2)
    
    const timer3 = setTimeout(() => {
      //console.log('⭐ Triggering starAnimateIn')
      setStarAnimateIn(true)
    }, ANIMATION_TIMINGS.STAR_ANIMATION_DELAY)
    animationTimeoutsRef.current.push(timer3)
  }

  // Reset all animation states
  const resetAnimations = () => {
    setAnimateIn(false)
    setAnimateOut(false)
    setModelAnimateIn(false)
    setStarAnimateIn(false)
    setIsClosing(false)
    setShowActions(false)
  }

  // Handle close with epic animation sequence
  const handleClose = () => {
    //console.log("🔄 PersonaStatsModal: EPIC CLOSE triggered")
    
    if (isClosing) {
      //console.log("❌ handleClose: Already closing, ignoring")
      return
    }
    
    cleanupTimers()
    
    // Blur any focused element
    if (document.activeElement) {
      document.activeElement.blur()
    }
    
    //console.log("⏩ handleClose: Setting isClosing=true, animateOut=true")
    setIsClosing(true)
    setAnimateOut(true)
    setModelAnimateIn(false)
    setStarAnimateIn(false)
    setAnimateIn(false)
    
    //console.log("⏳ handleClose: Starting exit timeout")
    closeTimeoutRef.current = setTimeout(() => {
      //console.log("✅ handleClose: EPIC close complete, calling onClose()")
      onClose()
    }, ANIMATION_TIMINGS.CLOSE_DURATION)
  }

  // Initialize animations when project changes
  useEffect(() => {
    cleanupTimers()
    
    if (!selectedProject) {
      //console.log('=== PersonaStatsModal: No project selected ===')
      return
    }
    
    //console.log('🎬 PersonaStatsModal MOUNT: Starting animations')
    resetAnimations()
    
    return cleanupTimers
  }, [selectedProject])

  return {
    // States
    animateIn,
    animateOut,
    modelAnimateIn,
    starAnimateIn,
    isClosing,
    showActions,
    // Setters
    setShowActions,
    // Handlers
    handleClose,
    triggerAnimations,
    // Refs
    dropdownTimeoutRef
  }
}
