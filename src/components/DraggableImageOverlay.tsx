import React, { useState, useCallback, memo } from 'react'
import { ImageOverlayType, Overlay } from '../types'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../store'
import { setOverlaysatSlice } from '../store/slices/EditReelSlice'

interface DraggableImageOverlayComponentProps {
  imageOverlays: Overlay[]
  setImageOverlays: React.Dispatch<React.SetStateAction<Overlay[]>>
  imageRange: { start: string; end: string }
  setImageRange: React.Dispatch<
    React.SetStateAction<{ start: string; end: string }>
  >
  videoDuration: number
  applyOverlay: () => void
}

const DraggableImageOverlayComponent: React.FC<DraggableImageOverlayComponentProps> =
  memo(
    ({
      imageOverlays,
      setImageOverlays,
      imageRange,
      setImageRange,
      videoDuration,
      applyOverlay,
    }) => {
      const [imageUrl, setImageUrl] = useState<string | null>(null)
      const [imageHeight, setImageHeight] = useState<number>(100)
      const [imageWidth, setImageWidth] = useState<number>(100)
      const [imageName, setImageName] = useState<string | null>(null)
      const dispatch = useDispatch<AppDispatch>()

      const setTimings = useCallback(
        (type: string, value: number) => {
          setImageRange((prev) => ({
            ...prev,
            [type]: value,
          }))
        },
        [setImageRange]
      )

      const handleImageUpload = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const reader = new FileReader()
            reader.onload = () => setImageUrl(reader.result as string)
            reader.readAsDataURL(file)
            setImageName(file.name)
          }
        },
        []
      )

      const addImageOverlay = useCallback(() => {
        if (!imageUrl) {
          alert('Please upload an image first.')
          return
        }

        const newOverlay: ImageOverlayType = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'image',
          imageSrc: imageUrl,
          width: imageWidth,
          height: imageHeight,
          position: { x: 50, y: 50 },
          startTime: Number(imageRange.start),
          endTime: Number(imageRange.end),
        }
        setImageOverlays([...imageOverlays, newOverlay])
        dispatch(setOverlaysatSlice([...imageOverlays, newOverlay]))

        setImageUrl(null)
        applyOverlay()
      }, [
        imageUrl,
        imageHeight,
        imageWidth,
        imageRange,
        setImageOverlays,
        applyOverlay,
        imageOverlays,
        dispatch,
      ])

      return (
        <div className="w-full rounded-lg border p-4 sm:p-6 lg:px-8 lg:py-2">
          <h2 className="my-2 py-2 text-center text-lg font-bold sm:text-left">
            Image Overlays
          </h2>
          <div className="flex flex-col gap-6">
            {/* Image Upload Section */}
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6">
              <label className="mx-auto block w-max cursor-pointer rounded-md bg-teal-500 px-4 py-2 text-white hover:bg-teal-600">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
              {imageName && (
                <div className="mt-2 text-center text-sm text-gray-700 sm:text-left">
                  <strong>Uploaded Image:</strong> {imageName}
                </div>
              )}
            </div>

            {/* Dimensions Section */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex w-full flex-col gap-2 sm:w-auto">
                <div className="flex items-center gap-2">
                  <label>Width: {imageWidth}px</label>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    value={imageWidth}
                    onChange={(e) => setImageWidth(Number(e.target.value))}
                  />
                </div>
                <div className="flex items-center gap-2">
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
            </div>

            {/* Time Range Section */}
            <div className="flex flex-col items-center gap-6">
              <div className="w-full px-4 sm:px-8">
                <h3 className="text-sm">Start Time: {imageRange.start}s</h3>
                <input
                  type="range"
                  min="0"
                  max={videoDuration - 1}
                  value={imageRange.start}
                  onChange={(e) => setTimings('start', Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              <div className="w-full px-4 sm:px-8">
                <h3 className="text-sm">End Time: {imageRange.end}s</h3>
                <input
                  type="range"
                  min={imageRange.start}
                  max={videoDuration}
                  value={imageRange.end}
                  onChange={(e) => setTimings('end', Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>

            {/* Apply Overlay Button */}
            <button
              onClick={addImageOverlay}
              className="mx-auto w-40 justify-center rounded bg-blue-500 px-4 py-2 text-center text-sm text-white hover:bg-blue-600"
            >
              Apply Overlay
            </button>
          </div>
        </div>
      )
    }
  )

export default DraggableImageOverlayComponent
