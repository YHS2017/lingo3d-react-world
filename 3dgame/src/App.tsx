import { World, Model, ThirdPersonCamera, Skybox, Joystick, Keyboard, usePreload, Editor, Toolbar, SceneGraph, useLoop } from "lingo3d-react"
import { createRef, useEffect, useState, useCallback, useRef } from "react"
import socket from "./utils/socket"

const App = () => {
  const progress = usePreload([
    "hql.fbx",
    "Standing.fbx",
    "Running.fbx",
    "Jumping.fbx",
    "city.fbx",
    "sky2.jpeg"
  ], "65.7mb")

  // 其他玩家
  const [Players, setPlayers] = useState<any[]>([]);

  // 当前玩家
  const [Me, setMe] = useState<any>([]);

  // 按键
  const keys = useRef<any[]>([]);

  // 摇杆
  const joystick = useRef<any>(false);

  // 编辑开关
  const [CanEditor, setCanEditor] = useState(false);

  // 初始化socket事件监听
  const initSocketListener = useCallback(() => {
    socket.on("added", (player) => {
      setMe((oldMe: any) => ({ ...oldMe, ...player, ref: createRef() }));
    })

    socket.on("leaved", (playerid) => {
      setPlayers((oldPlayers: any) => oldPlayers.filter((player: any) => player.id !== playerid));
    })

    socket.on("update", (player) => {
      setMe((oldMe: any) => {
        if (oldMe.id === player.id) {
          return { ...oldMe, ...player }
        }
        setPlayers((oldPlayers: any) => {
          let players = oldPlayers;
          if (players.find((p: any) => p.id === player.id) !== undefined) {
            players = players.map((p: any) => {
              if (p.id === player.id) {
                return { ...p, ...player };
              }
              return p;
            });
          } else {
            players.push({ ...player, ref: createRef() });
          }
          return players;
        });
        return oldMe;
      });
    })
  }, [Me, Players]);

  useEffect(() => {
    initSocketListener();
  }, [initSocketListener]);

  const keychange = (keys: any) => {
    if (keys.includes("w") && !keys.includes("s") && !keys.includes("a") && !keys.includes("d")) {
      socket.emit("update", { id: Me.id, roomId: Me.roomId, x: Me.ref.current.x, y: Me.ref.current.y, z: Me.ref.current.z, ry: 0, motion: "run" });
    }
    if (keys.includes("s") && !keys.includes("w") && !keys.includes("a") && !keys.includes("d")) {
      socket.emit("update", { id: Me.id, roomId: Me.roomId, x: Me.ref.current.x, y: Me.ref.current.y, z: Me.ref.current.z, ry: 180, motion: "run" });
    }
    if (keys.includes("a") && !keys.includes("w") && !keys.includes("s") && !keys.includes("d")) {
      socket.emit("update", { id: Me.id, roomId: Me.roomId, x: Me.ref.current.x, y: Me.ref.current.y, z: Me.ref.current.z, ry: 90, motion: "run" });
    }
    if (keys.includes("d") && !keys.includes("w") && !keys.includes("s") && !keys.includes("a")) {
      socket.emit("update", { id: Me.id, roomId: Me.roomId, x: Me.ref.current.x, y: Me.ref.current.y, z: Me.ref.current.z, ry: -90, motion: "run" });
    }
    if (keys.length >= 2 && keys.includes("w") && keys.includes("a")) {
      socket.emit("update", { id: Me.id, roomId: Me.roomId, x: Me.ref.current.x, y: Me.ref.current.y, z: Me.ref.current.z, ry: 45, motion: "run" });
    }
    if (keys.length >= 2 && keys.includes("w") && keys.includes("d")) {
      socket.emit("update", { id: Me.id, roomId: Me.roomId, x: Me.ref.current.x, y: Me.ref.current.y, z: Me.ref.current.z, ry: -45, motion: "run" });
    }
    if (keys.length >= 2 && keys.includes("s") && keys.includes("a")) {
      socket.emit("update", { id: Me.id, roomId: Me.roomId, x: Me.ref.current.x, y: Me.ref.current.y, z: Me.ref.current.z, ry: 135, motion: "run" });
    }
    if (keys.length >= 2 && keys.includes("s") && keys.includes("d")) {
      socket.emit("update", { id: Me.id, roomId: Me.roomId, x: Me.ref.current.x, y: Me.ref.current.y, z: Me.ref.current.z, ry: -135, motion: "run" });
    }
    if (!(keys.includes("w") || keys.includes("s") || keys.includes("a") || keys.includes("d"))) {
      socket.emit("update", { id: Me.id, roomId: Me.roomId, motion: "idle" });
    }
  }

  const onkeydown = (key: any) => {
    keys.current.push(key);
    keychange(keys.current);
    if (key === "Insert") {
      setCanEditor(!CanEditor);
    }
  }

  const onkeyup = (key: any) => {
    keys.current = keys.current.filter((k: any) => k !== key);
    keychange(keys.current);
  }

  const onmovestart = () => {
    joystick.current = true;
  }

  const onmoveend = () => {
    joystick.current = false;
    socket.emit("update", { id: Me.id, roomId: Me.roomId, motion: "idle" });
  }

  const onmove = (e: any) => {
    if (joystick.current) {
      if (joystick.current && (e.x > 8 || e.x < -8 || e.y > 8 || e.y < -8)) {
        socket.emit("update", { id: Me.id, roomId: Me.roomId, x: Me.ref.current.x, y: Me.ref.current.y, z: Me.ref.current.z, ry: e.angle * (-1) - 90, motion: "run" });
      }
    }
  }

  useLoop(() => {
    if (Me.ref) {
      if (Me.motion === "run") {
        Me.ref.current.moveForward(-2);
      }
    }
    Players.forEach((player: any) => {
      if (player.motion === "run" && player.ref.current) {
        player.ref.current.moveForward(-2);
      }
    })
  })

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
      <World>
        <Skybox texture="sky2.jpeg" />
        <ThirdPersonCamera active mouseControl lockTargetRotation={false}>
          <Model
            ref={Me.ref}
            src="hql.fbx"
            physics="character"
            animations={{ idle: "Standing.fbx", run: "Running.fbx", jump: "Jumping.fbx" }}
            animation={Me.motion}
            x={Me.x}
            y={Me.y}
            z={Me.z}
            rotationX={Me.rx}
            rotationY={Me.ry}
            rotationZ={Me.rz}
          />
        </ThirdPersonCamera>
        {Players.map((player: any) => <Model
          ref={player.ref}
          key={player.id}
          src="hql.fbx"
          physics="character"
          animations={{ idle: "Standing.fbx", run: "Running.fbx", jump: "Jumping.fbx" }}
          animation={player.motion}
          x={player.x}
          y={player.y}
          z={player.z}
          rotationX={player.rx}
          rotationY={player.ry}
          rotationZ={player.rz}
        />)}
        <Model src="city.fbx" physics="map" scale={50} />
        {CanEditor ?
          <>
            <Toolbar />
            <SceneGraph />
            <Editor />
          </> : null
        }
      </World>
      <Keyboard onKeyDown={onkeydown} onKeyUp={onkeyup} />
      <Joystick onMove={onmove} onMoveStart={onmovestart} onMoveEnd={onmoveend} />
    </>
  )
}

export default App