import { DataAction } from "../types"
import * as userAction from "../types"

interface DataState {
  id: string | null
  contactList: string[] | null
  chatHeads: string[] | null
  error: Error | null
}

const initialState: DataState = {
  id: null,
  contactList: null,
  chatHeads: null,
  error: null,
}

export default function userReducer(
  state: DataState = initialState,
  action: DataAction
): DataState {
  switch (action.type) {
    case userAction.SET_CONTACT_LIST:
      return {
        ...state,
        contactList: action.payload,
        error: null,
      }
    case userAction.SET_CURRENT_ID:
      return {
        ...state,
        id: action.payload,
        error: null,
      }
    case userAction.SET_CHAT_HEADS:
      return {
        ...state,
        chatHeads: action.payload,
        error: null,
      }
    case userAction.HANDLER_ERROR:
      return {
        ...state,
        error: action.payload,
      }
    default:
      return state
  }
}
