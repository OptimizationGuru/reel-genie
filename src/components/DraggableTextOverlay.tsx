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
        <div className="mx-auto -mt-10 flex h-auto w-full max-w-lg flex-col rounded-lg border p-4 sm:p-6 lg:p-8">
          <h2 className="text-center text-lg font-bold sm:text-left">
            Text Overlays
          </h2>

          <div className="mt-4 flex flex-col gap-4">
            {/* Text Input */}
            <input
              type="text"
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              placeholder="Enter text"
              className="w-full rounded border p-2 text-sm text-black"
            />

            {/* Font Settings */}
            <div className="flex flex-col gap-4 sm:items-center sm:justify-between">
              {/* Font Size */}
              <div className="flex w-full items-center gap-2 sm:w-auto">
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

              {/* Font Style */}
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <label className="text-sm">Font Style:</label>
                <select
                  value={fontStyle}
                  onChange={(e) => setFontStyle(e.target.value)}
                  className="w-full rounded border p-1 text-sm sm:w-36"
                >
                  <option value="Arial">Arial</option>
                  <option value="TimesNewRoman">Times New Roman</option>
                  <option value="CourierNew">Courier New</option>
                </select>
              </div>
            </div>

            {/* Color Picker Toggle */}
            <div className="flex items-center gap-2">
              <label className="text-sm">Color:</label>
            </div>

            {/* Color Picker (Only shows when toggled) */}
            <div
              className={`mt-2 flex justify-center`}
              style={{ height: '200px', width: '300px' }} // Fixed height for color picker area
            >
              <SketchPicker
                color={color}
                onChangeComplete={(c) => setColor(c.hex)}
                width={160}
                height={200}
                disableAlpha={true}
                presetColors={[]}
                hex={false}
              />
            </div>

            {/* Timings */}
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm">Start Time: {textRange.start}s</h3>
                <input
                  type="range"
                  min="0"
                  max={videoDuration - 1}
                  value={textRange.start}
                  onChange={(e) =>
                    setTextRange({
                      ...textRange,
                      start: Number(e.target.value),
                    })
                  }
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <h3 className="text-sm">End Time: {textRange.end}s</h3>
                <input
                  type="range"
                  min={textRange.start}
                  max={videoDuration}
                  value={textRange.end}
                  onChange={(e) =>
                    setTextRange({ ...textRange, end: Number(e.target.value) })
                  }
                  className="w-full accent-blue-500"
                />
              </div>
            </div>

            {/* Apply Overlay Button */}
            <button
              className="mx-auto mt-4 w-40 rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
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
