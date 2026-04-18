'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
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
import { fetchCandidateApplicationsRequest } from '@/store/applications/applicationsAction';
import { selectGlobalLoading } from '@/store/ui/uiSlice';
import { TableSkeletonCard } from '@/components/Skeleton/TableSkeleton';

function jobTitle(ref: unknown): string {
  if (ref && typeof ref === 'object' && 'title' in ref)
    return String((ref as { title?: string }).title ?? '');
  return String(ref);
}

export function CandidateApplicationsScreen() {
  const params = useParams<{ candidateId: string }>();
  const dispatch = useAppDispatch();
  const rows = useAppSelector((s) => s.applications.candidateApplications);
  const error = useAppSelector((s) => s.applications.error);
  const loading = useAppSelector(selectGlobalLoading);

  const candidateId = params.candidateId;

  useEffect(() => {
    if (!candidateId) return;
    dispatch(fetchCandidateApplicationsRequest({ candidateId }));
  }, [candidateId, dispatch]);

  if (!candidateId) return null;

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Candidate applications</Typography>
      <Typography color="text.secondary">Candidate id: {candidateId}</Typography>
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
                <TableCell>Note</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row._id}>
                  <TableCell>{jobTitle(row.jobId)}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.expectedSalary}</TableCell>
                  <TableCell>{row.note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
