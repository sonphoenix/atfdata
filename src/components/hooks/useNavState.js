/**
 * useNavState
 *
 * State machine for the modal's navigation context.
 * Only ONE state is active at a time — no more juggling
 * imageModalOpen + showActions + whatever else as separate booleans.
 *
 * States:
 *   MODAL     — default view, model visible, joystick rotates model
 *   DROPDOWN  — Y pressed, links dropdown open, D-pad navigates items
 *   SHOWCASE  — A pressed (in MODAL), image showcase open
 *
 * Transitions:
 *   MODAL    + MENU_TOGGLE  → DROPDOWN
 *   MODAL    + CONFIRM      → SHOWCASE  (if has images)
 *   DROPDOWN + MENU_TOGGLE  → MODAL
 *   DROPDOWN + BACK         → MODAL
 *   DROPDOWN + CONFIRM      → open link, stay DROPDOWN
 *   SHOWCASE + BACK         → MODAL
 *   MODAL    + BACK         → close entire modal  (via onClose callback)
 */

import { useReducer, useCallback } from 'react'

export const NAV_STATE = {
  MODAL:    'modal',
  DROPDOWN: 'dropdown',
  SHOWCASE: 'showcase',
}

const initialState = {
  current:        NAV_STATE.MODAL,
  imageIndex:     0,
  dropdownIndex:  0,
}

const reducer = (state, action) => {
  switch (action.type) {

    case 'GO_DROPDOWN':
      return { ...state, current: NAV_STATE.DROPDOWN, dropdownIndex: 0 }

    case 'GO_MODAL':
      return { ...state, current: NAV_STATE.MODAL }

    case 'GO_SHOWCASE':
      return { ...state, current: NAV_STATE.SHOWCASE, imageIndex: action.index ?? 0 }

    case 'DROPDOWN_NEXT':
      return {
        ...state,
        dropdownIndex: (state.dropdownIndex + 1) % action.total
      }

    case 'DROPDOWN_PREV':
      return {
        ...state,
        dropdownIndex: (state.dropdownIndex - 1 + action.total) % action.total
      }

    case 'IMAGE_NEXT':
      return {
        ...state,
        imageIndex: (state.imageIndex + 1) % action.total
      }

    case 'IMAGE_PREV':
      return {
        ...state,
        imageIndex: (state.imageIndex - 1 + action.total) % action.total
      }

    case 'SET_IMAGE_INDEX':
      return { ...state, imageIndex: action.index }

    default:
      return state
  }
}

export const useNavState = ({ hasImages, imageCount, dropdownCount, onClose, dropdownActions }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // ── Transition helpers ────────────────────────────────────────
  const goDropdown  = useCallback(() => dispatch({ type: 'GO_DROPDOWN' }), [])
  const goModal     = useCallback(() => dispatch({ type: 'GO_MODAL'    }), [])
  const goShowcase  = useCallback((index = 0) => dispatch({ type: 'GO_SHOWCASE', index }), [])

  // ── Handle a semantic action given current state ──────────────
  const handleAction = useCallback((action) => {
    const { current, dropdownIndex } = state

    switch (action) {

      case 'menu_toggle':
        if (current === NAV_STATE.MODAL)    dispatch({ type: 'GO_DROPDOWN' })
        else if (current === NAV_STATE.DROPDOWN) dispatch({ type: 'GO_MODAL' })
        break

      case 'back':
        if (current === NAV_STATE.SHOWCASE) dispatch({ type: 'GO_MODAL' })
        else if (current === NAV_STATE.DROPDOWN) dispatch({ type: 'GO_MODAL' })
        else if (current === NAV_STATE.MODAL) onClose()    // only exits here
        break

      case 'confirm':
        if (current === NAV_STATE.DROPDOWN) {
          // Open the selected link
          const link = dropdownActions[dropdownIndex]
          if (link) window.open(link.href, '_blank', 'noopener,noreferrer')
        } else if (current === NAV_STATE.MODAL && hasImages) {
          dispatch({ type: 'GO_SHOWCASE', index: 0 })
        }
        break

      case 'nav_up':
        if (current === NAV_STATE.DROPDOWN)
          dispatch({ type: 'DROPDOWN_PREV', total: dropdownCount })
        break

      case 'nav_down':
        if (current === NAV_STATE.DROPDOWN)
          dispatch({ type: 'DROPDOWN_NEXT', total: dropdownCount })
        break

      case 'nav_left':
        if (current === NAV_STATE.SHOWCASE)
          dispatch({ type: 'IMAGE_PREV', total: imageCount })
        break

      case 'nav_right':
        if (current === NAV_STATE.SHOWCASE)
          dispatch({ type: 'IMAGE_NEXT', total: imageCount })
        break

      default:
        break
    }
  }, [state, hasImages, imageCount, dropdownCount, onClose, dropdownActions])

  // ── Direct setters (for mouse clicks) ────────────────────────
  const setImageIndex = useCallback((index) => {
    dispatch({ type: 'SET_IMAGE_INDEX', index })
  }, [])

  const openShowcase = useCallback((index = 0) => {
    dispatch({ type: 'GO_SHOWCASE', index })
  }, [])

  return {
    navState:      state.current,
    imageIndex:    state.imageIndex,
    dropdownIndex: state.dropdownIndex,
    handleAction,
    goDropdown,
    goModal,
    goShowcase,
    setImageIndex,
    openShowcase,
  }
}