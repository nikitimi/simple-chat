import { ThunkAction } from "redux-thunk"
import { RootState } from "../store"
import { DataAction } from "../types"
import * as userAction from "../types"

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
