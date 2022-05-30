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
}> = ({ children, pid, autoMove, step, rotationY = 0, animation, update, ...imodel }) => {
  const ref = useRef<any>()

  useLoop(() => {
    if (ref.current && autoMove && step && animation === 'run') {
      ref.current.moveForward(step * Math.sin(rotationY));
      ref.current.moveRight(step * Math.sin(rotationY));
      update?.({
        id: pid,
        x: ref.current.x,
        y: ref.current.y,
        z: ref.current.z,
        ry: ref.current.rotationY,
        motion: animation
      })
    }
  })
  return (
    <Model ref={ref} {...imodel}>
      {children}
    </Model>
  )
}

export default People