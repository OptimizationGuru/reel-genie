import React from 'react'

const Loader: React.FC = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      {/* Spinner */}
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      {/* Message */}
      <p className="mt-4 text-lg font-medium text-gray-700">Processing...</p>
    </div>
  )
}

export default Loader
