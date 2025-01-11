import React from 'react'

interface TrimComponentProps {
  trimRange: { start: string; end: string }
  setTrimRange: React.Dispatch<
    React.SetStateAction<{ start: string; end: string }>
  >
  trimVideo: () => void
  videoDuration: number
}

const TrimComponent: React.FC<TrimComponentProps> = ({
  trimRange,
  setTrimRange,
  trimVideo,
  videoDuration,
}) => {
  const updateTrim = (type: string, value: number) => {
    setTrimRange((prev) => ({
      ...prev,
      [type]: value,
    }))
  }

  return (
    <div className="flex flex-col border p-4">
      <h2 className="text-lg font-bold">Trim Video</h2>
      <div>
        <h3 className="text-sm">Start Time: {trimRange.start}s</h3>
        <input
          type="range"
          min="0"
          max="100" // Replace with actual video duration
          value={trimRange.start}
          onChange={(e) => updateTrim('start', Number(e.target.value))}
          className="w-full accent-blue-500"
        />
      </div>
      <div className="mt-4">
        <h3 className="text-sm">End Time: {trimRange.end}s</h3>
        <input
          type="range"
          min={trimRange.start}
          max="100" // Replace with actual video duration
          value={trimRange.end}
          onChange={(e) => updateTrim('end', Number(e.target.value))}
          className="w-full accent-blue-500"
        />
      </div>
      <button
        onClick={() => {
          trimVideo()
        }}
        className="mx-auto my-2 w-40 items-center rounded-md bg-blue-500 px-3 py-3 text-white shadow-lg hover:bg-gray-300"
      >
        Trim Video
      </button>
    </div>
  )
}

export default TrimComponent
