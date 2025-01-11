import React, { useState, useEffect } from 'react'
import { createFFmpeg, fetchFile, FFmpeg } from '@ffmpeg/ffmpeg'

const VideoEditor: React.FC = () => {
  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<string>('0')
  const [endTime, setEndTime] = useState<string>('5')
  const [videoDuration, setVideoDuration] = useState<number>(0)
  const [trimOutputUrl, setTrimOutputUrl] = useState<string | null>(null)
  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const ffmpegInstance = createFFmpeg({
          log: true,
          corePath: 'https://localhost:5173/ffmpeg-core.js',
          locateFile: (file: string) => `https://localhost:5173/${file}`,
        } as any)

        await ffmpegInstance.load()
        setFfmpeg(ffmpegInstance)
        setIsLoaded(true)
      } catch (error) {
        console.error('Failed to load FFmpeg:', error)
      }
    }

    loadFFmpeg()
  }, [])

  const processVideo = async (file: File) => {
    if (!ffmpeg || !isLoaded) return

    const video = await fetchFile(file)
    ffmpeg.FS('writeFile', 'input.mp4', video)

    await ffmpeg.run('-i', 'input.mp4', '-vf', 'scale=640:360', 'output.mp4')

    const output = ffmpeg.FS('readFile', 'output.mp4')
    const blob = new Blob([output.buffer], { type: 'video/mp4' })
    setOutputUrl(URL.createObjectURL(blob))
  }

  const trimVideoWithRange = async () => {
    if (!ffmpeg || !isLoaded || !videoDuration) return

    const start = parseFloat(startTime)
    let end = parseFloat(endTime)
    const duration = (end - start).toFixed(2)

    if (start >= end) {
      alert(
        'Start time must be less than the end time. Please adjust the range.'
      )
      return
    }
    if (start < 0) {
      alert('Start time cannot be negative. Please adjust the range.')
      return
    }
    if (end > videoDuration) {
      alert(
        'End time exceeds the video duration. Adjusting end time to the maximum duration.'
      )
      end = videoDuration // Adjust the end time instead of returning
    }

    const videoFile = ffmpeg.FS('readFile', 'output.mp4')

    ffmpeg.FS('writeFile', 'input.mp4', videoFile)
    await ffmpeg.run(
      '-i',
      'input.mp4',
      '-ss',
      start.toString(),
      '-t',
      duration,
      'trimmed.mp4'
    )

    const trimmedOutput = ffmpeg.FS('readFile', 'trimmed.mp4')
    const trimmedBlob = new Blob([trimmedOutput.buffer], {
      type: 'video/mp4',
    })
    setTrimOutputUrl(URL.createObjectURL(trimmedBlob))
  }

  return (
    <div>
      {!isLoaded ? (
        <p>Loading FFmpeg... Please wait.</p>
      ) : (
        <div>
          <input
            type="file"
            accept="video/mp4"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                processVideo(e.target.files[0])
              }
            }}
          />
          {outputUrl && (
            <div>
              <h2>Processed Video</h2>
              <video
                src={outputUrl}
                controls
                width="900"
                ref={(ref) => {
                  if (ref && !videoDuration) {
                    ref.onloadedmetadata = () => {
                      setVideoDuration(ref.duration)
                      setEndTime(ref.duration.toString())
                    }
                  }
                }}
              />
              <a href={outputUrl} download="output.mp4">
                Download Processed Video
              </a>
            </div>
          )}

          {outputUrl && videoDuration > 0 && (
            <div className="mt-4">
              <h2>Select Range for Trimming</h2>
              <div className="mt-2">
                <label>Start Time: {startTime}s</label>
                <input
                  type="range"
                  min="0"
                  max={videoDuration}
                  step="0.1"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <label>End Time: {endTime}s</label>
                <input
                  type="range"
                  min="0"
                  max={videoDuration}
                  step="0.1"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
              <button
                className="mt-2 rounded bg-blue-500 px-4 py-2 text-white"
                onClick={trimVideoWithRange}
              >
                Trim Video
              </button>
            </div>
          )}

          {trimOutputUrl && (
            <div className="mt-4">
              <h2>Trimmed Video</h2>
              <video src={trimOutputUrl} controls width="600" />
              <a href={trimOutputUrl} download="trimmed.mp4">
                Download Trimmed Video
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VideoEditor
