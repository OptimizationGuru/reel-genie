import React, { useEffect, useState } from 'react'
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
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
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
  setIsLoading,
  videoUrl,
}) => {
  useEffect(() => setIsLoading(false), [Overlays])

  return (
    <div className="flex w-[100%] flex-col items-center justify-start">
      <div className="flex w-full items-center justify-center gap-4">
        <div className={`mt-8 w-full justify-between gap-4 px-2`}>
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
        <div className="mx-4 h-[700px] w-[2px] bg-gray-300"></div>
        <div
          className={`my-5 w-full justify-between gap-4 px-2 ${videoUrl ? 'b border-red-500' : ''}`}
        >
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
    </div>
  )
}

export default EditorConsole
