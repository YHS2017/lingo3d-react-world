const { Room, Client, updateLobby } = require("colyseus")
const { Schema, MapSchema, defineTypes } = require("@colyseus/schema")

class Player extends Schema {
}

defineTypes(Player, {
  id: "string",
  uname: "string",
  x: "number",
  y: "number",
  z: "number",
  rotationX: "number",
  rotationY: "number",
  rotationZ: "number",
  innerRotationX: "number",
  innerRotationY: "number",
  innerRotationZ: "number",
  animation: "string"
});

class State extends Schema {
  constructor() {
    super()
    this.players = new MapSchema()
  }

  createPlayer = (sessionId, options) => {
    console.log(`GameRoom client joined: ${sessionId}`)
    this.players.set(sessionId, new Player().assign({
      id: sessionId,
      uname: options.uname,
      x: 0,
      y: -950,
      z: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      innerRotationX: 0,
      innerRotationY: 0,
      innerRotationZ: 0,
      animation: 'idle'
    }))
  }

  removePlayer = (sessionId) => {
    console.log(`GameRoom client left: ${sessionId}`)
    this.players.delete(sessionId)
  }

  updatePlayer = (sessionId, data) => {
    console.log(`GameRoom update player ${sessionId}:${JSON.stringify(data)}`)
    const player = this.players.get(sessionId)
    player.assign(data)
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
      this.state.updatePlayer(client.sessionId, data)
    })
  }

  onJoin (client, options) {
    this.state.createPlayer(client.sessionId, options)
    updateLobby(this)
  }

  onLeave (client) {
    this.state.removePlayer(client.sessionId)
  }

  onDispose () {
    console.log("GameRoom destroyed!")
  }

}

module.exports = {
  Player,
  State,
  GameRoom
}
