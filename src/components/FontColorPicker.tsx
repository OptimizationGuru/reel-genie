import React, { useState } from 'react'
import { HexColorPicker } from 'react-colorful'

const FontColorPicker = () => {
  const [textShade, setTextShade] = useState('')

  return (
    <HexColorPicker
      color={textShade}
      onChange={(c) => setTextShade(c)}
      className="py-1"
    />
  )
}

export default FontColorPicker
