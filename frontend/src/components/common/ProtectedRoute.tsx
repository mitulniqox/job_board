'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectIsAuthResolved } from '@/store/auth/authSlice';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAuthResolved = useAppSelector(selectIsAuthResolved);

  useEffect(() => {
    if (isAuthResolved && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname || '/dashboard')}`);
    }
  }, [isAuthResolved, isAuthenticated, pathname, router]);

  if (!isAuthResolved || !isAuthenticated) {
    return (
      <Box className="flex min-h-[40vh] items-center justify-center p-4">
        <CircularProgress />
      </Box>
    );
  }

  return children;
}
