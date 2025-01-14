import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Overlay } from '../../types'

export interface EditingState {
  updatedVideoUrl: string
  originalVideoUrl: string
  sliceOverlays: Overlay[]
  trimRange: { start: string; end: string }
}

const initialState: EditingState = {
  updatedVideoUrl: '',
  originalVideoUrl: '',
  sliceOverlays: [],
  trimRange: { start: '0', end: '0' },
}

const editingSlice = createSlice({
  name: 'editing',
  initialState,
  reducers: {
    setOriginalVideoUrl: (state, action: PayloadAction<string>) => {
      state.originalVideoUrl = action.payload
    },

    setVideoUrlatSlice: (state, action: PayloadAction<string>) => {
      state.updatedVideoUrl = action.payload
    },

    setOverlaysatSlice: (state, action: PayloadAction<Overlay[]>) => {
      state.sliceOverlays = action.payload
    },

    setTrimRangeatSlice: (
      state,
      action: PayloadAction<{ start: string; end: string }>
    ) => {
      state.trimRange = action.payload
    },
  },
})

export const {
  setOriginalVideoUrl,
  setVideoUrlatSlice,
  setOverlaysatSlice,
  setTrimRangeatSlice,
} = editingSlice.actions

export default editingSlice.reducer
