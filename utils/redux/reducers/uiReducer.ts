import { DataAction } from "../types"
import * as uiAction from "../types"

interface DataState {
  darkMode: boolean
  messageModal: boolean
  submitContactMessage: boolean
  error: Error | null
}

const initialState: DataState = {
  darkMode: false,
  messageModal: false,
  submitContactMessage: false,
  error: null,
}

export default function uiReducer(
  state: DataState = initialState,
  action: DataAction
): DataState {
  switch (action.type) {
    case uiAction.SET_DARKMODE:
      return {
        ...state,
        darkMode: action.payload,
        error: null,
      }
    case uiAction.TOGGLE_MODAL:
      return {
        ...state,
        [action.payload.props]:
          action.payload.value !== undefined
            ? action.payload.value
            : !state[action.payload.props],
        error: null,
      }
    case uiAction.HANDLER_ERROR:
      return {
        ...state,
        error: action.payload,
      }
    default:
      return state
  }
}
