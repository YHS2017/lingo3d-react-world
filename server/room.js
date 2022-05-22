const { Room, Client } = require("colyseus")
const { Schema, MapSchema, defineTypes } = require("@colyseus/schema")

class Player extends Schema {
}

defineTypes(Player, {
  id: "string",
  uname: "string",
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

  createPlayer = (sessionId, options) => {
    this.players.set(sessionId, new Player().assign({
      id: sessionId,
      uname: options.uname,
      x: 100 * Math.random() + 250,
      y: -868.66,
      z: 100 * Math.random() + 120,
      rx: 0,
      ry: 0,
      rz: 0,
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
      console.log(`GameRoom update player ${client.sessionId}:${JSON.stringify(data)}`)
      this.state.updatePlayer(client.sessionId, data)
    })
  }

  onJoin (client, options) {
    this.state.createPlayer(client.sessionId, options)
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
