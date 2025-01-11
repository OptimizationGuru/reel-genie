import React, { useState } from 'react'

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

interface DraggableImageOverlayComponentProps {
  imageOverlays: Overlay[]
  setImageOverlays: React.Dispatch<React.SetStateAction<Overlay[]>>
  imageRange: { start: string; end: string }
  setImageRange: React.Dispatch<
    React.SetStateAction<{ start: string; end: string }>
  >
  videoDuration: number
  applyOverlay: () => void
  // setIsImageOverlayAdded: React.Dispatch<React.SetStateAction<boolean>>
}

const DraggableImageOverlayComponent: React.FC<
  DraggableImageOverlayComponentProps
> = ({
  imageOverlays,
  setImageOverlays,
  imageRange,
  setImageRange,
  videoDuration,
  applyOverlay,
  // setIsImageOverlayAdded,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageHeight, setImageHeight] = useState<number>(100)
  const [imageWidth, setImageWidth] = useState<number>(100)

  const setTimings = (type: string, value: number) => {
    setImageRange((prev) => ({
      ...prev,
      [type]: value,
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = () => setImageUrl(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const addImageOverlay = () => {
    if (!imageUrl) {
      alert('Please upload an image first.')
      return
    }

    const newOverlay: ImageOverlayType = {
      id: Math.random().toString(36).substr(2, 9),
      imageSrc: imageUrl,
      width: imageWidth,
      height: imageHeight,
      position: { x: 50, y: 50 },
      startTime: Number(imageRange.start),
      endTime: Number(imageRange.end),
    }
    setImageOverlays([...imageOverlays, newOverlay])
    setImageUrl(null)
    applyOverlay()
    // setIsImageOverlayAdded(true)
  }

  return (
    <div className="w-full border p-4">
      <h2 className="text-lg font-bold">Image Overlays</h2>
      <div className="mt-2 flex w-full flex-col gap-4">
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <div className="ml-9 flex w-full flex-col items-center gap-4">
          <div className="flex w-full gap-2">
            <label>Width: {imageWidth}px</label>
            <input
              type="range"
              min="50"
              max="500"
              value={imageWidth}
              onChange={(e) => setImageWidth(Number(e.target.value))}
            />
          </div>
          <div className="flex w-full gap-2">
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

        <div className="flex w-full flex-col items-center gap-4">
          <div className="w-full px-8">
            <h3 className="text-sm">Start Time: {imageRange.start}s</h3>
            <input
              type="range"
              min="0"
              max={videoDuration - 1} // Replace with actual video videoDuration
              value={imageRange.start}
              onChange={(e) => setTimings('start', Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
          <div className="w-full px-8">
            <h3 className="text-sm">End Time: {imageRange.end}s</h3>
            <input
              type="range"
              min={imageRange.start}
              max={videoDuration} // Replace with actual video duration
              value={imageRange.end}
              onChange={(e) => setTimings('end', Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
        <button
          onClick={addImageOverlay}
          className="mx-auto w-32 rounded-md bg-blue-500 px-4 py-2 text-white"
        >
          Apply
        </button>
      </div>
    </div>
  )
}

export default DraggableImageOverlayComponent
