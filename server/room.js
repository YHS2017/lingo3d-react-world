const { Room, Client } = require("colyseus")
const { Schema, MapSchema, defineTypes } = require("@colyseus/schema")

class Player extends Schema {
}

defineTypes(Player, {
  x: "number",
  y: "number",
  z: "number",
  rx: "number",
  ry: "number",
  rz: "number",
  motion: "string"
});

class State extends Schema {
  constructor() {
    super()
    this.players = new MapSchema()
  }

  createPlayer = (sessionId) => {
    this.players.set(sessionId, new Player().assign({
      x: 100 * Math.random() + 250,
      y: = -868.66,
      z:= 100 * Math.random() + 120,
      rx: = 0,
      ry:= 0,
      rz:= 0,
      motion: "idle"
    }))
  }

  removePlayer = (sessionId) => {
    this.players.delete(sessionId)
  }

  updatePlayer = (sessionId, data) => {
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

defineTypes(State, {
  players: { map: Player }
});

class GameRoom extends Room {
  constructor() {
    super()
    this.maxClients = 100
  }

  onCreate (options) {
    console.log("GameRoom created!", options)

    this.setState(new State())

    this.onMessage("update", (client, data) => {
      console.log(`GameRoom update player ${client.sessionId}:${data}`)
      this.state.updatePlayer(client.sessionId, data)
    })
  }

  onJoin (client) {
    this.state.createPlayer(client.sessionId)
    const player = this.state.players.getters[client.sessionId]
    const otherPlayers = this.state.players.values()
    console.log(player, otherPlayers)
    client.send("joinin", { player, otherPlayers })
    this.broadcast("joined", player, { except: client })
  }

  onLeave (client) {
    this.state.removePlayer(client.sessionId)
  }

  onDispose () {
    console.log("Dispose GameRoom")
  }

}

module.exports = {
  Player,
  State,
  GameRoom
}
