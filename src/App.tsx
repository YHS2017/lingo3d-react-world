import { useRef, useState } from "react"
import Login from "./pages/login"
import Home from "./pages/home"
import Room from "./pages/room"
import client from "./utils/cliten"

const App = () => {
  const [Page, setPage] = useState<string>('login')
  const [Name, setName] = useState<string>();
  const room = useRef<any>();

  const initName = (name: string) => {
    setName(name)
    setPage('home')
  }

  const joinRoom = async (roomId: string) => {
    room.current = await client.joinById(roomId, { uname: Name })
    setPage("room")
  }

  const createRoom = async () => {
    room.current = await client.joinOrCreate('world', { uname: Name })
    setPage("room")
  }

  if (Page === 'login') return <Login init={initName} />
  if (Page === 'home') return <Home client={client} join={joinRoom} create={createRoom} />
  return <Room room={room.current} />
}

export default App