import React, { useState } from 'react'
import { SketchPicker } from 'react-color'

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

interface DraggableTextOverlayComponentProps {
  videoDuration: number
  textOverlays: Overlay[]
  setTextOverlays: React.Dispatch<React.SetStateAction<Overlay[]>>
  textRange: { start: string; end: string }
  setTextRange: React.Dispatch<
    React.SetStateAction<{ start: string; end: string }>
  >
  applyOverlay: () => void
  // setIsTextOverlayAdded: React.Dispatch<React.SetStateAction<boolean>>
}

const DraggableTextOverlayComponent: React.FC<
  DraggableTextOverlayComponentProps
> = ({
  videoDuration,
  textOverlays,
  setTextOverlays,
  textRange,
  setTextRange,
  applyOverlay,
  // setIsTextOverlayAdded,
}) => {
  const [color, setColor] = useState('#ffffff')
  const [currentText, setCurrentText] = useState('')
  const [fontSize, setFontSize] = useState(24)
  const [fontStyle, setFontStyle] = useState('Arial')

  const setTimings = (type: string, value: number) => {
    setTextRange((prev) => ({
      ...prev,
      [type]: value,
    }))
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
      startTime: Number(textRange.start),
      endTime: Number(textRange.end),
    }
    setTextOverlays([...textOverlays, newOverlay])
    setCurrentText('')
    applyOverlay()
    // setIsTextOverlayAdded(true)
  }

  return (
    <div className="border p-4">
      <h2 className="text-lg font-bold">Text Overlays</h2>

      <div className="mb-4">
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
          <div className="flex w-full flex-col items-center gap-4">
            <div className="w-full px-8">
              <h3 className="text-sm">Start Time: {textRange.start}s</h3>
              <input
                type="range"
                min="0"
                max={videoDuration - 1} // Replace with actual video videoDuration
                value={textRange.start}
                onChange={(e) => setTimings('start', Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
            <div className="w-full px-8">
              <h3 className="text-sm">End Time: {textRange.end}s</h3>
              <input
                type="range"
                min={textRange.start}
                max={videoDuration} // Replace with actual video duration
                value={textRange.end}
                onChange={(e) => setTimings('end', Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>
          <button
            className="mx-auto w-32 rounded bg-blue-500 px-4 py-2 text-white"
            onClick={addTextOverlay}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default DraggableTextOverlayComponent
