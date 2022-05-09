const express = require('express');
const http = require('http');
const io = require('socket.io');
const Game = require('./src/game');

const app = express();

const server = http.createServer(app);

const socket = io(server, {
  cors: {
    origin: '*'
  }
});

const game = new Game();

socket.on('connect', (client) => {
  console.log(`Client connected:${client.id}`);
  const player = game.addPlayer(client.id);
  client.join(player.roomId);
  socket.to(client.id).emit('added', player);
  const room = game.getRoom(player.roomId);
  socket.to(player.roomId).emit('joined', room.players);

  client.on('disconnect', () => {
    console.log(`Client disconnected:${client.id}`);
    const player = { ...game.getPlayer(client.id) };
    game.removePlayer(player);
    const room = game.getRoom(player.roomId);
    if (room) {
      socket.to(room.id).emit('leaved', client.id);
    }
  });

  client.on('update', (prv_player) => {
    socket.to(prv_player.roomId).emit('update', prv_player);
  });
});

server.listen(5000, () => {
  console.log('Server started on port 5000');
});