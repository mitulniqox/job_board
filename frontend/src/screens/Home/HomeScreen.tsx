'use client';

import Link from 'next/link';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/auth/authSlice';

export function HomeScreen() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return (
    <Container maxWidth="md" className="py-16">
      <Stack spacing={3}>
        <Typography variant="h3" component="h1">
          IBL Finance hiring portal
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage roles, jobs, and applications against your existing backend APIs. Sign in to access
          the dashboard experience tailored to administrators, recruiters, and candidates.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {isAuthenticated ? (
            <Button component={Link} href="/dashboard" variant="contained" size="large">
              Go to dashboard
            </Button>
          ) : (
            <>
              <Button component={Link} href="/login" variant="contained" size="large">
                Login
              </Button>
              <Button component={Link} href="/register" variant="outlined" size="large">
                Create account
              </Button>
            </>
          )}
        </Stack>
        <Box className="pt-8">
          <Typography variant="caption" color="text.secondary">
            Configure <code>NEXT_PUBLIC_BASE_URL</code> to point at your backend (for example
            http://localhost:4000).
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
}
