import {
  configureStore,
  combineReducers,
  applyMiddleware,
  compose,
} from "@reduxjs/toolkit"
import thunk, { ThunkMiddleware } from "redux-thunk"

import uiReducer from "./reducers/uiReducer"
import userReducer from "./reducers/userReducer"
import { DataAction } from "./types"

const rootReducer = combineReducers({
  ui: uiReducer,
  user: userReducer,
})

const enhancers = compose(
  applyMiddleware(thunk as ThunkMiddleware<RootState, DataAction>)
)

const store = configureStore({
  // devTools: false,
  enhancers: (defaultEnhancers) => [enhancers, ...defaultEnhancers],
  preloadedState: {},
  reducer: rootReducer,
})

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
export default store
