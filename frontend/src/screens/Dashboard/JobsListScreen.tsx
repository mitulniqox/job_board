'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Autocomplete, Button, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useDebounce } from '@/hooks/useDebounce';
import { DataTable, type DataTableColumn } from '@/components/Table/DataTable';
import { TableSkeletonCard } from '@/components/Skeleton/TableSkeleton';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  bookmarkJobRequest,
  fetchBookmarkedJobIdsRequest,
  fetchBookmarkedJobsRequest,
  fetchPublicJobsRequest,
  unbookmarkJobRequest,
} from '@/store/jobs/jobsAction';
import { setJobFilters, setJobPage, type JobsListFilters } from '@/store/jobs/jobsSlice';
import type { JobListItem } from '@/types/job';
import { JOB_TYPES, JOB_TYPE_LABELS } from '@/constants/job';
import { selectGlobalLoading } from '@/store/ui/uiSlice';
import { selectAuthUser } from '@/store/auth/authSlice';

type Props = {
  savedOnly?: boolean;
};

export function JobsListScreen({ savedOnly = false }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const { list, saved, bookmarkedJobIds, total, page, limit, totalPages, filters, error } =
    useAppSelector((s) => s.jobs);
  const loading = useAppSelector(selectGlobalLoading);
  const [search, setSearch] = useState(filters.search);
  const debouncedSearch = useDebounce(search, 400);
  const isCandidate = user?.role === 'CANDIDATE';
  const isRecruiter = user?.role === 'RECRUITER';
  const isAdmin = user?.role === 'ADMIN';
  const rows = savedOnly ? saved.items : list;
  const pagination = savedOnly
    ? { total: saved.total, page: saved.page, limit: saved.limit, totalPages: saved.totalPages }
    : { total, page, limit, totalPages };
  const desiredActiveFilter = isCandidate && !savedOnly ? 'true' : '';
  const skillOptions = Array.from(
    new Set(rows.flatMap((job: JobListItem) => job.skills as string[]).filter(Boolean)),
  );

  const loadJobs = (payload: {
    page?: number;
    limit?: number;
    filters?: Partial<JobsListFilters>;
  }) => dispatch(savedOnly ? fetchBookmarkedJobsRequest(payload) : fetchPublicJobsRequest(payload));

  useEffect(() => {
    const nextFilters: Partial<JobsListFilters> = {
      search: debouncedSearch,
      ...(filters.isActive !== desiredActiveFilter ? { isActive: desiredActiveFilter } : {}),
    };
    dispatch(setJobFilters(nextFilters));
    dispatch(setJobPage(1));
    dispatch(
      savedOnly
        ? fetchBookmarkedJobsRequest({ page: 1, filters: nextFilters })
        : fetchPublicJobsRequest({ page: 1, filters: nextFilters }),
    );
  }, [debouncedSearch, desiredActiveFilter, dispatch, filters.isActive, savedOnly]);

  useEffect(() => {
    if (isCandidate) {
      dispatch(fetchBookmarkedJobIdsRequest());
    }
  }, [dispatch, isCandidate]);

  const columns: Array<DataTableColumn<JobListItem>> = [
    { id: 'title', label: 'Title', sortable: true, render: (row) => row.title },
    {
      id: 'jobType',
      label: 'Type',
      render: (row) => JOB_TYPE_LABELS[row.jobType],
    },
    { id: 'location', label: 'Location', render: (row) => row.location },
    {
      id: 'isActive',
      label: 'Status',
      render: (row) => (
        <Chip
          size="small"
          color={row.isActive ? 'success' : 'default'}
          label={row.isActive ? 'Open' : 'Closed'}
        />
      ),
    },
    {
      id: 'actions',
      label: '',
      render: (row) => (
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Button
            component={Link}
            href={`/dashboard/jobs/${row._id}`}
            size="small"
            variant="outlined"
          >
            View
          </Button>
          {isRecruiter ? (
            <Button
              component={Link}
              href={`/dashboard/jobs/${row._id}/edit`}
              size="small"
              variant="contained"
            >
              Edit
            </Button>
          ) : null}
          {isCandidate ? (
            bookmarkedJobIds.includes(row._id) ? (
              <Button
                size="small"
                variant="text"
                color="inherit"
                onClick={() => dispatch(unbookmarkJobRequest({ jobId: row._id }))}
              >
                Unsave
              </Button>
            ) : (
              <Button
                size="small"
                variant="contained"
                onClick={() => dispatch(bookmarkJobRequest({ jobId: row._id }))}
              >
                Save
              </Button>
            )
          ) : null}
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}
      >
        <Typography variant="h4">{savedOnly ? 'Saved jobs' : 'Jobs'}</Typography>
        {isRecruiter ? (
          <Button component={Link} href="/dashboard/jobs/new" variant="contained">
            Create job
          </Button>
        ) : isCandidate && !savedOnly ? (
          <Button component={Link} href="/dashboard/saved-jobs" variant="outlined">
            Saved jobs
          </Button>
        ) : null}
      </Stack>
      {error ? (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      ) : null}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
        <Autocomplete
          multiple
          freeSolo
          options={skillOptions}
          value={filters.skills}
          onChange={(_, value) => {
            dispatch(setJobFilters({ skills: value }));
            dispatch(setJobPage(1));
            loadJobs({ page: 1, filters: { skills: value } });
          }}
          renderInput={(params) => (
            <TextField {...params} label="Skills" placeholder="Add skills" />
          )}
          sx={{ minWidth: 240 }}
        />
        <TextField
          label="Location"
          value={filters.location}
          onChange={(e) => {
            const location = e.target.value;
            dispatch(setJobFilters({ location }));
            dispatch(setJobPage(1));
            loadJobs({ page: 1, filters: { location } });
          }}
          fullWidth
        />
        <TextField
          select
          label="Job type"
          value={filters.jobType}
          onChange={(e) => {
            const jobType = e.target.value as typeof filters.jobType;
            dispatch(setJobFilters({ jobType }));
            dispatch(setJobPage(1));
            loadJobs({ page: 1, filters: { jobType } });
          }}
          sx={{ minWidth: 180 }}
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
          value={filters.isActive}
          onChange={(e) => {
            const isActive = e.target.value as typeof filters.isActive;
            dispatch(setJobFilters({ isActive }));
            dispatch(setJobPage(1));
            loadJobs({ page: 1, filters: { isActive } });
          }}
          sx={{ minWidth: 160 }}
          disabled={isCandidate && !savedOnly}
        >
          <MenuItem value="">Any</MenuItem>
          <MenuItem value="true">Open</MenuItem>
          <MenuItem value="false">Closed</MenuItem>
        </TextField>
      </Stack>

      {loading && rows.length === 0 ? (
        <TableSkeletonCard />
      ) : (
        <DataTable<JobListItem>
          rows={rows}
          columns={columns}
          rowKey={(row) => row._id}
          page={pagination.page}
          rowsPerPage={pagination.limit}
          total={pagination.total}
          onPageChange={(nextPage) => {
            dispatch(setJobPage(nextPage));
            loadJobs({ page: nextPage });
          }}
          onRowsPerPageChange={(nextLimit) => {
            loadJobs({ page: 1, limit: nextLimit });
          }}
          emptyMessage={
            savedOnly
              ? 'No saved jobs match the current search and filters.'
              : 'No jobs match the current search and filters.'
          }
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSortChange={(field) => {
            const nextOrder =
              filters.sortBy === field && filters.sortOrder === 'desc' ? 'asc' : 'desc';
            dispatch(setJobFilters({ sortBy: field, sortOrder: nextOrder }));
            loadJobs({ page: 1, filters: { sortBy: field, sortOrder: nextOrder } });
          }}
        />
      )}
      <Typography variant="caption" color="text.secondary">
        Page {pagination.page} of {Math.max(pagination.totalPages, 1)} - {pagination.total}{' '}
        {savedOnly ? 'saved jobs' : isAdmin ? 'jobs' : isRecruiter ? 'owned jobs' : 'open jobs'}
      </Typography>
    </Stack>
  );
}
