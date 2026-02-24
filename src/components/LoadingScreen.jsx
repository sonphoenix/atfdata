import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const LoadingScreen = ({ progress = 0, status = 'Loading...', isVisible = true }) => {
  const [messageIndex, setMessageIndex] = useState(0)
  
  const loadingMessages = [
    "Initializing star systems...",
    "Calibrating wormhole generator...",
    "Loading cosmic assets...",
    "Synchronizing time-space continuum...",
    "Establishing quantum connection..."
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at center, #0a0e27 0%, #000000 70%)'
          }}
        >
          <div className="text-center max-w-2xl px-6">
            {/* Logo/Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-[#00d4ff] via-[#FFD700] to-[#6366f1] bg-clip-text text-transparent"
            >
              ATF Data
            </motion.h1>

            {/* Progress Bar */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="h-1 bg-gradient-to-r from-[#00d4ff] to-[#6366f1] mb-4 rounded-full"
            />

            {/* Progress Percentage */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-bold text-white mb-2"
            >
              {Math.round(progress)}%
            </motion.div>

            {/* Loading Message */}
            <motion.p 
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-gray-400 text-lg mb-8 min-h-6"
            >
              {loadingMessages[messageIndex]}
            </motion.p>

            {/* Technical Status */}
            {status && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                className="font-mono text-xs text-gray-500 mt-12"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>{status}</span>
                </div>
              </motion.div>
            )}

            {/* Subtle Particle Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  initial={{
                    x: `${Math.random() * 100}vw`,
                    y: `${Math.random() * 100}vh`,
                    opacity: 0
                  }}
                  animate={{
                    x: `${Math.random() * 100}vw`,
                    y: `${Math.random() * 100}vh`,
                    opacity: [0, 0.5, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LoadingScreen