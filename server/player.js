function Player (roomId, playerId) {
  this.roomId = roomId;
  this.id = playerId;
  this.x = 100 * Math.random() + 250;
  this.y = -409.16;
  this.z = 100 * Math.random() + 120;
  this.rx = 0;
  this.ry = 0;
  this.rz = 0;
  this.motion = 'idle';
}

module.exports = Player;