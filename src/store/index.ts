import { configureStore } from '@reduxjs/toolkit'
import editingReducer, { EditingState } from './slices/EditReelSlice'
import throttle from 'lodash/throttle'
import { delayTime } from '../constant'

interface PreloadedState {
  editing: EditingState
}

const loadState = (): PreloadedState => {
  try {
    const serializedState = localStorage.getItem('editingState')
    return serializedState
      ? JSON.parse(serializedState)
      : {
          editing: {
            updatedVideoUrl: '',
            sliceOverlays: [],
            trimRange: { start: '0', end: '0' },
            originalVideoUrl: '',
            isLoading: false,
          },
        }
  } catch (e) {
    console.error('Failed to load state from local storage:', e)
    return {
      editing: {
        updatedVideoUrl: '',
        originalVideoUrl: '',
        sliceOverlays: [],
        trimRange: { start: '0', end: '100' },
        isLoading: false,
      },
    }
  }
}

const saveState = throttle((state: RootState) => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem('editingState', serializedState)
  } catch (err) {
    console.error('Failed to save state to local storage:', err)
  }
}, delayTime)

const store = configureStore({
  reducer: {
    editing: editingReducer,
  },
  preloadedState: loadState(),
})

store.subscribe(() => {
  saveState(store.getState())
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
