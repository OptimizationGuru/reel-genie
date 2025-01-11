import React, { useState } from 'react'
import VideoWithOverlays from './AddLayovers'
import TrimComponent from './TrimComponent'
import DraggableTextOverlayComponent from './DraggableTextOverlay'
import DraggableImageOverlayComponent from './DraggableImageOverlay'

// Define Overlay type

type TextOverlayType = {
  id: number
  type: 'text'
  text: string
  fontSize: number
  fontStyle: string
  color: string
  position: { x: number; y: number }
  startTime: number
  endTime: number
}

type ImageOverlayType = {
  id: number
  type: 'image'
  imageSrc: string
  width: number
  height: number
  position: { x: number; y: number }
  startTime: number
  endTime: number
}

type Overlay = TextOverlayType | ImageOverlayType

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

  // setIsTextOverlayAdded: React.Dispatch<React.SetStateAction<boolean>>
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
}) => {
  return (
    <div className="mx-auto flex flex-col items-center">
      <div className="flex w-[500px] flex-col items-center justify-center gap-4">
        {/* Text Overlay Component */}
        <DraggableTextOverlayComponent
          videoDuration={videoDuration}
          textOverlays={Overlays}
          setTextOverlays={setOverlays}
          textRange={textRange}
          setTextRange={setTextRange}
          applyOverlay={applyOverlay}
        />

        {/* Image Overlay Component */}
        <DraggableImageOverlayComponent
          videoDuration={videoDuration}
          imageOverlays={Overlays}
          setImageOverlays={setOverlays}
          imageRange={imageRange}
          setImageRange={setImageRange}
          applyOverlay={applyOverlay}
        />

        {/* Trim Video Component */}
        <TrimComponent
          trimRange={trimRange}
          setTrimRange={setTrimRange}
          trimVideo={trimVideo}
          videoDuration={videoDuration}
        />
      </div>

      {/* Video with Overlays */}
      <div className="mt-4">
        <h2 className="mb-2 text-lg font-bold">Preview</h2>
        <VideoWithOverlays overlays={Overlays} videoUrl={videoUrl} />
      </div>
    </div>
  )
}

export default EditorConsole
