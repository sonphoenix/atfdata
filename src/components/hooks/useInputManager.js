/**
 * useInputManager
 *
 * Single polling loop for ALL input (gamepad + keyboard).
 * Never duplicated across components.
 *
 * Usage:
 *   const { onAction, axes, inputMode } = useInputManager()
 *
 *   useEffect(() => {
 *     return onAction((action) => {
 *       if (action === INPUT_ACTIONS.CONFIRM) doSomething()
 *     })
 *   }, [onAction])
 */

import { useEffect, useRef, useState, useCallback } from 'react'

// ─── Semantic action names ────────────────────────────────────────────────────
export const INPUT_ACTIONS = {
  CONFIRM:      'confirm',       // A / Enter
  BACK:         'back',          // B / Escape
  MENU_TOGGLE:  'menu_toggle',   // Y / Tab
  NAV_UP:       'nav_up',        // D-pad up    / Arrow up
  NAV_DOWN:     'nav_down',      // D-pad down  / Arrow down
  NAV_LEFT:     'nav_left',      // D-pad left  / Arrow left  / LB
  NAV_RIGHT:    'nav_right',     // D-pad right / Arrow right / RB
}

// ─── Gamepad button index → action ───────────────────────────────────────────
const GAMEPAD_MAP = {
  0:  INPUT_ACTIONS.CONFIRM,
  1:  INPUT_ACTIONS.BACK,
  3:  INPUT_ACTIONS.MENU_TOGGLE,
  4:  INPUT_ACTIONS.NAV_LEFT,    // LB
  5:  INPUT_ACTIONS.NAV_RIGHT,   // RB
  12: INPUT_ACTIONS.NAV_UP,
  13: INPUT_ACTIONS.NAV_DOWN,
  14: INPUT_ACTIONS.NAV_LEFT,    // D-pad left  (same action as LB)
  15: INPUT_ACTIONS.NAV_RIGHT,   // D-pad right (same action as RB)
}

// ─── Keyboard key → action ────────────────────────────────────────────────────
const KEYBOARD_MAP = {
  'Enter':      INPUT_ACTIONS.CONFIRM,
  'Escape':     INPUT_ACTIONS.BACK,
  'Tab':        INPUT_ACTIONS.MENU_TOGGLE,
  'ArrowUp':    INPUT_ACTIONS.NAV_UP,
  'ArrowDown':  INPUT_ACTIONS.NAV_DOWN,
  'ArrowLeft':  INPUT_ACTIONS.NAV_LEFT,
  'ArrowRight': INPUT_ACTIONS.NAV_RIGHT,
  'w':          INPUT_ACTIONS.NAV_UP,
  's':          INPUT_ACTIONS.NAV_DOWN,
  'a':          INPUT_ACTIONS.NAV_LEFT,
  'd':          INPUT_ACTIONS.NAV_RIGHT,
}

const DEAD_ZONE = 0.12
const dz = (v) => Math.abs(v) < DEAD_ZONE ? 0 : v

export const useInputManager = () => {
  const [inputMode, setInputMode] = useState('keyboard')

  // All subscribers — each is a callback(action) function
  const listenersRef = useRef(new Set())

  // Joystick axes — written every frame, never causes re-renders
  // Shape: { lx, ly, rx, ry }
  const axes = useRef({ lx: 0, ly: 0, rx: 0, ry: 0 })

  const prevButtonsRef = useRef({})
  const rafRef = useRef(null)

  // Emit an action to all subscribers
  const emit = useCallback((action) => {
    listenersRef.current.forEach(cb => cb(action))
  }, [])

  // Subscribe to actions — returns an unsubscribe fn (use as useEffect cleanup)
  const onAction = useCallback((callback) => {
    listenersRef.current.add(callback)
    return () => listenersRef.current.delete(callback)
  }, [])

  useEffect(() => {
    // ── Keyboard ────────────────────────────────────────────────
    const onKeyDown = (e) => {
      setInputMode('keyboard')
      const action = KEYBOARD_MAP[e.key]
      if (action) {
        // Prevent page scroll on arrows/space
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))
          e.preventDefault()
        emit(action)
      }
    }
    window.addEventListener('keydown', onKeyDown)

    // ── Gamepad RAF poll ────────────────────────────────────────
    const poll = () => {
      const pads = navigator.getGamepads
        ? Array.from(navigator.getGamepads()).filter(Boolean)
        : []

      if (pads.length > 0) {
        const pad = pads[0]

        const hasActivity =
          pad.buttons.some(b => b.pressed) ||
          pad.axes.some(a => Math.abs(a) > DEAD_ZONE)
        if (hasActivity) setInputMode('gamepad')

        // Edge detection — only fire on the frame a button goes from up → down
        pad.buttons.forEach((btn, i) => {
          const wasDown = prevButtonsRef.current[i]
          const isDown  = btn.pressed
          if (isDown && !wasDown) {
            const action = GAMEPAD_MAP[i]
            if (action) emit(action)
          }
          prevButtonsRef.current[i] = isDown
        })

        // Write axes (no emit — consumers read the ref inside useFrame)
        axes.current = {
          lx: dz(pad.axes[0] ?? 0),   // left  stick X
          ly: dz(pad.axes[1] ?? 0),   // left  stick Y
          rx: dz(pad.axes[2] ?? 0),   // right stick X
          ry: dz(pad.axes[3] ?? 0),   // right stick Y
        }
      } else {
        // No pad connected — zero out so things stop moving
        axes.current = { lx: 0, ly: 0, rx: 0, ry: 0 }
      }

      rafRef.current = requestAnimationFrame(poll)
    }

    rafRef.current = requestAnimationFrame(poll)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [emit])

  return { onAction, axes, inputMode }
}