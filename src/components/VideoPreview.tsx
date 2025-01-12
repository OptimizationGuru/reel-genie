import React, { useRef } from 'react'
import OverlayAddedVideo from './AddLayovers'
import { Overlay } from '../types'

interface VideoPreviewProps {
  outputUrl: string | null | ''
  editedVideoUrl: string | null | ''

  showComponent: number
  setShowComponent: React.Dispatch<React.SetStateAction<number>>
  setVideoDuration: React.Dispatch<React.SetStateAction<number>>
  setTrimRange: React.Dispatch<
    React.SetStateAction<{ start: string; end: string }>
  >
  setEndTime: React.Dispatch<React.SetStateAction<string>>
  videoDuration: number
  overlays: Overlay[]
  downloadVideo: () => void
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  outputUrl,
  editedVideoUrl,
  showComponent,
  setShowComponent,
  setVideoDuration,
  setTrimRange,
  setEndTime,
  overlays,
  downloadVideo,
}) => {
  return (
    <div className="w-[45%] border border-pink-500">
      {outputUrl && (
        <div className="mx-auto flex w-full max-w-lg flex-col gap-8 py-12">
          {/* Tabs Section */}
          <div className="flex justify-center border-b border-gray-300">
            <ul className="flex w-full justify-center space-x-6">
              <li
                onClick={() => setShowComponent(1)}
                className={`cursor-pointer px-4 py-2 text-sm ${
                  showComponent === 1
                    ? 'border-designColor text-designColor border-b-2 font-semibold'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Original Video
              </li>
              <li
                onClick={() => setShowComponent(2)}
                className={`cursor-pointer px-4 py-2 text-sm ${
                  showComponent === 2
                    ? 'border-designColor text-designColor border-b-2 font-semibold'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Edited Video
              </li>
            </ul>
          </div>

          {/* Content Section */}
          <div className="flex flex-col items-center">
            <div className="flex h-[400px] w-full items-center justify-center">
              {showComponent === 1 ? (
                <div className="flex flex-col items-center gap-4">
                  <h2 className="text-lg font-medium text-gray-800">
                    Original Video
                  </h2>
                  <video
                    src={outputUrl}
                    controls
                    className="rounded-lg shadow-md"
                    width="600"
                    ref={(ref) => {
                      if (ref) {
                        ref.onloadedmetadata = () => {
                          if (ref.duration) {
                            setVideoDuration(ref.duration)
                            setTrimRange((prev) => ({
                              ...prev,
                              end: String(ref.duration),
                            }))
                            setEndTime(ref.duration.toString())
                          }
                        }
                      }
                    }}
                  />
                </div>
              ) : editedVideoUrl ? (
                <div className="flex flex-col items-center gap-4">
                  <h2 className="text-lg font-medium text-gray-800">
                    Edited Video
                  </h2>
                  <OverlayAddedVideo
                    overlays={overlays}
                    videoUrl={editedVideoUrl}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <h2 className="text-lg font-medium text-gray-800">
                    No Edited Video Available
                  </h2>
                  <p className="text-sm text-gray-600">
                    Please upload or generate an edited video to view it here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {editedVideoUrl && (
        <div className="mx-auto my-4 items-center justify-center">
          <button
            onClick={downloadVideo}
            className="rounded-md bg-blue-500 px-4 py-2 text-center text-white"
          >
            Download Video
          </button>
        </div>
      )}
    </div>
  )
}

export default VideoPreview
