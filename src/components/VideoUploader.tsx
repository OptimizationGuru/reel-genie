import React, { useState, useEffect, memo } from 'react'

import MemoizedIcon from './MemoizedIcon'
import MemoizedVideoUploadIcon from './VideoUploadIcon'
import { UploadVideoMsg, WelcomeMessage } from '../constant'

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-300 to-gray-800 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg sm:p-8 md:max-w-lg">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 sm:text-xl md:text-2xl">
          {WelcomeMessage}
        </h2>

        {/* Upload Section */}
        <div className="mb-4 flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-gray-300 p-4 sm:p-6">
          <MemoizedIcon size={50} color="#0d9488" className="text-teal-500" />
          <label className="flex w-36 cursor-pointer items-center justify-center gap-2 rounded-md bg-teal-500 px-4 py-2 text-sm text-white hover:bg-teal-600 sm:w-40">
            Upload Video{' '}
            <span>
              <MemoizedVideoUploadIcon size={20} />
            </span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoUpload}
            />
          </label>
        </div>

        <p className="text-sm text-gray-500 sm:text-base">{UploadVideoMsg}</p>

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

export default memo(VideoUploader)
