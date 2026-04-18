'use client';

import type { ReactNode } from 'react';
import { Alert, Box } from '@mui/material';
import type { UserRole } from '@/constants/roles';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/auth/authSlice';

type Props = {
  allow: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function RoleGuard({ allow, children, fallback }: Props) {
  const user = useAppSelector(selectAuthUser);
  const role = user?.role;

  if (!role || !allow.includes(role)) {
    if (fallback) return fallback;
    return (
      <Box className="p-4">
        <Alert severity="warning">You do not have access to this page.</Alert>
      </Box>
    );
  }

  return children;
}
