'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { DataTable, type DataTableColumn } from '@/components/Table/DataTable';
import { TableSkeletonCard } from '@/components/Skeleton/TableSkeleton';
import { StatCard } from '@/components/Cards/StatCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAdminApplicationsRequest,
  fetchAdminJobsRequest,
  fetchAdminOverviewRequest,
} from '@/store/admin/adminAction';
import { setAdminApplicationFilters, setAdminJobFilters } from '@/store/admin/adminSlice';
import type { JobListItem } from '@/types/job';
import type { Application } from '@/types/application';
import { JOB_TYPES, JOB_TYPE_LABELS } from '@/constants/job';
import { APPLICATION_STATUSES } from '@/constants/application';
import { selectGlobalLoading } from '@/store/ui/uiSlice';

function candidateLabel(ref: unknown): string {
  if (ref && typeof ref === 'object' && 'name' in ref) {
    const r = ref as { name?: string; email?: string };
    return `${r.name ?? 'Candidate'} (${r.email ?? 'no email'})`;
  }
  return String(ref);
}

function jobTitle(ref: unknown): string {
  if (ref && typeof ref === 'object' && 'title' in ref)
    return String((ref as { title?: string }).title ?? '');
  return String(ref);
}

function maxTrendCount(items: Array<{ count: number }>) {
  return Math.max(...items.map((item) => item.count), 1);
}

