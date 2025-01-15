import React, { useState, useEffect } from 'react'
import { createFFmpeg, fetchFile, FFmpeg } from '@ffmpeg/ffmpeg'
import OverlayAddedVideo from './AddLayovers'
import EditorConsole from './EditorConsole'
import VideoUploader from './VideoUploader'
import { RootState, AppDispatch } from '../store/index'
import {
  downlodButtonName,
  infoMsg,
  infoMsg2,
  warningMsg1,
  warningMsg2,
  warningMsg3,
} from '../constant'

import { RiVideoDownloadFill } from 'react-icons/ri'
import Loader from './Loader'
import { useDispatch, useSelector } from 'react-redux'
import {
  setLoading,
  setOriginalVideoUrl,
  setVideoUrlatSlice,
} from '../store/slices/EditReelSlice'

const FavVideoEditor = () => {
  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null)

  const [endTime, setEndTime] = useState<string>('')
  const [trimRange, setTrimRange] = useState({ start: '0', end: '100' })

  const dispatch = useDispatch<AppDispatch>()

  const { editing } = useSelector((state: RootState) => state)
  const { updatedVideoUrl, sliceOverlays, originalVideoUrl, isLoading } =
    editing

  const [textOverlayRange, setTextOverlayRange] = useState({
    start: '0',
    end: '100',
  })
  const [imgOverlayRange, setImgOverlayRange] = useState({
    start: '0',
    end: '100',
  })

  const [inputFile, setInputFile] = useState<File | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [videoDuration, setVideoDuration] = useState<number>(0)
  const [showComponent, setShowComponent] = useState(1)
  const [isVideoTrimmed, SetVideoTrimmed] = useState(false)

  const handleSetUrl = (url: string) => {
    dispatch(setVideoUrlatSlice(url))
  }

  // Handle file upload
  const processVideo = async (file: File) => {
    if (!ffmpeg || !isLoaded) return

    setIsProcessing(true)
    dispatch(setLoading(true))
    const video = await fetchFile(file)

    ffmpeg.FS('writeFile', 'input.mp4', video)

    await ffmpeg.run('-i', 'input.mp4', '-vf', 'scale=640:360', 'output.mp4')

    const output = ffmpeg.FS('readFile', 'output.mp4')

    const blob = new Blob([output.buffer], { type: 'video/mp4' })

    dispatch(setOriginalVideoUrl(URL.createObjectURL(blob)))

    dispatch(setLoading(false))
    setIsProcessing(false)
  }

  const trimVideoWithRange = async () => {
    if (!ffmpeg || !isLoaded || !videoDuration) return

    dispatch(setLoading(true))
    const start = parseFloat(trimRange.start)
    let end = parseFloat(trimRange.end)
    const duration = (end - start).toFixed(2)

    if (start >= end) {
      dispatch(setLoading(false))
      alert({ warningMsg1 })

      return
    }
    if (start < 0) {
      dispatch(setLoading(false))
      alert({ warningMsg2 })
      return
    }
    if (end > videoDuration) {
      alert({ warningMsg3 })
      end = videoDuration
    }

    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(inputFile!))

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
    const trimmedBlob = new Blob([trimmedOutput.buffer], { type: 'video/mp4' })

    handleSetUrl(URL.createObjectURL(trimmedBlob))
    if (!isVideoTrimmed) SetVideoTrimmed(true)
    dispatch(setLoading(false))
  }

  const processVideoWithOverlays = async () => {
    if (!ffmpeg || !isLoaded || !inputFile) return

    dispatch(setLoading(true))

    if (updatedVideoUrl && showComponent !== 2) setShowComponent(2)
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(inputFile))

    const textOverlays = sliceOverlays.filter((el) => el.type === 'text')
    const imageOverlays = sliceOverlays.filter((el) => el.type === 'image')

    const drawTextFilters = textOverlays
      .map((overlay) => {
        const {
          text,
          fontSize,
          fontStyle,
          color,
          position,
          startTime,
          endTime,
        } = overlay
        return `drawtext=text='${text}':x=${position.x}:y=${position.y}:fontsize=${fontSize}:fontfile=fonts/${fontStyle}.ttf:fontcolor=${color.replace(
          '#',
          '0x'
        )}:enable='between(t,${startTime},${endTime})'`
      })
      .join(',')

    const imageInputs: string[] = []

    const overlayFilters: string[] = []

    imageOverlays.forEach((overlay, index) => {
      const base64Data = overlay.imageSrc.split(',')[1]
      const binaryString = atob(base64Data)
      const binaryLength = binaryString.length
      const binaryArray = new Uint8Array(binaryLength)

      for (let i = 0; i < binaryLength; i++) {
        binaryArray[i] = binaryString.charCodeAt(i)
      }

      ffmpeg.FS('writeFile', `image${index}.png`, binaryArray)
      imageInputs.push('-i', `image${index}.png`)
      overlayFilters.push(
        `[${index + 1}:v]scale=${overlay.width}:${overlay.height}[img${index}],` +
          `[0:v][img${index}]overlay=${overlay.position.x}:${overlay.position.y}:enable='between(t,${overlay.startTime},${overlay.endTime})'[v${index + 1}]`
      )
    })

    let filterComplex = ''
    if (drawTextFilters) {
      filterComplex += drawTextFilters
    }

    if (overlayFilters.length > 0) {
      filterComplex += (filterComplex ? ',' : '') + overlayFilters.join(',')
    }

    const finalStream =
      overlayFilters.length > 0 ? `[v${overlayFilters.length}]` : '[v0]'

    await ffmpeg.run(
      '-i',
      'input.mp4',
      ...imageInputs,
      '-filter_complex',
      filterComplex || 'null',
      '-map',
      finalStream || '0:v',
      '-c:v',
      'libx264',
      '-c:a',
      'copy',
      'output.mp4'
    )

    const data = ffmpeg.FS('readFile', 'output.mp4')
    const blob = new Blob([data.buffer], { type: 'video/mp4' })

    handleSetUrl(URL.createObjectURL(blob))
    dispatch(setLoading(false))
  }

  // Function to download the processed video
  const downloadVideo = () => {
    dispatch(setLoading(true))
    if (updatedVideoUrl) {
      const link = document.createElement('a')
      link.href = updatedVideoUrl
      link.download = 'processed_video.mp4'
      link.click()
      dispatch(setLoading(false))
    } else {
      dispatch(setLoading(false))
      alert('Please generate a preview first!')
    }
  }

  useEffect(() => {
    const videoRef = document.querySelector('video')
    if (videoRef) {
      videoRef.onloadedmetadata = () => {
        if (videoRef.duration) {
          setVideoDuration(videoRef.duration)
          setTrimRange((prev) => ({
            ...prev,
            end: String(videoRef.duration),
          }))
          setEndTime(videoRef.duration.toString())
        }
      }
    }
  }, [originalVideoUrl])

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const corePath =
          import.meta.env.MODE === 'production'
            ? `${import.meta.env.VITE_FFMPEG_CDN_URL || ''}/ffmpeg-core.js`
            : '/ffmpeg-core.js'

        const ffmpegInstance = createFFmpeg({
          log: true,
          corePath,
        })

        await ffmpegInstance.load()
        setFfmpeg(ffmpegInstance)
        setIsLoaded(true)
      } catch (error) {
        console.error('Failed to load FFmpeg:', error)
      }
    }

    loadFFmpeg()
  }, [])

  return (
    <div className="mt-4 flex w-full flex-col items-center justify-around p-4">
      {/* Loader */}
      <div className="absolute z-50">{isLoading && <Loader />}</div>

      <div className="h-auto w-full gap-4">
        {/* Header */}
        {originalVideoUrl && (
          <div className="fixed left-0 top-0 z-50 w-full bg-gray-50 shadow-md">
            <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-3">
              <h1 className="bg-gradient-to-r from-teal-400 via-cyan-500 to-teal-600 bg-clip-text text-2xl font-extrabold tracking-wide text-transparent transition-transform duration-300 ease-in-out hover:scale-105 sm:text-4xl md:text-5xl">
                ClipCraft
              </h1>
            </div>
          </div>
        )}

        {/* Video Uploader */}
        {!originalVideoUrl?.length && (
          <VideoUploader
            onVideoUpload={processVideo}
            isProcessing={isProcessing}
            saveFile={setInputFile}
          />
        )}

        {/* Video Editor Section */}
        {originalVideoUrl && (
          <div className="relative mt-4 flex flex-col gap-8 md:flex-row">
            {/* Editor Console */}
            <div
              className={`w-full rounded-2xl bg-gray-50 pt-4 shadow-xl md:w-[55%] ${
                originalVideoUrl ? '' : ''
              }`}
            >
              <EditorConsole
                videoDuration={videoDuration}
                Overlays={sliceOverlays}
                textRange={textOverlayRange}
                imageRange={imgOverlayRange}
                setTextRange={setTextOverlayRange}
                setImageRange={setImgOverlayRange}
                trimRange={trimRange}
                setTrimRange={setTrimRange}
                trimVideo={trimVideoWithRange}
                applyOverlay={processVideoWithOverlays}
                videoUrl={updatedVideoUrl}
                download={downloadVideo}
              />
            </div>

            {/* Video Preview and Download */}
            <div
              className={`flex h-[450px] w-full flex-col rounded-2xl bg-gray-50 md:w-[45%]`}
            >
              {originalVideoUrl && (
                <div className="mx-auto flex w-full max-w-lg flex-col gap-4 py-8">
                  {/* Tab Navigation */}
                  <div className="flex justify-center border-b border-gray-300">
                    <ul className="flex w-full justify-center space-x-6">
                      <li
                        onClick={() => setShowComponent(1)}
                        className={`cursor-pointer px-4 py-2 text-lg font-semibold ${
                          showComponent === 1
                            ? 'border-designColor text-designColor border-b-2 font-semibold'
                            : 'text-gray-600'
                        }`}
                      >
                        Original Video
                      </li>
                      <li
                        onClick={() => setShowComponent(2)}
                        className={`cursor-pointer px-4 py-2 text-lg font-semibold ${
                          showComponent === 2
                            ? 'border-designColor text-designColor border-b-2 font-semibold'
                            : 'text-gray-600'
                        }`}
                      >
                        Edited Video
                      </li>
                    </ul>
                  </div>

                  {/* Video Preview */}
                  <div className="flex w-full flex-col items-center px-4 py-2">
                    <div className="flex w-full items-center justify-center">
                      {showComponent === 1 ? (
                        <div className="flex w-full flex-col items-center gap-4">
                          <video
                            src={originalVideoUrl}
                            controls
                            className="w-full rounded-lg shadow-md sm:w-[600px] lg:w-[800px] xl:w-[1000px]"
                            ref={(ref) => {
                              if (ref && !videoDuration) {
                                ref.onloadedmetadata = () => {
                                  setVideoDuration(ref.duration)
                                  setTrimRange((prev) => ({
                                    ...prev,
                                    end: String(ref.duration),
                                  }))
                                  setEndTime(ref.duration.toString())
                                }
                              }
                            }}
                          />
                        </div>
                      ) : updatedVideoUrl ? (
                        <div className="flex flex-col items-center gap-4">
                          <OverlayAddedVideo
                            overlays={sliceOverlays}
                            videoUrl={updatedVideoUrl}
                          />
                        </div>
                      ) : (
                        <div className="mt-8 flex flex-col items-center gap-4 text-center">
                          <h2 className="text-lg font-medium text-gray-800 sm:text-xl">
                            {infoMsg2}
                          </h2>
                          <p className="max-w-[90%] text-sm text-gray-600 sm:text-base">
                            {infoMsg}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Download Button */}
                    <div className="mx-auto my-2 flex h-16 w-36 items-center justify-center">
                      {isVideoTrimmed && (
                        <button
                          onClick={downloadVideo}
                          className="flex w-36 items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-center text-white hover:bg-blue-600"
                        >
                          {downlodButtonName}
                          <span>
                            <RiVideoDownloadFill size={25} />
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FavVideoEditor
