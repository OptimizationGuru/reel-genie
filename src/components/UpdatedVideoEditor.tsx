import React, { useState, useEffect, useRef } from 'react'
import { createFFmpeg, fetchFile, FFmpeg } from '@ffmpeg/ffmpeg'
import Draggable from 'react-draggable'
import { SketchPicker } from 'react-color'
import { ImageOverlay, TextOverlay } from '../types'

const UpdatedVideoEditor: React.FC = () => {
  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  const [inputFile, setInputFile] = useState<File | null>(null)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [trimOutputUrl, setTrimOutputUrl] = useState<string | null>(null)
  const [videoDuration, setVideoDuration] = useState<number>(0)

  const [startTime, setStartTime] = useState<string>('0')
  const [endTime, setEndTime] = useState<string>('5')

  const [currentText, setCurrentText] = useState('')
  const [fontSize, setFontSize] = useState(24)
  const [fontStyle, setFontStyle] = useState('Arial')
  const [color, setColor] = useState('#ffffff')
  const [textStartTime, setTextStartTime] = useState<number>(0)
  const [textEndTime, setTextEndTime] = useState<number>(5)

  const [imageOverlays, setImageOverlays] = useState<ImageOverlay[]>([])
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imageWidth, setImageWidth] = useState<number>(100)
  const [imageHeight, setImageHeight] = useState<number>(100)
  const [imageStartTime, setImageStartTime] = useState<number>(0)
  const [imageEndTime, setImageEndTime] = useState<number>(5)

  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [start, setStart] = useState({ x: 0, y: 0 })

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const loadFFmpeg = async () => {
      const ffmpegInstance = createFFmpeg({
        log: true,
        corePath:
          process.env.NODE_ENV === 'production'
            ? 'https://your-production-domain.com/ffmpeg/ffmpeg-core.js'
            : 'https://localhost:5173/ffmpeg-core.js',
        locateFile: (file: string) =>
          process.env.NODE_ENV === 'production'
            ? `https://your-production-domain.com/ffmpeg/${file}`
            : `https://localhost:5173/${file}`,
      } as any)

      await ffmpegInstance.load()
      setFfmpeg(ffmpegInstance)
      setIsLoaded(true)
    }

    loadFFmpeg()
  }, [])

  const handleVideoUpload = async (file: File) => {
    setInputFile(file)
    await processVideo(file)
  }

  const processVideo = async (file: File) => {
    if (!ffmpeg || !isLoaded) return

    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(file))

    await ffmpeg.run('-i', 'input.mp4', '-vf', 'scale=640:360', 'output.mp4')

    const output = ffmpeg.FS('readFile', 'output.mp4')
    const blob = new Blob([output.buffer], { type: 'video/mp4' })
    setOutputUrl(URL.createObjectURL(blob))
  }

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration)
      setEndTime(videoRef.current.duration.toString())
    }
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
    setTrimOutputUrl(URL.createObjectURL(trimmedBlob))
  }

  const addTextOverlay = () => {
    if (currentText.trim() === '') {
      alert('Text cannot be empty.')
      return
    }

    const newOverlay: TextOverlay = {
      id: Math.random().toString(36).substr(2, 9),
      text: currentText,
      fontSize,
      fontStyle,
      color,
      position: { x: 50, y: 50 },
      startTime: textStartTime,
      endTime: textEndTime,
    }
    setTextOverlays([...textOverlays, newOverlay])
    setCurrentText('')
  }

  const updateTextPosition = (id: string, x: number, y: number) => {
    setTextOverlays((prev) =>
      prev.map((overlay) =>
        overlay.id === id ? { ...overlay, position: { x, y } } : overlay
      )
    )
  }

  const [textOverlays, setTextOverlays] = useState([
    {
      id: '1',
      text: 'Sample Text',
      position: { x: 0, y: 0 },
      fontSize: 16,
      fontStyle: 'Arial',
      color: 'black',
    },
  ])

  const updateTextPositionNew = (id: string, x: number, y: number) => {
    setTextOverlays((prev) =>
      prev.map((overlay) =>
        overlay.id === id ? { ...overlay, position: { x, y } } : overlay
      )
    )
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = () => setUploadedImage(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const addImageOverlay = () => {
    if (!uploadedImage) {
      alert('Please upload an image first.')
      return
    }

    const newOverlay: ImageOverlay = {
      id: Math.random().toString(36).substr(2, 9),
      imageSrc: uploadedImage,
      width: imageWidth,
      height: imageHeight,
      position: { x: 50, y: 50 },
      startTime: imageStartTime,
      endTime: imageEndTime,
    }
    setImageOverlays([...imageOverlays, newOverlay])
    setUploadedImage(null)
  }

  const updateImagePosition = (id: string, x: number, y: number) => {
    setImageOverlays((prev) =>
      prev.map((overlay) =>
        overlay.id === id ? { ...overlay, position: { x, y } } : overlay
      )
    )
  }

  const processVideoWithOverlays = async () => {
    if (!ffmpeg || !isLoaded || !inputFile) return

    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(inputFile))

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
    setOutputUrl(URL.createObjectURL(blob))
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsDragging(true)
    setStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - start.x,
        y: e.clientY - start.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, start])

  return (
    <div className="border border-black p-4">
      <h1 className="mb-4 text-2xl font-bold">Video Editor</h1>

      {/* FFmpeg Loading Status */}
      {!isLoaded ? (
        <p>Loading FFmpeg... Please wait.</p>
      ) : (
        <div className="">
          {/* Video Upload */}
          <div className="border-blue mb-4 border bg-gray-200">
            <input
              type="file"
              accept="video/mp4"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleVideoUpload(e.target.files[0])
                }
              }}
            />
          </div>

          {/* Processed Video Display */}
          {outputUrl && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Processed Video</h2>
              <video
                src={outputUrl}
                controls
                width="900"
                ref={videoRef}
                onLoadedMetadata={handleVideoLoaded}
                className="border"
              />
              <a
                href={outputUrl}
                download="output.mp4"
                className="text-blue-500 underline"
              >
                Download Processed Video
              </a>
            </div>
          )}

          {/* Trim Video */}
          {outputUrl && videoDuration > 0 && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Trim Video</h2>
              <div className="mt-2 flex items-center gap-4">
                <div>
                  <label>Start Time: {startTime}s</label>
                  <input
                    type="range"
                    min="0"
                    max={videoDuration}
                    step="0.1"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
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
              </div>
              <button
                className="mt-2 rounded bg-blue-500 px-4 py-2 text-white"
                onClick={trimVideoWithRange}
              >
                Trim Video
              </button>
            </div>
          )}

          {/* Trimmed Video Display */}
          {trimOutputUrl && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Trimmed Video</h2>
              <video
                src={trimOutputUrl}
                controls
                width="200"
                className="border"
              />
              <a
                href={trimOutputUrl}
                download="trimmed.mp4"
                className="text-blue-500 underline"
              >
                Download Trimmed Video
              </a>
            </div>
          )}

          {/* Text Overlay Controls */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Add Text Overlay on Video</h2>
            <div className="mt-2 flex flex-col gap-2">
              <input
                type="text"
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder="Enter text"
                className="rounded border p-2"
              />
              <div className="flex items-center gap-4">
                <div>
                  <label>Font Size: {fontSize}px</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label>Font Style:</label>
                  <select
                    value={fontStyle}
                    onChange={(e) => setFontStyle(e.target.value)}
                    className="rounded border p-2"
                  >
                    <option value="Arial">Arial</option>
                    <option value="TimesNewRoman">Times New Roman</option>
                    <option value="CourierNew">Courier New</option>
                  </select>
                </div>
              </div>
              <div>
                <label>Color:</label>
                <SketchPicker
                  color={color}
                  onChangeComplete={(c) => setColor(c.hex)}
                />
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label>Start Time:</label>
                  <input
                    type="number"
                    min="0"
                    max={videoDuration}
                    step="0.1"
                    value={textStartTime}
                    onChange={(e) => setTextStartTime(Number(e.target.value))}
                    className="rounded border p-2"
                  />
                </div>
                <div>
                  <label>End Time:</label>
                  <input
                    type="number"
                    min="0"
                    max={videoDuration}
                    step="0.1"
                    value={textEndTime}
                    onChange={(e) => setTextEndTime(Number(e.target.value))}
                    className="rounded border p-2"
                  />
                </div>
              </div>
              <button
                className="rounded bg-green-500 px-4 py-2 text-white"
                onClick={addTextOverlay}
              >
                Apply
              </button>
            </div>
          </div>

          {/* Render Text Overlays on Video */}
          {outputUrl && (
            <div
              style={{
                position: 'relative',
                width: '640px',
                height: '360px',
                border: '1px solid black',
              }}
              className="mb-4"
            >
              <video
                src={outputUrl}
                controls
                width="640"
                height="360"
                className="absolute left-0 top-0"
              />
              {textOverlays.map((overlay) => (
                <>
                  <Draggable
                    key={overlay.id}
                    position={overlay.position}
                    onStop={(e, data) =>
                      updateTextPosition(overlay.id, data.x, data.y)
                    }
                  >
                    <div
                      style={{
                        position: 'absolute',
                        fontSize: `${overlay.fontSize}px`,
                        fontFamily: overlay.fontStyle,
                        color: overlay.color,
                        cursor: 'move',
                        userSelect: 'none',
                        pointerEvents: 'none',
                      }}
                    >
                      {overlay.text}
                    </div>
                  </Draggable>

                  <div
                    style={{
                      position: 'absolute',
                      left: `${position.x}px`,
                      top: `${position.y}px`,
                      fontSize: '20px',
                      cursor: 'move',
                      userSelect: 'none',
                    }}
                    onMouseDown={handleMouseDown}
                  >
                    Drag Me!
                  </div>
                </>
              ))}

              <div>
                {textOverlays.map((overlay) => (
                  <Draggable
                    key={overlay.id}
                    position={overlay.position}
                    onStop={(e, data) =>
                      updateTextPositionNew(overlay.id, data.x, data.y)
                    }
                  >
                    <div
                      style={{
                        position: 'absolute',
                        fontSize: `${overlay.fontSize}px`,
                        fontFamily: overlay.fontStyle,
                        color: overlay.color,
                        cursor: 'move',
                        userSelect: 'none',
                      }}
                    >
                      {overlay.text}
                    </div>
                  </Draggable>
                ))}
              </div>
            </div>
          )}

          {/* Image Overlay Controls */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Add Image Overlay</h2>
            <div className="mt-2 flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <div className="flex items-center gap-4">
                <div>
                  <label>Width: {imageWidth}px</label>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    value={imageWidth}
                    onChange={(e) => setImageWidth(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label>Height: {imageHeight}px</label>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    value={imageHeight}
                    onChange={(e) => setImageHeight(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label>Start Time:</label>
                  <input
                    type="number"
                    min="0"
                    max={videoDuration}
                    step="0.1"
                    value={imageStartTime}
                    onChange={(e) => setImageStartTime(Number(e.target.value))}
                    className="rounded border p-2"
                  />
                </div>
                <div>
                  <label>End Time:</label>
                  <input
                    type="number"
                    min="0"
                    max={videoDuration}
                    step="0.1"
                    value={imageEndTime}
                    onChange={(e) => setImageEndTime(Number(e.target.value))}
                    className="rounded border p-2"
                  />
                </div>
              </div>
              <button
                className="rounded bg-green-500 px-4 py-2 text-white"
                onClick={addImageOverlay}
              >
                Add Image
              </button>
            </div>
          </div>

          {/* Render Image Overlays on Video */}
          {outputUrl && (
            <div
              style={{
                position: 'relative',
                width: '640px',
                height: '360px',
                border: '1px solid black',
              }}
              className="mb-4"
            >
              <video
                src={outputUrl}
                controls
                width="640"
                height="360"
                className="absolute left-0 top-0"
              />
              {imageOverlays.map((overlay) => (
                <Draggable
                  key={overlay.id}
                  position={overlay.position}
                  onStop={(e, data) =>
                    updateImagePosition(overlay.id, data.x, data.y)
                  }
                >
                  <img
                    src={overlay.imageSrc}
                    alt="overlay"
                    style={{
                      position: 'absolute',
                      width: `${overlay.width}px`,
                      height: `${overlay.height}px`,
                      cursor: 'move',
                      userSelect: 'none',
                    }}
                  />
                </Draggable>
              ))}
            </div>
          )}

          {/* Process Video with Overlays */}
          {outputUrl && (
            <div className="mb-4">
              <button
                className="rounded bg-purple-500 px-4 py-2 text-white"
                onClick={processVideoWithOverlays}
              >
                Process Video with Overlays
              </button>
            </div>
          )}

          Download Final Video
          {outputUrl && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Final Video</h2>
              <video src={outputUrl} controls width="900" className="border" />
              <a
                href={outputUrl}
                download="final-output.mp4"
                className="text-blue-500 underline"
              >
                Download Final Video
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UpdatedVideoEditor
