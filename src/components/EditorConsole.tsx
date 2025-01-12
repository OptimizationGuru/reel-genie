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
    <div className="flex h-auto w-full flex-col items-center justify-start">
      <div className="flex w-full flex-col items-center gap-4 px-2 lg:flex-row">
        {/* Left Section - ImageOverlay and TrimVideo */}
        <div className="mb-12 flex w-full flex-col items-center gap-4 lg:w-1/2">
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

        {/* Divider - Only visible on larger screens */}
        <div className="hidden h-auto w-[2px] bg-gray-300 lg:block"></div>

        {/* Right Section - TextOverlay */}
        <div
          className={`flex h-auto w-full flex-col items-center gap-4 lg:w-1/2 ${
            videoUrl ? '' : ''
          }`}
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
