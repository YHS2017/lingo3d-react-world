const Room = require('./room');

function Game () {
  this.rooms = [];
  this.roomCountMax = 30;

  this.createRoom = function () {
    let roomCount = this.rooms.length;
    if (roomCount < this.roomCountMax) {
      let room = new Room(roomCount);
      this.rooms.push(room);
      return room
    }
    return null
  }

  // 删除房间
  this.removeRoom = function (roomId) {
    this.rooms = this.rooms.filter(room => room.id !== roomId);
  }

  // 获取房间
  this.getRoom = function (roomId) {
    return this.rooms.find(room => room.id === roomId);
  }

  // 删除玩家，并删除空房间
  this.removePlayer = function (player) {
    let room = this.getRoom(player.roomId);
    room.removePlayer(player.id);
    if (room.players.length === 0) {
      this.removeRoom(room.id);
    }
  }

  // 根据玩家ID获取玩家信息
  this.getPlayer = function (playerId) {
    let room = this.rooms.find(room => room.players.find(p => p.id === playerId));
    if (room) {
      return room.players.find(p => p.id === playerId)
    }
    return null
  }

  // 更新玩家信息
  this.updatePlayer = function (player) {
    let room = this.rooms.find(room => room.players.find(p => p.id === player.id));
    let prv_player = null;
    if (room) {
      prv_player = room.updatePlayer(player);
    }
    return prv_player
  }

  // 添加玩家到未满员的房间，若没有，则创建新的房间并加入
  this.addPlayer = function (playerId) {
    let room = this.rooms.find(room => room.players.length < room.size);
    let player = null;
    if (room) {
      player = room.createPlayer(playerId);
    } else {
      room = this.createRoom();
      player = room.createPlayer(playerId);
    }
    return player
  }
}

module.exports = Game;