export function AdminConsoleScreen() {
  const dispatch = useAppDispatch();
  const admin = useAppSelector((s) => s.admin);
  const loading = useAppSelector(selectGlobalLoading);
  const [tab, setTab] = useState(0);
  const overview = admin.overview;

  const [jobSearch, setJobSearch] = useState(admin.jobs.filters.search);
  const debouncedJobSearch = useDebouncedValue(jobSearch, 400);

  useEffect(() => {
    dispatch(fetchAdminOverviewRequest({}));
  }, [dispatch]);

  useEffect(() => {
    if (tab !== 1) return;
    dispatch(setAdminJobFilters({ search: debouncedJobSearch }));
    dispatch(fetchAdminJobsRequest({ page: 1 }));
  }, [debouncedJobSearch, dispatch, tab]);

  useEffect(() => {
    if (tab !== 2) return;
    dispatch(fetchAdminApplicationsRequest({ page: 1 }));
  }, [dispatch, tab]);

  const jobColumns: Array<DataTableColumn<JobListItem>> = [
    { id: 'title', label: 'Title', render: (row) => row.title },
    { id: 'jobType', label: 'Type', render: (row) => JOB_TYPE_LABELS[row.jobType] },
    { id: 'location', label: 'Location', render: (row) => row.location },
    {
      id: 'isActive',
      label: 'Active',
      render: (row) => (row.isActive ? 'Yes' : 'No'),
    },
  ];

  const appColumns: Array<DataTableColumn<Application>> = [
    { id: 'job', label: 'Job', render: (row) => jobTitle(row.jobId) },
    { id: 'candidate', label: 'Candidate', render: (row) => candidateLabel(row.candidateId) },
    { id: 'status', label: 'Status', render: (row) => row.status },
    { id: 'expectedSalary', label: 'Expected salary', render: (row) => row.expectedSalary },
  ];

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Admin console</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Overview" />
        <Tab label="Jobs" />
        <Tab label="Applications" />
      </Tabs>

      {tab === 0 ? (
        <Stack spacing={2}>
          {overview ? (
            <>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} useFlexGap>
                <Box className="min-w-0 flex-1">
                  <StatCard title="Users" value={overview.usersCount} />
                </Box>
                <Box className="min-w-0 flex-1">
                  <StatCard title="Candidates" value={overview.candidatesCount} />
                </Box>
                <Box className="min-w-0 flex-1">
                  <StatCard title="Recruiters" value={overview.recruitersCount} />
                </Box>
                <Box className="min-w-0 flex-1">
                  <StatCard title="Suspended users" value={overview.suspendedUsersCount} />
                </Box>
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} useFlexGap>
                <Box className="min-w-0 flex-1">
                  <StatCard title="Jobs" value={overview.jobsCount} />
                </Box>
                <Box className="min-w-0 flex-1">
                  <StatCard title="Active jobs" value={overview.activeJobsCount} />
                </Box>
                <Box className="min-w-0 flex-1">
                  <StatCard title="Applications" value={overview.applicationsCount} />
                </Box>
              </Stack>
              <Stack direction={{ xs: 'column', xl: 'row' }} spacing={2}>
                <Paper variant="outlined" className="min-w-0 flex-1 p-4">
                  <Typography variant="h6">Top recruiters</Typography>
                  <TableContainer className="mt-3">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Recruiter</TableCell>
                          <TableCell align="right">Jobs</TableCell>
                          <TableCell align="right">Active</TableCell>
                          <TableCell align="right">Applicants</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {overview.topRecruiters.length > 0 ? (
                          overview.topRecruiters.map((recruiter) => (
                            <TableRow key={recruiter.recruiterId}>
                              <TableCell>
                                <Stack spacing={0.25}>
                                  <Typography variant="body2">{recruiter.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {recruiter.email}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell align="right">{recruiter.jobsCount}</TableCell>
                              <TableCell align="right">{recruiter.activeJobsCount}</TableCell>
                              <TableCell align="right">{recruiter.applicationsCount}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4}>No recruiter activity yet.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
                <Paper variant="outlined" className="min-w-0 flex-1 p-4">
                  <Typography variant="h6">Trend snapshot</Typography>
                  <Stack spacing={2} className="mt-3">
                    <Box>
                      <Typography variant="subtitle2">Job posts</Typography>
                      <Stack spacing={1} className="mt-2">
                        {overview.jobTrend.map((item) => (
                          <Box key={item.date}>
                            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                              <Typography variant="caption">{item.label}</Typography>
                              <Typography variant="caption">{item.count}</Typography>
                            </Stack>
                            <Box
                              sx={{
                                mt: 0.5,
                                height: 8,
                                borderRadius: 999,
                                bgcolor: 'grey.200',
                                overflow: 'hidden',
                              }}
                            >
                              <Box
                                sx={{
                                  height: '100%',
                                  width: `${(item.count / maxTrendCount(overview.jobTrend)) * 100}%`,
                                  bgcolor: 'primary.main',
                                }}
                              />
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">Applications</Typography>
                      <Stack spacing={1} className="mt-2">
                        {overview.applicationTrend.map((item) => (
                          <Box key={item.date}>
                            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                              <Typography variant="caption">{item.label}</Typography>
                              <Typography variant="caption">{item.count}</Typography>
                            </Stack>
                            <Box
                              sx={{
                                mt: 0.5,
                                height: 8,
                                borderRadius: 999,
                                bgcolor: 'grey.200',
                                overflow: 'hidden',
                              }}
                            >
                              <Box
                                sx={{
                                  height: '100%',
                                  width: `${(item.count / maxTrendCount(overview.applicationTrend)) * 100}%`,
                                  bgcolor: 'success.main',
                                }}
                              />
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              </Stack>
            </>
          ) : (
            <Typography color="text.secondary">Loading overview...</Typography>
          )}
        </Stack>
      ) : null}

      {tab === 1 ? (
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Search"
              value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
              fullWidth
            />
            <TextField
              select
              label="Job type"
              value={admin.jobs.filters.jobType}
              onChange={(e) => {
                const jobType = e.target.value as typeof admin.jobs.filters.jobType;
                dispatch(setAdminJobFilters({ jobType }));
                dispatch(fetchAdminJobsRequest({ page: 1 }));
              }}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Any</MenuItem>
              {JOB_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {JOB_TYPE_LABELS[t]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Active"
              value={admin.jobs.filters.isActive}
              onChange={(e) => {
                const isActive = e.target.value as typeof admin.jobs.filters.isActive;
                dispatch(setAdminJobFilters({ isActive }));
                dispatch(fetchAdminJobsRequest({ page: 1 }));
              }}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </TextField>
          </Stack>
          {loading && admin.jobs.items.length === 0 ? (
            <TableSkeletonCard />
          ) : (
            <DataTable<JobListItem>
              rows={admin.jobs.items}
              columns={jobColumns}
              rowKey={(row) => row._id}
              page={admin.jobs.page}
              rowsPerPage={admin.jobs.limit}
              total={admin.jobs.total}
              onPageChange={(p) => dispatch(fetchAdminJobsRequest({ page: p }))}
              onRowsPerPageChange={(l) => dispatch(fetchAdminJobsRequest({ page: 1, limit: l }))}
              sortBy={admin.jobs.filters.sortBy}
              sortOrder={admin.jobs.filters.sortOrder}
              onSortChange={(field) => {
                const nextOrder =
                  admin.jobs.filters.sortBy === field && admin.jobs.filters.sortOrder === 'desc'
                    ? 'asc'
                    : 'desc';
                dispatch(setAdminJobFilters({ sortBy: field, sortOrder: nextOrder }));
                dispatch(fetchAdminJobsRequest({ page: 1 }));
              }}
            />
          )}
        </Stack>
      ) : null}

      {tab === 2 ? (
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              select
              label="Status"
              value={admin.applications.filters.status}
              onChange={(e) => {
                const status = e.target.value as typeof admin.applications.filters.status;
                dispatch(setAdminApplicationFilters({ status }));
                dispatch(fetchAdminApplicationsRequest({ page: 1 }));
              }}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Any</MenuItem>
              {APPLICATION_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Job id"
              value={admin.applications.filters.jobId}
              onChange={(e) => dispatch(setAdminApplicationFilters({ jobId: e.target.value }))}
              onBlur={() => dispatch(fetchAdminApplicationsRequest({ page: 1 }))}
            />
            <TextField
              label="Candidate id"
              value={admin.applications.filters.candidateId}
              onChange={(e) =>
                dispatch(setAdminApplicationFilters({ candidateId: e.target.value }))
              }
              onBlur={() => dispatch(fetchAdminApplicationsRequest({ page: 1 }))}
            />
          </Stack>
          {loading && admin.applications.items.length === 0 ? (
            <TableSkeletonCard />
          ) : (
            <DataTable<Application>
              rows={admin.applications.items}
              columns={appColumns}
              rowKey={(row) => row._id}
              page={admin.applications.page}
              rowsPerPage={admin.applications.limit}
              total={admin.applications.total}
              onPageChange={(p) => dispatch(fetchAdminApplicationsRequest({ page: p }))}
              onRowsPerPageChange={(l) =>
                dispatch(fetchAdminApplicationsRequest({ page: 1, limit: l }))
              }
              sortBy={admin.applications.filters.sortBy}
              sortOrder={admin.applications.filters.sortOrder}
              onSortChange={(field) => {
                const nextOrder =
                  admin.applications.filters.sortBy === field &&
                  admin.applications.filters.sortOrder === 'desc'
                    ? 'asc'
                    : 'desc';
                dispatch(setAdminApplicationFilters({ sortBy: field, sortOrder: nextOrder }));
                dispatch(fetchAdminApplicationsRequest({ page: 1 }));
              }}
            />
          )}
        </Stack>
      ) : null}
    </Stack>
  );
}
