import { World, Model, ThirdPersonCamera, Joystick, Keyboard, usePreload, Find, Editor, Toolbar, SceneGraph, Library, useLoop, HTML } from "lingo3d-react"
import { createRef, useEffect, useState, useRef } from "react"
import type * as Colyseus from "colyseus.js"
import "./index.css"
import { message } from "antd"

const Room = ({ room }: { room: Colyseus.Room }) => {
  const progress = usePreload([
    "hql.fbx",
    "Standing.fbx",
    "Running.fbx",
    "club.glb",
    "sky2.jpeg"
  ], "17.7mb")

  // 其他玩家
  const [Players, setPlayers] = useState<any[]>([])

  // 当前玩家
  const [Me, setMe] = useState<any>({})

  // 按键
  const keys = useRef<any[]>([])

  // 摇杆
  const joystick = useRef<any>(false)

  // 交互对象
  const [Interact, setInteract] = useState<any>(null)

  // 编辑开关
  const [CanEditor, setCanEditor] = useState(false)

  useEffect(() => {
    room.onStateChange.once((state) => {
      let me = null
      let players: any[] = []
      state.players.forEach((player: any) => {
        if (player.id === room.sessionId) {
          me = { ...player, ref: createRef() }
        } else {
          players.push({ ...player, ref: createRef() })
        }
      })
      console.log(me, players)
      setMe(me)
      setPlayers(players)
    })

    room.state.players.onAdd = (player: any, key: string) => {
      console.log(player);
      if (room.sessionId !== key) {
        setPlayers([...Players, { ...player, ref: createRef() }])
      }
    }

    room.state.players.onRemove = (player: any, key: string) => {
      message.info(`玩家${player.name}`);
      setPlayers(Players.filter((p: any) => p.id !== key))
    }

    room.state.players.onChange = (player: any, key: string) => {
      console.log(player);
      if (Me.id === key) {
        setMe({ ...Me, ...player })
      } else {
        setPlayers(Players.map((p: any) => {
          if (p.id === player.id) {
            return { ...p, ...player }
          }
          return p
        }))
      }
    }
  }, [Me, Players, Interact])

  const keychange = (keys: any) => {
    let player: any = { id: Me.id, roomId: Me.roomId, x: Me.ref.current.x, y: Me.ref.current.y, z: Me.ref.current.z, ry: Me.ref.current.ry }
    if (keys.includes("w") && !keys.includes("s") && !keys.includes("a") && !keys.includes("d")) {
      player = { ...player, ry: 0, motion: "run" }
    }
    if (keys.includes("s") && !keys.includes("w") && !keys.includes("a") && !keys.includes("d")) {
      player = { ...player, ry: 180, motion: "run" }
    }
    if (keys.includes("a") && !keys.includes("w") && !keys.includes("s") && !keys.includes("d")) {
      player = { ...player, ry: 90, motion: "run" }
    }
    if (keys.includes("d") && !keys.includes("w") && !keys.includes("s") && !keys.includes("a")) {
      player = { ...player, ry: -90, motion: "run" }
    }
    if (keys.length >= 2 && keys.includes("w") && keys.includes("a")) {
      player = { ...player, ry: 45, motion: "run" }
    }
    if (keys.length >= 2 && keys.includes("w") && keys.includes("d")) {
      player = { ...player, ry: -45, motion: "run" }
    }
    if (keys.length >= 2 && keys.includes("s") && keys.includes("a")) {
      player = { ...player, ry: 135, motion: "run" }
    }
    if (keys.length >= 2 && keys.includes("s") && keys.includes("d")) {
      player = { ...player, ry: -135, motion: "run" }
    }
    if (!(keys.includes("w") || keys.includes("s") || keys.includes("a") || keys.includes("d"))) {
      player = { ...player, motion: "idle" }
    }
    room?.send("update", player)
  }

  const onkeydown = (key: any) => {
    if (!keys.current.includes(key)) {
      keys.current.push(key)
      keychange(keys.current)
    }
    if (key === "Insert") {
      setCanEditor(!CanEditor)
    }
    if (key === "ArrowUp" || key === "ArrowDown") {
      if (Interact !== null) {
        if (Interact.index === 0) {
          setInteract({ ...Interact, index: 1 })
        } else {
          setInteract({ ...Interact, index: 0 })
        }
      }
    }
  }

  const onkeyup = (key: any) => {
    keys.current = keys.current.filter((k: any) => k !== key)
    if (key === 'Space') return
    keychange(keys.current)
  }

  const onmovestart = () => {
    joystick.current = true
  }

  const onmoveend = () => {
    joystick.current = false
    room?.send("update", { id: Me.id, roomId: Me.roomId, motion: "idle" })
  }

  const onmove = (e: any) => {
    if (joystick.current) {
      if (joystick.current && (e.x > 8 || e.x < -8 || e.y > 8 || e.y < -8)) {
        room?.send("update", { id: Me.id, roomId: Me.roomId, x: Me.ref.current.x, y: Me.ref.current.y, z: Me.ref.current.z, ry: e.angle * (-1) - 90, motion: "run" })
      }
    }
  }

  useLoop(() => {
    if (Me.ref) {
      if (Me.motion === "run") {
        Me.ref.current.moveForward(-Math.cos(Math.PI / 180 * Me.ry) * 6)
        Me.ref.current.moveRight(Math.sin(Math.PI / 180 * Me.ry) * 6)
      }
    }

    let temp: any = null
    Players.forEach((player: any) => {
      if (player.motion === "run" && player.ref.current) {
        player.ref.current.moveForward(-Math.cos(Math.PI / 180 * player.ry) * 6)
        player.ref.current.moveRight(Math.sin(Math.PI / 180 * player.ry) * 6)
      }

      const s = (Me.x - player.x) * (Me.x - player.x) + (Me.z - player.z) * (Me.z - player.z)
      if (s < 10000) {
        if (temp === null) {
          temp = { id: player.id, s, index: 0 }
        } else {
          if (temp.s > s) {
            temp = { id: player.id, s, index: 0 }
          }
        }
      }
    })
    if (temp === null) {
      setInteract(null)
    } else {
      if (Interact !== null) {
        if (temp.id !== Interact.id) {
          setInteract({ ...temp })
        }
      } else {
        setInteract({ ...temp })
      }
    }
  })

  const renderMenu = () => {
    console.log(Interact)
    if (Interact !== null) {
      return (
        <HTML key={`${Interact.id}-${Interact.index}`}>
          <div className="menu">
            <b className={Interact.index === 0 ? 'active' : ''}>打招呼</b>
            <b className={Interact.index === 1 ? 'active' : ''}>邀请跳舞</b>
          </div>
        </HTML>
      )
    }
    return null
  }

  if (progress < 100)
    return (
      <div style={{
        width: "100vw",
        height: "100vh",
        left: 0,
        top: 0,
        backgroundColor: "black",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        loading {Math.round(progress)}%
      </div>
    )

  return (
    <>
      <World ambientOcclusion bloom bloomStrength={0.1} bloomRadius={1} bloomThreshold={0.7}>
        <ThirdPersonCamera active mouseControl lockTargetRotation={Me.motion === 'run'}>
          <Model
            ref={Me.ref}
            src="hql.fbx"
            physics="character"
            animations={{ idle: "Standing.fbx", run: "Running.fbx" }}
            animation={Me.motion}
            x={Me.x}
            y={Me.y}
            z={Me.z}
            innerRotationX={Me.rx}
            innerRotationY={Me.ry}
            innerRotationZ={Me.rz}
          >
            <Find name="Wolf3D_Head">
              <HTML>
                <div className="name">{Me.uname}</div>
              </HTML>
            </Find>
            <Find name="Wolf3D_Outfit_Top" >
              {renderMenu()}
            </Find>
          </Model>
        </ThirdPersonCamera>
        {Players.map((player: any) => <Model
          ref={player.ref}
          key={player.id}
          src="hql.fbx"
          physics="character"
          animations={{ idle: "Standing.fbx", run: "Running.fbx" }}
          animation={player.motion}
          x={player.x}
          y={player.y}
          z={player.z}
          innerRotationX={player.rx}
          innerRotationY={player.ry}
          innerRotationZ={player.rz}
        >
          <Find name="Wolf3D_Head">
            <HTML>
              <div className="name">{player.uname}</div>
            </HTML>
          </Find>
        </Model>)}
        <Model src="club.glb" physics="map" scale={20} />
        {CanEditor ?
          <>
            <Toolbar />
            <SceneGraph />
            <Editor />
            <Library />
          </> : null
        }
      </World>
      <Keyboard onKeyDown={onkeydown} onKeyUp={onkeyup} />
      <Joystick onMove={onmove} onMoveStart={onmovestart} onMoveEnd={onmoveend} />
    </>
  )
}

export default Room