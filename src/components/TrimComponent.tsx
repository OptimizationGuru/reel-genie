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
}) => {
  const updateTrim = (type: string, value: number) => {
    setTrimRange((prev) => ({
      ...prev,
      [type]: value,
    }))
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col rounded-lg border p-4 sm:p-6 lg:px-8 lg:py-2">
      <h2 className="text-center text-lg font-bold sm:text-left">Trim Video</h2>
      <div className="mt-4">
        <h3 className="text-center text-sm sm:text-left">
          Start Time: {trimRange.start}s
        </h3>
        <input
          type="range"
          min="0"
          max="100" // Replace with actual video duration
          value={trimRange.start}
          onChange={(e) => updateTrim('start', Number(e.target.value))}
          className="w-full accent-blue-500"
        />
      </div>
      <div className="mt-6">
        <h3 className="text-center text-sm sm:text-left">
          End Time: {trimRange.end}s
        </h3>
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
        className="mx-auto mt-4 w-40 rounded bg-blue-500 px-4 py-2 text-center text-sm text-white hover:bg-blue-600"
      >
        Trim Video
      </button>
    </div>
  )
}

export default TrimComponent
