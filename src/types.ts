export interface TextOverlay {
  id: string
  text: string
  fontSize: number
  fontStyle: string
  color: string
  position: { x: number; y: number }
  startTime: number
  endTime: number
}

export interface ImageOverlay {
  id: string
  imageSrc: string
  width: number
  height: number
  position: { x: number; y: number }
  startTime: number
  endTime: number
}
