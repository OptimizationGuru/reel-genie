import React, { useEffect, useRef, memo } from 'react'
import Draggable from 'react-draggable'
import { Overlay } from '../types'

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
      <video ref={videoRef} className="w-full rounded-lg" controls>
        <source src={videoUrl} type="video/mp4" />

        {/* Render Overlays */}
        {overlays.map((overlay) =>
          overlay.type === 'text' ? (
            <Draggable key={overlay.id}>
              <div
                id={`overlay-${overlay.id}`}
                className="absolute cursor-move"
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
            </Draggable>
          ) : (
            <Draggable key={overlay.id}>
              <img
                id={`overlay-${overlay.id}`}
                src={overlay.imageSrc}
                className="absolute cursor-move"
                style={{
                  top: `${overlay.position.y}px`,
                  left: `${overlay.position.x}px`,
                  width: `${overlay.width}px`,
                  height: `${overlay.height}px`,
                  display: 'none',
                }}
                alt="Overlay"
              />
            </Draggable>
          )
        )}
      </video>
    </div>
  )
}

export default memo(VideoWithOverlays)
