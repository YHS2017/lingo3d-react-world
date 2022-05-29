import { createRef, useRef, useState } from "react"
import type * as Colyseus from "colyseus.js"
import client from "./utils/cliten"
import { Button, Card, Input, message, Space, Table } from "antd"
import { Editor, Find, HTML, Joystick, Keyboard, Library, Model, SceneGraph, ThirdPersonCamera, Toolbar, types, useLoop, usePreload, World } from "lingo3d-react"
import './App.css'

const App = () => {
  const [Page, setPage] = useState<string>('login')
  const [UserName, setUserName] = useState("");
  const [RoomList, setRoomList] = useState<any>([])
  const lobbyroom = useRef<Colyseus.Room>()
  const gameroom = useRef<Colyseus.Room>()

  // 其他玩家
  const [Players, setPlayers] = useState<any[]>([])

  // 当前玩家
  const [Me, setMe] = useState<any>(null)

  // 按键
  const keys = useRef<any[]>([])

  // 摇杆
  const joystick = useRef<any>(false)

  // 交互对象
  const [Interact, setInteract] = useState<any>(null)

  // 编辑开关
  const [CanEditor, setCanEditor] = useState(false)

  const progress = usePreload([
    "hql.fbx",
    "Standing.fbx",
    "Running.fbx",
    "club.glb",
    "sky2.jpeg"
  ], 15)

  const initLobbyLisener = () => {
    lobbyroom.current?.onMessage('rooms', (rooms) => {
      setRoomList(rooms)
    })

    lobbyroom.current?.onMessage("+", ([roomId, room]) => {
      const roomIndex = RoomList.findIndex((room: any) => room.roomId === roomId);
      if (roomIndex !== -1) {
        setRoomList(RoomList.map((room: any, index: number) => {
          if (index === roomIndex) {
            return room = roomId
          }
          return room
        }))
      } else {
        setRoomList([...RoomList, room])
      }
    });

    lobbyroom.current?.onMessage("-", (roomId) => {
      setRoomList(RoomList.filter((room: any) => room.roomId !== roomId));
    });
  }

  const toHome = async () => {
    if (UserName) {
      lobbyroom.current = await client.joinOrCreate("lobby")
      initLobbyLisener()
      setPage('home')
    }
  }

  const initGameRoomLisener = () => {
    if (gameroom.current) {
      gameroom.current.onStateChange.once((state) => {
        let me = null
        let players: any[] = []
        state.players.forEach((player: any) => {
          if (player.id === gameroom.current?.sessionId) {
            me = { ...player, ref: createRef<types.Model>() }
          } else {
            players.push({ ...player, ref: createRef<types.Model>() })
          }
        })
        console.log(me, players)
        setMe(me)
        setPlayers(players)
      })

      gameroom.current.state.players.onAdd = (player: any, key: string) => {
        player.onChange = (changes: any) => {
          let temp: any = {};
          changes.forEach((change: any) => {
            temp[change.field] = change.value;
          })
          console.log(temp);
          if (Me && Me.id === key) {
            setMe({ ...Me, ...temp })
          } else {
            setPlayers(Players.map((p: any) => {
              if (p.id === player.id) {
                return { ...p, ...temp }
              }
              return p
            }))
          }
        }
        if (Me && Me.id !== key) {
          setPlayers([...Players, { ...player, ref: createRef<types.Model>() }])
        }
      }

      gameroom.current.state.players.onRemove = (player: any, key: string) => {
        message.info(`玩家${player.name}`);
        setPlayers(Players.filter((p: any) => p.id !== key))
      }
    }
  }

  const joinRoom = async (roomId: string) => {
    gameroom.current = await client.joinById(roomId, { uname: UserName })
    initGameRoomLisener()
    setPage("room")
  }

  const createRoom = async () => {
    gameroom.current = await client.create('gameroom', { uname: UserName })
    initGameRoomLisener()
    setPage("room")
  }

  const keychange = (keys: any) => {
    if (!(Me && Me.ref.current)) return
    console.log(Me.ref.current)
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
    gameroom.current?.send("update", player)
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
    gameroom.current?.send("update", { id: Me.id, roomId: Me.roomId, motion: "idle" })
  }

  const onmove = (e: any) => {
    if (joystick.current) {
      if (joystick.current && (e.x > 8 || e.x < -8 || e.y > 8 || e.y < -8)) {
        gameroom.current?.send("update", { id: Me.id, roomId: Me.roomId, x: Me.ref.current.x, y: Me.ref.current.y, z: Me.ref.current.z, ry: e.angle * (-1) - 90, motion: "run" })
      }
    }
  }

  useLoop(() => {
    if (Me && Me.ref) {
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

  const columns: any = [
    {
      title: '房间ID',
      dataIndex: 'roomId',
    },
    {
      title: '人数上限',
      dataIndex: 'maxClients',
      align: 'center'
    },
    {
      title: '当前人数',
      dataIndex: 'clients',
      align: 'center'
    },
    {
      title: '操作',
      dataIndex: 'roomId',
      align: 'right',
      render: (roomId: string) => {
        return (
          <Button type="primary" onClick={() => joinRoom(roomId)}>加入</Button>
        )
      }
    }
  ]

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

  if (Page === 'login') return (
    <div className="login">
      <div className="login-box">
        <h2>请留下你的大名</h2>
        <Input style={{ margin: '10px 0 20px 0' }} value={UserName} onChange={(val) => setUserName(val.target.value)} />
        <Button type="primary" onClick={toHome}>进入大厅</Button>
      </div>
    </div>
  )

  if (Page === 'home') return (
    <Card title="游戏大厅" extra={
      <Space>
        <Button type="primary" onClick={() => createRoom()}>新建房间</Button>
      </Space>
    }>
      <Table columns={columns} dataSource={RoomList} rowKey="roomId" />
    </Card>
  )

  return (
    <>
      <World ambientOcclusion>
        {Me && <ThirdPersonCamera active mouseControl lockTargetRotation={Me.motion === "run"}>
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
            boxVisible
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
        </ThirdPersonCamera>}
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

export default App