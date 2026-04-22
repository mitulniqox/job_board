'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, MenuItem, Paper, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { Chart } from 'react-google-charts';
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

type OverviewRangePreset = 'today' | 'thisWeek' | 'thisMonth' | 'custom';

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function startOfWeek(date: Date) {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
}

function startOfMonth(date: Date) {
  const next = new Date(date);
  next.setDate(1);
  next.setHours(0, 0, 0, 0);
  return next;
}

function parseDateInput(value: string, mode: 'start' | 'end') {
  const parsed = new Date(`${value}T00:00:00`);
  return mode === 'start' ? startOfDay(parsed) : endOfDay(parsed);
}

function buildOverviewRange(
  preset: OverviewRangePreset,
  customFrom: string,
  customTo: string,
): { from?: string; to?: string } {
  const now = new Date();

  if (preset === 'today') {
    return { from: startOfDay(now).toISOString(), to: endOfDay(now).toISOString() };
  }

  if (preset === 'thisWeek') {
    return { from: startOfWeek(now).toISOString(), to: endOfDay(now).toISOString() };
  }

  if (preset === 'thisMonth') {
    return { from: startOfMonth(now).toISOString(), to: endOfDay(now).toISOString() };
  }

  return {
    from: customFrom ? parseDateInput(customFrom, 'start').toISOString() : undefined,
    to: customTo ? parseDateInput(customTo, 'end').toISOString() : undefined,
  };
}

export function AdminConsoleScreen() {
  const dispatch = useAppDispatch();
  const admin = useAppSelector((s) => s.admin);
  const loading = useAppSelector(selectGlobalLoading);
  const [tab, setTab] = useState(0);
  const overview = admin.overview;
  const [overviewPreset, setOverviewPreset] = useState<OverviewRangePreset>('thisMonth');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const [jobSearch, setJobSearch] = useState(admin.jobs.filters.search);
  const debouncedJobSearch = useDebouncedValue(jobSearch, 400);
  const topRecruitersChartData = useMemo(() => {
    if (!overview?.topRecruiters?.length) {
      return [];
    }

    return [
      ['Recruiter', 'Applicants', { role: 'tooltip', type: 'string' }],
      ...overview.topRecruiters.map((recruiter) => [
        recruiter.name,
        recruiter.applicationsCount,
        `${recruiter.name}\nApplicants: ${recruiter.applicationsCount}\nJobs: ${recruiter.jobsCount}\nActive jobs: ${recruiter.activeJobsCount}`,
      ]),
    ];
  }, [overview?.topRecruiters]);

  const topRecruitersChartOptions = useMemo(
    () => ({
      legend: { position: 'none' },
      backgroundColor: 'transparent',
      colors: ['#d97706'],
      chartArea: { left: 120, right: 24, top: 24, bottom: 32, width: '72%', height: '70%' },
      hAxis: {
        title: 'Applicants',
        minValue: 0,
        textStyle: { color: '#475569', fontSize: 12 },
        titleTextStyle: { color: '#334155', italic: false },
        gridlines: { color: '#e2e8f0' },
      },
      vAxis: {
        textStyle: { color: '#0f172a', fontSize: 12 },
      },
      tooltip: { isHtml: false },
      bar: { groupWidth: '58%' },
    }),
    [],
  );

  useEffect(() => {
    dispatch(fetchAdminOverviewRequest(buildOverviewRange(overviewPreset, customFrom, customTo)));
  }, [customFrom, customTo, dispatch, overviewPreset]);

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
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              select
              label="Time period"
              value={overviewPreset}
              onChange={(e) => setOverviewPreset(e.target.value as OverviewRangePreset)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="thisWeek">This Week</MenuItem>
              <MenuItem value="thisMonth">This Month</MenuItem>
              <MenuItem value="custom">Custom Date Range</MenuItem>
            </TextField>
            {overviewPreset === 'custom' ? (
              <>
                <TextField
                  label="From"
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  label="To"
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </>
            ) : null}
          </Stack>
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
