const { GameRoom } = require("./room")
const { Server, LobbyRoom } = require("colyseus")
const { createServer } = require("http")
const express = require("express")
const { WebSocketTransport } = require("@colyseus/ws-transport")
const port = Number(process.env.port) || 5000

const app = express()
app.use(express.json())

const gameServer = new Server({
  transport: new WebSocketTransport({
    server: createServer(app)
  })
});

gameServer.define("lobby", LobbyRoom);
gameServer.define("gameroom", GameRoom).enableRealtimeListing();

gameServer.listen(port, undefined, undefined, () => {
  console.log(`Listening on ws://localhost:${port}`)
})
