import { io, type Socket } from 'socket.io-client';

const getSocketUrl = (): string => {
  const envUrl =
    import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://tenantpro-c06g.onrender.com';
  }
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

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
