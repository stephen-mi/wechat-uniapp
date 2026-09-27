export interface CanvasTouchPoint {
  pageX: number
  pageY: number
  x: number
  y: number
}

export interface CanvasTouchEvent {
  touches: CanvasTouchPoint[]
  changedTouches: CanvasTouchPoint[]
  target?: { dataset?: Record<string, unknown> }
}
