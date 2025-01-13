import React, { memo } from 'react'
import { SiGoogledisplayandvideo360 } from 'react-icons/si'

const MemoizedIcon = memo(
  ({
    size,
    color,
    className,
  }: {
    size: number
    color: string
    className: string
  }) => {
    return (
      <SiGoogledisplayandvideo360
        size={size}
        color={color}
        className={className}
      />
    )
  }
)

export default MemoizedIcon
