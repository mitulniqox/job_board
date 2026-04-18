'use client';

import { io, type Socket } from 'socket.io-client';

let socketRef: Socket | null = null;

const getSocketUrl = (): string => {
  const explicitUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.replace(/\/$/, '');
  if (explicitUrl) {
    return explicitUrl;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ??
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '');
  if (baseUrl) {
    return baseUrl;
  }

  return typeof window !== 'undefined' ? window.location.origin : '';
};

export const connectSocket = (token: string): Socket => {
  if (socketRef?.connected) {
    return socketRef;
  }

  if (socketRef) {
    socketRef.disconnect();
  }

  socketRef = io(getSocketUrl(), {
    transports: ['websocket'],
    auth: {
      token: `Bearer ${token}`,
    },
  });

  return socketRef;
};

export const getSocket = (): Socket | null => socketRef;

export const disconnectSocket = (): void => {
  if (!socketRef) {
    return;
  }

  socketRef.removeAllListeners();
  socketRef.disconnect();
  socketRef = null;
};
