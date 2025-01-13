import React, { memo } from 'react'
import { RiVideoUploadFill } from 'react-icons/ri'

const MemoizedVideoUploadIcon = memo(({ size }: { size: number }) => {
  return <RiVideoUploadFill size={size} />
})

export default MemoizedVideoUploadIcon
