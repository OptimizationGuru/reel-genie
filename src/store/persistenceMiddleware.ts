import { Middleware } from '@reduxjs/toolkit'

const persistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action)
  const state = store.getState()
  localStorage.setItem('editingState', JSON.stringify(state.editing))
  return result
}

export default persistenceMiddleware
