import { Room, Client } from "colyseus"
import { Schema, type, MapSchema } from "@colyseus/schema"

export class Player extends Schema {
  @type("number")
  x = 100 * Math.random() + 250

  @type("number")
  y = -409.16

  @type("number")
  z = 100 * Math.random() + 120

  @type("number")
  rx = 0

  @type("number")
  ry = 0

  @type("number")
  rz = 0

  @type("string")
  motion = "idle"
}

export class State extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>()

  createPlayer(sessionId: string) {
    this.players.set(sessionId, new Player())
  }

  removePlayer(sessionId: string) {
    this.players.delete(sessionId)
  }

  updatePlayer(sessionId: string, data: any) {
    const player = this.players.get(sessionId)
    if (data.x) {
      player.x = data.x
    }
    if (data.y) {
      player.y = data.y
    }
    if (data.z) {
      player.z = data.z
    }
    if (data.rx) {
      player.rx = data.rx
    }
    if (data.ry) {
      player.ry = data.ry
    }
    if (data.rz) {
      player.rz = data.rz
    }
    if (data.motion) {
      player.motion = data.motion
    }
  }
}

export class GameRoom extends Room<State> {
  maxClients = 100

  onCreate(options: any) {
    console.log("GameRoom created!", options)

    this.setState(new State())

    this.onMessage("update", (client, data) => {
      console.log(`GameRoom update player ${client.sessionId}:${data}`)
      this.state.updatePlayer(client.sessionId, data)
    })
  }

  onJoin(client: Client) {
    client.send("hello", "world")
    this.state.createPlayer(client.sessionId)
    const player = this.state.players.get(client.sessionId)
    const otherPlayers = this.state.players.values()
    console.log(otherPlayers)
    client.send("joinin", { player, otherPlayers })
    this.broadcast("joined", player, { except: client })
  }

  onLeave(client: Client) {
    this.state.removePlayer(client.sessionId)
  }

  onDispose() {
    console.log("Dispose GameRoom")
  }

}
