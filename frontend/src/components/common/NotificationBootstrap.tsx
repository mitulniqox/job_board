'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAuth } from '@/store/auth/authSlice';
import { connectSocket, disconnectSocket } from '@/utils/socket';
import { fetchNotificationsRequest } from '@/store/notification/notificationAction';
import { prependNotification, setSocketConnected } from '@/store/notification/notificationSlice';
import type { AppNotification } from '@/types/notification';

export function NotificationBootstrap() {
  const dispatch = useAppDispatch();
  const { accessToken, user } = useAppSelector(selectAuth);

  useEffect(() => {
    if (!accessToken || !user?.id) {
      dispatch(setSocketConnected(false));
      disconnectSocket();
      return;
    }

    dispatch(fetchNotificationsRequest({ page: 1, limit: 10 }));

    const socket = connectSocket(accessToken);
    socket.on('connect', () => {
      dispatch(setSocketConnected(true));
      socket.emit('join', user.id);
    });
    socket.on('disconnect', () => {
      dispatch(setSocketConnected(false));
    });
    socket.on('notification', (payload: AppNotification) => {
      dispatch(prependNotification(payload));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('notification');
      disconnectSocket();
    };
  }, [accessToken, dispatch, user?.id]);

  return null;
}
