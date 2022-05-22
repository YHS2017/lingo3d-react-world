import type * as Colyseus from "colyseus.js"
import { useEffect, useState } from "react"
import { Card, Button, Space, Table } from "antd"

const Home = ({ client, join, create }: { client: Colyseus.Client, join: Function, create: Function }) => {
  const [RoomList, setRoomList] = useState<any>([])

  const getrooms = async () => {
    const rooms = await client.getAvailableRooms()
    setRoomList(rooms)
  }

  const createroom = async () => {
    await create();
    await getrooms();
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
          <Button type="primary" onClick={() => join(roomId)}>加入</Button>
        )
      }
    }
  ]

  useEffect(() => {
    getrooms()
  }, [])
  return (
    <Card title="游戏大厅" extra={
      <Space>
        <Button type="primary" onClick={createroom}>新建房间</Button>
        <Button onClick={getrooms}>刷新</Button>
      </Space>
    }>
      <Table columns={columns} dataSource={RoomList} />
    </Card>
  )
}

export default Home