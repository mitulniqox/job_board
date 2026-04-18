'use client';

import { useEffect } from 'react';
import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyApplicationsRequest } from '@/store/applications/applicationsAction';
import { selectGlobalLoading } from '@/store/ui/uiSlice';
import { TableSkeletonCard } from '@/components/Skeleton/TableSkeleton';

function jobTitle(ref: unknown): string {
  if (ref && typeof ref === 'object' && 'title' in ref)
    return String((ref as { title?: string }).title ?? '');
  return String(ref);
}

export function MyApplicationsScreen() {
  const dispatch = useAppDispatch();
  const rows = useAppSelector((s) => s.applications.mine);
  const error = useAppSelector((s) => s.applications.error);
  const loading = useAppSelector(selectGlobalLoading);

  useEffect(() => {
    dispatch(fetchMyApplicationsRequest());
  }, [dispatch]);

  return (
    <Stack spacing={2}>
      <Typography variant="h4">My applications</Typography>
      {error ? (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      ) : null}
      {loading && rows.length === 0 ? (
        <TableSkeletonCard columns={4} />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Job</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Expected salary</TableCell>
                <TableCell>Availability</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row._id}>
                  <TableCell>{jobTitle(row.jobId)}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.expectedSalary}</TableCell>
                  <TableCell>{row.availability}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
