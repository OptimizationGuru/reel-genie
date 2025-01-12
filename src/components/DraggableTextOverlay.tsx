import React, { useState, memo } from 'react'
import { SketchPicker } from 'react-color'
import { Overlay, TextOverlayType } from '../types'

interface DraggableTextOverlayComponentProps {
  videoDuration: number
  textOverlays: Overlay[]
  setTextOverlays: React.Dispatch<React.SetStateAction<Overlay[]>>
  textRange: { start: string; end: string }
  setTextRange: React.Dispatch<
    React.SetStateAction<{ start: string; end: string }>
  >
  applyOverlay: () => void
}

const DraggableTextOverlayComponent: React.FC<DraggableTextOverlayComponentProps> =
  memo(
    ({
      videoDuration,
      textOverlays,
      setTextOverlays,
      textRange,
      setTextRange,
      applyOverlay,
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

        const newOverlay: TextOverlayType = {
          id: Math.random().toString(36).substr(2, 9),
          text: currentText,
          fontSize,
          type: 'text',
          fontStyle,
          color,
          position: { x: 50, y: 50 },
          startTime: Number(textRange.start),
          endTime: Number(textRange.end),
        }
        setTextOverlays([...textOverlays, newOverlay])
        setCurrentText('')
        applyOverlay()
      }

      return (
        <div className="w-[100%] border p-3">
          <h2 className="text-lg font-bold">Text Overlays</h2>

          <div className="mt-2 flex flex-col space-y-2">
            <input
              type="text"
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              placeholder="Enter text"
              className="w-full rounded border p-2 text-sm text-black"
            />

            <div className="flex flex-col items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm">Font Size: {fontSize}px</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-28"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm">Font Style:</label>
                <select
                  value={fontStyle}
                  onChange={(e) => setFontStyle(e.target.value)}
                  className="w-32 rounded border p-1 text-sm"
                >
                  <option value="Arial">Arial</option>
                  <option value="TimesNewRoman">Times New Roman</option>
                  <option value="CourierNew">Courier New</option>
                </select>
              </div>
            </div>

            <div className="my-4 flex h-auto w-auto justify-evenly gap-2">
              <label className="my-2 text-sm">Color:</label>
              <SketchPicker
                color={color}
                onChangeComplete={(c) => setColor(c.hex)}
                Size={30}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="">
                <h3 className="text-sm">Start Time: {textRange.start}s</h3>
                <input
                  type="range"
                  min="0"
                  max={videoDuration - 1}
                  value={textRange.start}
                  onChange={(e) => setTimings('start', Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              <div className="mt-2">
                <h3 className="text-sm">End Time: {textRange.end}s</h3>
                <input
                  type="range"
                  min={textRange.start}
                  max={videoDuration}
                  value={textRange.end}
                  onChange={(e) => setTimings('end', Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>

            <button
              className="mx-auto w-32 justify-center rounded bg-blue-500 px-4 py-2 text-center text-sm text-white"
              onClick={addTextOverlay}
            >
              Apply Overlay
            </button>
          </div>
        </div>
      )
    }
  )

export default DraggableTextOverlayComponent
