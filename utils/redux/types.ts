export const SET_CHAT = "SET_CHAT"
export const SET_CONTACT_LIST = "SET_CONTACT_LIST"
export const SET_CHAT_HEADS = "SET_CHAT_HEADS"
export const SET_CURRENT_ID = "SET_CURRENT_ID"
export const TOGGLE_MODAL = "TOGGLE_MODAL"
export const SET_DARKMODE = "SET_DARKMODE"
export const HANDLER_ERROR = "HANDLER_ERROR"

export type ToggleModalTypes =
  | "messageModal"
  | "submitContactMessage"
  | "chatHeader"

export type setChat = {
  type: typeof SET_CHAT
  payload: string
}
export type setContactList = {
  type: typeof SET_CONTACT_LIST
  payload: string[]
}
export type setChatHeads = {
  type: typeof SET_CHAT_HEADS
  payload: string[] | null
}
export type setCurrentId = {
  type: typeof SET_CURRENT_ID
  payload: string
}
export type toggleModal = {
  type: typeof TOGGLE_MODAL
  payload: { props: ToggleModalTypes; value?: boolean }
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
export type DataAction =
  | setChat
  | setContactList
  | setChatHeads
  | setCurrentId
  | toggleModal
  | setDarkMode
  | handleError
