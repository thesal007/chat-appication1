import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:4000', {
    transports: ['websocket'], // Use WebSocket transport
});

export default socket;
