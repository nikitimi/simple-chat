export const SET_CURRENT_ID = "SET_CURRENT_ID"
export const SET_DARKMODE = "SET_DARKMODE"
export const HANDLER_ERROR = "HANDLER_ERROR"

export type setCurrentId = {
  type: typeof SET_CURRENT_ID
  payload: string
}
export type setDarkMode = {
  type: typeof SET_DARKMODE
  payload: boolean
}
export type handleError = {
  type: typeof HANDLER_ERROR
  payload: Error
}

// Define a union type for all possible actions
export type DataAction = setCurrentId | setDarkMode | handleError
