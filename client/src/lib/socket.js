/**
 * socket.js — singleton Socket.io client instance
 */
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://neontalk-backend-lcpk.onrender.com";
export const socket = io(BACKEND_URL, {
  transports: ["websocket"]
});
