'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { StatCard } from '@/components/Cards/StatCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/auth/authSlice';
import { fetchAdminOverviewRequest } from '@/store/admin/adminAction';
import { fetchRecruiterOverviewRequest } from '@/store/jobs/jobsAction';
import { selectGlobalLoading } from '@/store/ui/uiSlice';
import { CardSkeleton } from '@/components/Skeleton/CardSkeleton';

export function DashboardHome() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const loading = useAppSelector(selectGlobalLoading);
  const overview = useAppSelector((s) => s.admin.overview);
  const recruiterOverview = useAppSelector((s) => s.jobs.recruiterOverview);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      dispatch(fetchAdminOverviewRequest({}));
    }
    if (user?.role === 'RECRUITER') {
      dispatch(fetchRecruiterOverviewRequest());
    }
  }, [dispatch, user?.role]);

  if (!user) return <CardSkeleton />;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user.name}
        </Typography>
        <Typography color="text.secondary">Role: {user.role}</Typography>
      </Box>

      {user.role === 'ADMIN' ? (
        <Stack spacing={2}>
          {loading && !overview ? (
            <CardSkeleton lines={2} />
          ) : (
            <>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} useFlexGap>
                <Box className="min-w-0 flex-1">
                  <StatCard title="Users" value={overview?.usersCount ?? 0} />
                </Box>
                <Box className="min-w-0 flex-1">
                  <StatCard title="Candidates" value={overview?.candidatesCount ?? 0} />
                </Box>
                <Box className="min-w-0 flex-1">
                  <StatCard title="Recruiters" value={overview?.recruitersCount ?? 0} />
                </Box>
                <Box className="min-w-0 flex-1">
                  <StatCard title="Suspended users" value={overview?.suspendedUsersCount ?? 0} />
                </Box>
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} useFlexGap>
                <Box className="min-w-0 flex-1">
                  <StatCard title="Jobs" value={overview?.jobsCount ?? 0} />
                </Box>
                <Box className="min-w-0 flex-1">
                  <StatCard title="Active jobs" value={overview?.activeJobsCount ?? 0} />
                </Box>
                <Box className="min-w-0 flex-1">
                  <StatCard title="Applications" value={overview?.applicationsCount ?? 0} />
                </Box>
              </Stack>
              <Button component={Link} href="/dashboard/admin" variant="contained">
                Open admin console
              </Button>
            </>
          )}
        </Stack>
      ) : null}

      {user.role === 'RECRUITER' ? (
        <Stack spacing={2}>
          <Typography variant="h6">Recruiter workspace</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} useFlexGap>
            <Box className="min-w-0 flex-1">
              <StatCard
                title="Active jobs"
                value={recruiterOverview?.activeJobsCount ?? 0}
                subtitle="Listings you currently have open"
              />
            </Box>
            <Box className="min-w-0 flex-1">
              <StatCard
                title="Applicants"
                value={recruiterOverview?.totalApplicants ?? 0}
                subtitle="Across all of your jobs"
              />
            </Box>
          </Stack>
          <Paper variant="outlined" className="p-4">
            <Typography variant="subtitle1">Recent activity</Typography>
            <Stack spacing={1.5} className="mt-3">
              {(recruiterOverview?.recentActivity ?? []).length > 0 ? (
                recruiterOverview?.recentActivity.map((item) => (
                  <Box key={item.id}>
                    <Typography variant="body2">{item.message}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(item.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary" variant="body2">
                  No recruiter activity yet.
                </Typography>
              )}
            </Stack>
          </Paper>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button component={Link} href="/dashboard/jobs" variant="contained">
              Manage jobs
            </Button>
            <Button component={Link} href="/dashboard/jobs/new" variant="outlined">
              Post a job
            </Button>
          </Stack>
        </Stack>
      ) : null}

      {user.role === 'CANDIDATE' ? (
        <Stack spacing={2}>
          <Typography variant="h6">Candidate workspace</Typography>
          <Typography color="text.secondary">
            Browse open roles, save interesting jobs, and track your applications.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button component={Link} href="/dashboard/jobs" variant="contained">
              Browse jobs
            </Button>
            <Button component={Link} href="/dashboard/saved-jobs" variant="outlined">
              Saved jobs
            </Button>
            <Button component={Link} href="/dashboard/my-applications" variant="outlined">
              My applications
            </Button>
          </Stack>
        </Stack>
      ) : null}
    </Stack>
  );
}
