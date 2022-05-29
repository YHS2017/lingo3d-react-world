const Player = require('./player');

function Room (roomId) {
  this.id = roomId;
  this.size = 30;
  this.players = [];

  this.createPlayer = function (playerId) {
    if (this.players.length < this.size) {
      let player = new Player(this.id, playerId);
      this.players.push(player);
      return player
    }
    return null
  }

  this.removePlayer = function (playerId) {
    this.players = this.players.filter(player => player.id !== playerId);
  }

  this.updatePlayer = function (player) {
    this.players = this.players.map(p => {
      if (p.id === player.id) {
        return { ...p, ...player };
      }
      return p;
    });
    return this.players.find(p => p.id === player.id);
  }
}

module.exports = Room;