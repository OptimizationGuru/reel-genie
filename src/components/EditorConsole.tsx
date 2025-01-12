import React, { useState } from 'react'
import VideoWithOverlays from './AddLayovers'
import TrimComponent from './TrimComponent'
import DraggableTextOverlayComponent from './DraggableTextOverlay'
import DraggableImageOverlayComponent from './DraggableImageOverlay'
import { Overlay } from '../types'

interface DraggableOverlayComponentProps {
  videoDuration: number
  videoUrl: string
  Overlays: Overlay[]
  setOverlays: React.Dispatch<React.SetStateAction<Overlay[]>>
  textRange: { start: string; end: string }
  setTextRange: React.Dispatch<
    React.SetStateAction<{ start: string; end: string }>
  >
  imageRange: { start: string; end: string }
  setImageRange: React.Dispatch<
    React.SetStateAction<{ start: string; end: string }>
  >
  trimRange: { start: string; end: string }
  setTrimRange: React.Dispatch<
    React.SetStateAction<{ start: string; end: string }>
  >
  trimVideo: () => void
  applyOverlay: () => void
  download: () => void
}

const EditorConsole: React.FC<DraggableOverlayComponentProps> = ({
  videoDuration,
  Overlays,
  setOverlays,
  textRange,
  setTextRange,
  imageRange,
  setImageRange,
  trimRange,
  setTrimRange,
  trimVideo,
  applyOverlay,
  videoUrl,
  download,
}) => {
  return (
    <div className="flex w-[100%] flex-col items-center justify-start">
      <div className="flex w-full items-center justify-center gap-4">
        <div className="w-full justify-between gap-4">
          <DraggableImageOverlayComponent
            videoDuration={videoDuration}
            imageOverlays={Overlays}
            setImageOverlays={setOverlays}
            imageRange={imageRange}
            setImageRange={setImageRange}
            applyOverlay={applyOverlay}
          />

          <TrimComponent
            trimRange={trimRange}
            setTrimRange={setTrimRange}
            trimVideo={trimVideo}
            videoDuration={videoDuration}
          />
        </div>

        <DraggableTextOverlayComponent
          videoDuration={videoDuration}
          textOverlays={Overlays}
          setTextOverlays={setOverlays}
          textRange={textRange}
          setTextRange={setTextRange}
          applyOverlay={applyOverlay}
        />
      </div>
    </div>
  )
}

export default EditorConsole
