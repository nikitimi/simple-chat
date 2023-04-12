import { ThunkAction } from "redux-thunk"
import { RootState } from "../store"
import { DataAction } from "../types"
import * as userAction from "../types"

export function setChatModal(
  id: string
): ThunkAction<void, RootState, undefined, DataAction> {
  return async (dispatch) => {
    try {
      dispatch({
        type: userAction.SET_CHAT,
        payload: id,
      })
    } catch (error) {
      dispatch({
        type: userAction.HANDLER_ERROR,
        payload: new Error(`Set chat Error: ${error ? error : ""}`),
      })
    }
  }
}
export function setContactList(
  contactList: string[]
): ThunkAction<void, RootState, undefined, DataAction> {
  return async (dispatch) => {
    try {
      dispatch({
        type: userAction.SET_CONTACT_LIST,
        payload: contactList,
      })
    } catch (error) {
      dispatch({
        type: userAction.HANDLER_ERROR,
        payload: new Error(
          `User Setting Contact list Error: ${error ? error : ""}`
        ),
      })
    }
  }
}
export function setChatHeads(
  chatHeads: string[]
): ThunkAction<void, RootState, undefined, DataAction> {
  return async (dispatch) => {
    try {
      dispatch({
        type: userAction.SET_CHAT_HEADS,
        payload: chatHeads,
      })
    } catch (error) {
      dispatch({
        type: userAction.HANDLER_ERROR,
        payload: new Error(`User Chat heads Error: ${error ? error : ""}`),
      })
    }
  }
}
export function setCurrentId(
  id: string
): ThunkAction<void, RootState, undefined, DataAction> {
  return async (dispatch) => {
    try {
      dispatch({
        type: userAction.SET_CURRENT_ID,
        payload: id,
      })
    } catch (error) {
      dispatch({
        type: userAction.HANDLER_ERROR,
        payload: new Error(`User Setting ID Error: ${error ? error : ""}`),
      })
    }
  }
}
