import { DataAction } from "../types"
import * as uiAction from "../types"

interface DataState {
  darkMode: boolean
  error: Error | null
}

const initialState: DataState = {
  darkMode: false,
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
    case uiAction.HANDLER_ERROR:
      return {
        ...state,
        error: action.payload,
      }
    default:
      return state
  }
}
