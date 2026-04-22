'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { DASHBOARD_NAV } from '@/components/layout/dashboardNav';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutRequest } from '@/store/auth/authAction';
import { selectAuthUser } from '@/store/auth/authSlice';
import { NotificationBell } from '@/components/layout/NotificationBell';

const drawerWidth = 260;

export function AppShell({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const items = useMemo(() => {
    const role = user?.role;
    if (!role) return [];
    return DASHBOARD_NAV.filter((i) => i.roles.includes(role));
  }, [user?.role]);

  const drawer = (
    <Box className="flex h-full flex-col">
      <Toolbar className="gap-2">
        <Typography variant="h6" noWrap>
          IBL Finance
        </Typography>
      </Toolbar>
      <Divider />
      <List className="flex-1">
        {items.map((item) => {
          const selected = pathname === item.href;
          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={selected}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box className="flex min-h-screen">
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar className="gap-2">
          {!isMdUp ? (
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
          ) : null}
          <Typography variant="h6" noWrap className="flex-1">
            {user?.name ?? 'Dashboard'}
          </Typography>
          <NotificationBell />
          {/* <IconButton color="inherit" onClick={toggleMode} aria-label="toggle theme">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>  */}
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 32, height: 32 }}>{user?.name?.[0]?.toUpperCase() ?? 'U'}</Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              <Typography variant="body2">{user?.email}</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                dispatch(logoutRequest());
                router.replace('/login');
              }}
            >
              <LogoutIcon fontSize="small" className="mr-2" />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        className="flex-1"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
