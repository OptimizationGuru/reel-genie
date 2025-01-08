import React from 'react'
import VideoEditor from '../components/VideoEditor'

const HomePage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="mb-6 text-4xl font-bold">Video Editor</h1>
      <VideoEditor />
    </div>
  )
}

export default HomePage
