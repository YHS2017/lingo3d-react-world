import React, { useRef } from 'react'
import { Model, useLoop } from 'lingo3d-react'

const People: React.FC<{
  pid?: string,
  src: string,
  x?: number,
  y?: number,
  z?: number,
  rotationX?: number,
  rotationY?: number,
  rotationZ?: number,
  innerRotationX?: number,
  innerRotationY?: number,
  innerRotationZ?: number,
  physics?: any,
  animations?: any,
  animation?: string,
  autoMove?: boolean,
  step?: number,
  move?: { x: number, y: number },
  update?: Function,
  children?: React.ReactNode
}> = ({ children, pid, autoMove = false, step = 4, update, ...imodel }) => {
  const ref = useRef<any>()
  useLoop(() => {
    if (ref.current) {
      if (autoMove && step && imodel.animation === 'run') {
        ref.current.moveForward(-1 * step * Math.cos(Math.PI / 180 * (imodel.innerRotationY || 0)));
        ref.current.moveRight(step * Math.sin(Math.PI / 180 * (imodel.innerRotationY || 0)));
      }
      update?.({
        x: ref.current.x,
        y: ref.current.y,
        z: ref.current.z,
        innerRotationY: imodel.innerRotationY,
        animation: imodel.animation
      })
    }
  })
  return (
    <Model key={pid} ref={ref} {...imodel} >
      {children}
    </Model>
  )
}

export default People