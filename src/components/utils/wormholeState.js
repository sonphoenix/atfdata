// src/utils/wormholeState.js
class WormholeState {
  constructor() {
    this.isActive = false
    this.onCompleteCallbacks = []
    this.listeners = []
    this.sceneReady = false
  }

  setActive(isActive) {
    const oldState = this.isActive
    this.isActive = isActive
    
    if (!isActive && oldState) {
      console.log('🌀 WormholeState: Transition complete, triggering callbacks')
      // Execute all registered callbacks
      this.onCompleteCallbacks.forEach(callback => {
        try {
          callback()
        } catch (error) {
          console.error('Error in wormhole callback:', error)
        }
      })
      this.onCompleteCallbacks = []
    }
    
    // Notify all listeners of state change
    this.listeners.forEach(listener => {
      try {
        listener(isActive)
      } catch (error) {
        console.error('Error in wormhole listener:', error)
      }
    })
  }

  registerCompleteCallback(callback) {
    if (!this.isActive) {
      // Wormhole not active, execute immediately
      callback()
    } else {
      this.onCompleteCallbacks.push(callback)
    }
  }

  addListener(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  setSceneReady(isReady) {
    this.sceneReady = isReady
  }

  getSceneReady() {
    return this.sceneReady
  }

  // Singleton pattern
  static getInstance() {
    if (!WormholeState.instance) {
      WormholeState.instance = new WormholeState()
    }
    return WormholeState.instance
  }
}

export const wormholeState = WormholeState.getInstance()