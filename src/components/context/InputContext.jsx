/**
 * InputContext
 *
 * Wraps the app (or just the modal) so any child can call
 * useInput() to get onAction, axes, inputMode — without prop drilling.
 *
 * Usage:
 *   // In parent:
 *   <InputProvider>
 *     <PersonaStatsModal ... />
 *   </InputProvider>
 *
 *   // In any child:
 *   const { onAction, axes, inputMode } = useInput()
 */

import { createContext, useContext } from 'react'
import { useInputManager } from '../hooks/useInputManager'

const InputContext = createContext(null)

export const InputProvider = ({ children }) => {
  const input = useInputManager()

  return (
    <InputContext.Provider value={input}>
      {children}
    </InputContext.Provider>
  )
}

export const useInput = () => {
  const ctx = useContext(InputContext)
  if (!ctx) throw new Error('useInput must be used inside <InputProvider>')
  return ctx
}