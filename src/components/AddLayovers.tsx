import React, { useEffect, useRef } from 'react'

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

interface VideoWithOverlaysProps {
  overlays: Overlay[]
  videoUrl: string
}

const VideoWithOverlays: React.FC<VideoWithOverlaysProps> = ({
  overlays,
  videoUrl,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current

    if (video) {
      const handleTimeUpdate = () => {
        const currentTime = video.currentTime

        // Show overlays based on the current video time
        overlays.forEach((overlay) => {
          const overlayElement = document.getElementById(
            `overlay-${overlay.id}`
          )
          if (overlayElement) {
            if (
              currentTime >= overlay.startTime &&
              currentTime <= overlay.endTime
            ) {
              overlayElement.style.display = 'block'
            } else {
              overlayElement.style.display = 'none'
            }
          }
        })
      }

      video.addEventListener('timeupdate', handleTimeUpdate)

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate)
      }
    }
  }, [overlays])

  return (
    <div className="relative">
      <video ref={videoRef} className="w-full" controls>
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Render Overlays */}
      {overlays.map((overlay) =>
        overlay.type === 'text' ? (
          <div
            key={overlay.id}
            id={`overlay-${overlay.id}`}
            className="absolute"
            style={{
              top: `${overlay.position.y}px`,
              left: `${overlay.position.x}px`,
              fontSize: `${overlay.fontSize}px`,
              fontFamily: overlay.fontStyle,
              color: overlay.color,
              display: 'none',
            }}
          >
            {overlay.text}
          </div>
        ) : (
          <img
            key={overlay.id}
            id={`overlay-${overlay.id}`}
            src={overlay.imageSrc}
            className="absolute"
            style={{
              top: `${overlay.position.y}px`,
              left: `${overlay.position.x}px`,
              width: `${overlay.width}px`,
              height: `${overlay.height}px`,
              display: 'none',
            }}
            alt="Overlay"
          />
        )
      )}
    </div>
  )
}

export default VideoWithOverlays
