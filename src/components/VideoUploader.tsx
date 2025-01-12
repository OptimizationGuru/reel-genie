import React, { useState, useEffect } from 'react'
import { SiGoogledisplayandvideo360 } from 'react-icons/si'
import { RiVideoUploadFill } from 'react-icons/ri'

type VideoUploaderProps = {
  onVideoUpload: (file: File) => void
  isProcessing: boolean
  saveFile: (file: File) => void
}

const VideoUploader: React.FC<VideoUploaderProps> = ({
  onVideoUpload,
  isProcessing,
  saveFile,
}) => {
  const [progress, setProgress] = useState(0)

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      onVideoUpload(file)
      saveFile(file)
    }
  }

  const simulateProcessing = async () => {
    let currentProgress = 0
    console.log(currentProgress, 'currentProgress')
    while (isProcessing && currentProgress < 100) {
      if (currentProgress < 95) {
        currentProgress += 5
        setProgress(currentProgress)
      }

      if (currentProgress >= 75) {
        currentProgress += 0.5
        setProgress(currentProgress)
      }
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  }

  useEffect(() => {
    if (isProcessing) {
      simulateProcessing()
    }
  }, [isProcessing])

  return (
    <div className="mx-auto flex h-[500px] w-[600px] items-center bg-gradient-to-br from-teal-300 to-gray-800 p-4">
      <div className="mx-auto max-w-lg rounded-lg bg-white p-8 text-center shadow-lg">
        <h2 className="mb-4 text-xl font-semibold text-teal-400">
          Welcome to ClipCraft
          <br />
          Your ultimate video editing companion
        </h2>
        <div className="mb-4 flex flex-col gap-3 rounded-lg border-2 border-dashed border-gray-300 p-6">
          <SiGoogledisplayandvideo360
            size={50}
            color="0d9488"
            className="mx-auto"
          />
          <label className="mx-auto flex w-40 cursor-pointer items-center gap-2 rounded-md bg-teal-500 px-4 py-2 text-white hover:bg-teal-600">
            Upload Video{' '}
            <span>
              <RiVideoUploadFill size={20} />
            </span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoUpload}
            />
          </label>
        </div>
        <p className="text-sm text-gray-500">
          Upload your video to start editing with ClipCraft. Whether it's
          trimming, adding effects, or enhancing quality, we've got you covered!
        </p>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="mt-4 w-full">
            <div className="relative h-2 w-full rounded-full bg-gray-300">
              <div
                className="absolute h-2 rounded-full bg-teal-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-500">{progress}%</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoUploader
