import * as Colyseus from "colyseus.js"

const client = new Colyseus.Client("ws://localhost:5000")

export default client