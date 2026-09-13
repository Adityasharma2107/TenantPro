import { io, type Socket } from 'socket.io-client';

const rawBase = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
const SOCKET_URL = rawBase.replace(/\/+$/, '').replace(/\/api$/, '');

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const connectSocket = (): Socket => {
  const instance = getSocket();
  if (!instance.connected) {
    instance.connect();
  }
  return instance;
};

export const disconnectSocket = (): void => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};
