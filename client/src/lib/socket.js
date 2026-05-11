/**
 * socket.js — singleton Socket.io client instance
 */
import { io } from 'socket.io-client';

export const socket = io("https://neontalk-backend-lcpk.onrender.com", {
  transports: ["websocket"]
});
