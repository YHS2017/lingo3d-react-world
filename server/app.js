const express = require('express');
const http = require('http');
const io = require('socket.io');
const Game = require('./game');

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
  const room = game.getRoom(player.roomId);
  socket.to(client.id).emit('connected', { player, players: room.players.filter(p => p.id !== player.id) });

  client.on('join', (joinplayer) => {
    console.log(`Client joined:${client.id}`);
    client.join(joinplayer.roomId);
    socket.to(joinplayer.roomId).emit('joined', joinplayer);
  })

  client.on('disconnect', () => {
    console.log(`Client disconnected:${client.id}`);
    const player = { ...game.getPlayer(client.id) };
    game.removePlayer(player);
    const room = game.getRoom(player.roomId);
    if (room) {
      socket.to(room.id).emit('leaved', client.id);
    }
  });

  client.on('update', (update_player) => {
    socket.to(update_player.roomId).emit('update', update_player);
  });
});

server.listen(5000, () => {
  console.log('Server started on port 5000');
});