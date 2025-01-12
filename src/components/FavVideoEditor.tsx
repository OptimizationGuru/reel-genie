import React, { useState, useRef, useEffect } from 'react'
import { createFFmpeg, fetchFile, FFmpeg } from '@ffmpeg/ffmpeg'
import Draggable from 'react-draggable'
import OverlayAddedVideo from './AddLayovers'
import EditorConsole from './EditorConsole'
import VideoUploader from './VideoUploader'
import { warningMsg1, warningMsg2, warningMsg3 } from '../constant'
import VideoPreview from './VideoPreview'
import { RiVideoDownloadFill } from 'react-icons/ri'
import Loader from './Loader'

const FavVideoEditor = () => {
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

  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null)
  const [textOverlays, setTextOverlays] = useState<TextOverlayType[]>([])
  const [imageOverlays, setImageOverlays] = useState<ImageOverlayType[]>([])
  const [overlays, setOverlays] = useState<Overlay[]>([])
  const [endTime, setEndTime] = useState<string>('')
  const [trimRange, setTrimRange] = useState({ start: '0', end: '100' })

  const [textOverlayRange, setTextOverlayRange] = useState({
    start: '0',
    end: '100',
  })
  const [imgOverlayRange, setImgOverlayRange] = useState({
    start: '0',
    end: '100',
  })

  const [inputFile, setInputFile] = useState<File | null>(null)
  const [outputUrl, setOutputUrl] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const [videoDuration, setVideoDuration] = useState<number>(0)
  const [editedVideoUrl, setEditedVideoUrl] = useState<string>('')
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [start, setStart] = useState({ x: 0, y: 0 })

  const [showComponent, setShowComponent] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Handle file upload
  const processVideo = async (file: File) => {
    if (!ffmpeg || !isLoaded) return
    setIsProcessing(true)
    const video = await fetchFile(file)
    ffmpeg.FS('writeFile', 'input.mp4', video)

    await ffmpeg.run('-i', 'input.mp4', '-vf', 'scale=640:360', 'output.mp4')

    const output = ffmpeg.FS('readFile', 'output.mp4')
    const blob = new Blob([output.buffer], { type: 'video/mp4' })
    setOutputUrl(URL.createObjectURL(blob))
    setIsProcessing(false)
  }

  const trimVideoWithRange = async () => {
    console.log('trim called')
    if (!ffmpeg || !isLoaded || !videoDuration) return

    const start = parseFloat(trimRange.start)
    let end = parseFloat(trimRange.end)
    const duration = (end - start).toFixed(2)

    if (start >= end) {
      alert({ warningMsg1 })
      return
    }
    if (start < 0) {
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
    setEditedVideoUrl(URL.createObjectURL(trimmedBlob))
  }

  const processVideoWithOverlays = async () => {
    if (!ffmpeg || !isLoaded || !inputFile) return

    setIsProcessing(true)
    if (editedVideoUrl && showComponent !== 2) setShowComponent(2)
    // console.log('loading start')
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(inputFile))

    const textOverlays = overlays.filter((el) => el.type === 'text')
    const imageOverlays = overlays.filter((el) => el.type === 'image')

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
    setEditedVideoUrl(URL.createObjectURL(blob))
    // console.log('createObjectURL', URL.createObjectURL(blob))
    setIsProcessing(false)
    // console.log('loading end')
    setTextOverlays(textOverlays)
    setImageOverlays(imageOverlays)
  }

  // Function to download the processed video
  const downloadVideo = () => {
    if (editedVideoUrl) {
      const link = document.createElement('a')
      link.href = editedVideoUrl
      link.download = 'processed_video.mp4'
      link.click()
    } else {
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
  }, [outputUrl])

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

  return (
    <div className="flex w-full flex-col items-center justify-around p-4">
      <div className="absolute z-50">{isLoading && <Loader />}</div>

      <div className="h-auto w-full gap-4">
        {outputUrl && (
          <div className="fixed left-0 top-0 z-50 w-full bg-gray-50 shadow-md">
            <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-3">
              <h1 className="text-2xl font-bold text-gray-700 sm:text-3xl md:text-4xl">
                ClipCraft
              </h1>
            </div>
          </div>
        )}

        {!outputUrl && (
          <VideoUploader
            onVideoUpload={processVideo}
            isProcessing={isProcessing}
            saveFile={setInputFile}
          />
        )}

        {outputUrl && (
          <div className={`relative mt-20 flex w-full justify-start gap-8`}>
            <div
              className={`w-[55%] rounded-2xl bg-gray-50 pt-8 shadow-xl ${outputUrl ? 'border border-red-500' : ''}`}
            >
              {outputUrl && (
                <EditorConsole
                  videoDuration={videoDuration}
                  Overlays={overlays}
                  setOverlays={setOverlays}
                  textRange={textOverlayRange}
                  imageRange={imgOverlayRange}
                  setTextRange={setTextOverlayRange}
                  setImageRange={setImgOverlayRange}
                  trimRange={trimRange}
                  setTrimRange={setTrimRange}
                  trimVideo={trimVideoWithRange}
                  applyOverlay={processVideoWithOverlays}
                  videoUrl={editedVideoUrl}
                  download={downloadVideo}
                  setIsLoading={setIsLoading}
                />
              )}
            </div>

            <div
              className={`flex w-[45%] flex-col rounded-2xl bg-gray-50 ${outputUrl ? 'border border-red-500' : ''}`}
            >
              {outputUrl && (
                <div className="mx-auto flex w-full max-w-lg flex-col gap-8 py-12">
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

                  <div className="flex flex-col items-center">
                    <div className="flex h-[400px] w-full items-center justify-center">
                      {showComponent === 1 ? (
                        <div className="flex flex-col items-center gap-4">
                          <video
                            src={outputUrl}
                            controls
                            className="rounded-lg shadow-md"
                            width="600"
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
                      ) : editedVideoUrl ? (
                        <div className="flex flex-col items-center gap-4">
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
                            Please upload or generate an edited video to view it
                            here.
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
                    className="flex w-36 items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-center text-white"
                  >
                    Download{' '}
                    <span>
                      <RiVideoDownloadFill size={25} />
                    </span>
                  </button>
                </div>
              )}
            </div>
            {/* <VideoPreview
            outputUrl={outputUrl}
            editedVideoUrl={editedVideoUrl}
            showComponent={showComponent}
            setShowComponent={setShowComponent}
            setTrimRange={setTrimRange}
            setEndTime={setEndTime}
            overlays={overlays}
            downloadVideo={downloadVideo}
            videoDuration={videoDuration}
            setVideoDuration={setVideoDuration}
          /> */}
          </div>
        )}
      </div>
    </div>
  )
}

export default FavVideoEditor
