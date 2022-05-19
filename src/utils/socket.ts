import { io } from 'socket.io-client';

// const socket = io('ws://192.168.31.251:5000/');
// const socket = io('ws://172.16.16.125:5000/');
const socket = io('ws://localhost:5000/');

export default socket;