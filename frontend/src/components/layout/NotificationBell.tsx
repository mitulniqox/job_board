'use client';

import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  Typography,
} from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchNotificationsRequest,
  markAllNotificationsReadRequest,
  markNotificationReadRequest,
} from '@/store/notification/notificationAction';

export function NotificationBell() {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector((state) => state.notifications);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <>
      <IconButton
        color="inherit"
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
          dispatch(fetchNotificationsRequest({ page: 1, limit: 10 }));
        }}
        aria-label="notifications"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsOutlinedIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { width: 360, maxWidth: 'calc(100vw - 32px)' } } }}
      >
        <Box className="flex items-center justify-between px-4 py-2">
          <Typography variant="subtitle1">Notifications</Typography>
          <Button
            size="small"
            onClick={() => dispatch(markAllNotificationsReadRequest())}
            disabled={unreadCount === 0}
          >
            Mark all read
          </Button>
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <Box className="px-4 py-6 text-center text-sm text-slate-500">No notifications yet.</Box>
        ) : (
          <List dense disablePadding>
            {notifications.map((notification) => (
              <ListItemButton
                key={notification._id}
                onClick={() => {
                  if (!notification.isRead) {
                    dispatch(markNotificationReadRequest({ notificationId: notification._id }));
                  }
                }}
                className="items-start"
              >
                <ListItemText
                  primary={
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ fontWeight: notification.isRead ? 400 : 700 }}
                    >
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <Box component="span">
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        className="block"
                      >
                        {notification.message}
                      </Typography>
                      <Typography component="span" variant="caption" color="text.disabled">
                        {new Date(notification.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
}
