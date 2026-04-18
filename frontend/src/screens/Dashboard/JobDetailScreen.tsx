'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { FormTextField } from '@/components/inputs/FormTextField';
import { FormSkeleton } from '@/components/Skeleton/FormSkeleton';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  bookmarkJobRequest,
  deleteJobRequest,
  fetchBookmarkedJobIdsRequest,
  fetchJobRequest,
  toggleJobRequest,
  unbookmarkJobRequest,
} from '@/store/jobs/jobsAction';
import {
  applyToJobRequest,
  fetchJobApplicationsRequest,
  updateApplicationStatusRequest,
} from '@/store/applications/applicationsAction';
import { APPLICATION_STATUSES, type ApplicationStatus } from '@/constants/application';
import { selectAuthUser } from '@/store/auth/authSlice';
import { selectGlobalLoading } from '@/store/ui/uiSlice';
import { JOB_TYPE_LABELS } from '@/constants/job';

const applySchema = yup.object({
  expectedSalary: yup.number().min(0).required(),
  availability: yup.string().min(2).required(),
  note: yup.string().min(5).required(),
});

type ApplyForm = yup.InferType<typeof applySchema>;

function candidateId(ref: unknown): string {
  if (ref && typeof ref === 'object' && '_id' in ref) return String((ref as { _id: string })._id);
  return String(ref);
}

function candidateLabel(ref: unknown): string {
  if (ref && typeof ref === 'object' && 'name' in ref) {
    const r = ref as { name?: string; email?: string };
    return `${r.name ?? 'Candidate'} (${r.email ?? 'no email'})`;
  }
  return candidateId(ref);
}

export function JobDetailScreen() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const job = useAppSelector((s) => s.jobs.current);
  const bookmarkedJobIds = useAppSelector((s) => s.jobs.bookmarkedJobIds);
  const jobApps = useAppSelector((s) => s.applications.jobApplications);
  const appError = useAppSelector((s) => s.applications.error);
  const jobsError = useAppSelector((s) => s.jobs.error);
  const loading = useAppSelector(selectGlobalLoading);
  const [applyOpen, setApplyOpen] = useState(false);
  const jobId = params.id;

  const canManage = useMemo(() => {
    if (!user || !job) return false;
    if (user.role !== 'RECRUITER') return false;
    return String(job.recruiterId) === String(user.id);
  }, [job, user]);

  const isBookmarked = bookmarkedJobIds.includes(jobId);

  useEffect(() => {
    if (!jobId) return;
    dispatch(fetchJobRequest({ jobId }));
  }, [dispatch, jobId]);

  useEffect(() => {
    if (user?.role === 'CANDIDATE') {
      dispatch(fetchBookmarkedJobIdsRequest());
    }
  }, [dispatch, user?.role]);

  useEffect(() => {
    if (!jobId || !canManage) return;
    dispatch(fetchJobApplicationsRequest({ jobId }));
  }, [canManage, dispatch, jobId]);

  const { control, handleSubmit, reset } = useForm<ApplyForm>({
    resolver: yupResolver(applySchema),
    defaultValues: { expectedSalary: 0, availability: '', note: '' },
  });

  if (!jobId) return null;

  if (!job && loading) return <FormSkeleton fields={6} />;

  if (!job) {
    return (
      <Stack spacing={2}>
        {jobsError ? (
          <Alert severity="error">{jobsError}</Alert>
        ) : (
          <Typography>Job not found.</Typography>
        )}
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}
      >
        <Box>
          <Typography variant="h4">{job.title}</Typography>
          <Typography color="text.secondary">
            {JOB_TYPE_LABELS[job.jobType]} - {job.location}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {user?.role === 'CANDIDATE' && job.isActive ? (
            <Button variant="contained" onClick={() => setApplyOpen(true)}>
              Apply
            </Button>
          ) : null}
          {user?.role === 'CANDIDATE' ? (
            isBookmarked ? (
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => dispatch(unbookmarkJobRequest({ jobId }))}
              >
                Remove bookmark
              </Button>
            ) : (
              <Button variant="outlined" onClick={() => dispatch(bookmarkJobRequest({ jobId }))}>
                Save job
              </Button>
            )
          ) : null}
          {canManage ? (
            <>
              <Button component={Link} href={`/dashboard/jobs/${jobId}/edit`} variant="contained">
                Edit job
              </Button>
              {job.isActive ? (
                <Button
                  variant="outlined"
                  onClick={() => dispatch(toggleJobRequest({ jobId, mode: 'close' }))}
                >
                  Close job
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={() => dispatch(toggleJobRequest({ jobId, mode: 'reopen' }))}
                >
                  Reopen job
                </Button>
              )}
              <Button
                color="error"
                variant="outlined"
                onClick={() => {
                  dispatch(deleteJobRequest({ jobId }));
                  window.setTimeout(() => router.push('/dashboard/jobs'), 250);
                }}
              >
                Delete
              </Button>
            </>
          ) : null}
        </Stack>
      </Stack>

      {jobsError ? <Alert severity="error">{jobsError}</Alert> : null}
      {appError ? <Alert severity="warning">{appError}</Alert> : null}

      <Typography variant="body1" className="whitespace-pre-wrap">
        {job.description}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Salary: {job.salaryMin} - {job.salaryMax} - Deadline:{' '}
        {new Date(job.deadline).toLocaleString()}
      </Typography>
      <Typography variant="subtitle2">Skills</Typography>
      <Typography variant="body2">{job.skills.join(', ')}</Typography>

      {canManage ? (
        <Stack spacing={2}>
          <Typography variant="h6">Applications</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Candidate / history</TableCell>
                  <TableCell>Expected salary</TableCell>
                  <TableCell>Availability</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Update</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobApps.map((row) => (
                  <TableRow key={row._id}>
                    <TableCell>
                      <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
                        <Typography variant="body2">{candidateLabel(row.candidateId)}</Typography>
                        <Button
                          component={Link}
                          href={`/dashboard/candidates/${candidateId(row.candidateId)}`}
                          size="small"
                          variant="text"
                        >
                          View all applications
                        </Button>
                      </Stack>
                    </TableCell>
                    <TableCell>{row.expectedSalary}</TableCell>
                    <TableCell>{row.availability}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell align="right">
                      <TextField
                        select
                        size="small"
                        label="Status"
                        value={row.status}
                        onChange={(e) =>
                          dispatch(
                            updateApplicationStatusRequest({
                              applicationId: row._id,
                              status: e.target.value as ApplicationStatus,
                              jobId,
                            }),
                          )
                        }
                        sx={{ minWidth: 160 }}
                      >
                        {APPLICATION_STATUSES.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      ) : null}

      <Dialog open={applyOpen} onClose={() => setApplyOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Apply to {job.title}</DialogTitle>
        <form
          onSubmit={handleSubmit((values) => {
            dispatch(
              applyToJobRequest({
                jobId,
                body: {
                  expectedSalary: Number(values.expectedSalary),
                  availability: values.availability,
                  note: values.note,
                },
              }),
            );
            reset();
            setApplyOpen(false);
          })}
        >
          <DialogContent className="flex flex-col gap-2 pt-2">
            <FormTextField
              control={control}
              name="expectedSalary"
              label="Expected salary"
              type="number"
            />
            <FormTextField control={control} name="availability" label="Availability" />
            <FormTextField
              control={control}
              name="note"
              label="Note to recruiter"
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApplyOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Submit
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Stack>
  );
}
