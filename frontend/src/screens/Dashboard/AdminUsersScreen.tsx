'use client';

import { useEffect, useState } from 'react';
import { Autocomplete, Button, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useDebounce } from '@/hooks/useDebounce';
import { DataTable, type DataTableColumn } from '@/components/Table/DataTable';
import { TableSkeletonCard } from '@/components/Skeleton/TableSkeleton';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAdminUsersRequest, updateUserStatusRequest } from '@/store/user/userAction';
import { setUserFilters, setUserPage } from '@/store/user/userSlice';
import type { AdminUserRow } from '@/store/user/userSlice';
import { USER_ROLES } from '@/constants/roles';
import { selectGlobalLoading } from '@/store/ui/uiSlice';
export function AdminUsersScreen() {
  const dispatch = useAppDispatch();
  const { items, total, page, limit, totalPages, filters, error } = useAppSelector((s) => s.user);
  const loading = useAppSelector(selectGlobalLoading);
  const [search, setSearch] = useState(filters.search);
  const debouncedSearch = useDebounce(search, 400);
  const skillOptions = Array.from(
    new Set(items.flatMap((item) => item.candidateProfile?.skills ?? []).filter(Boolean)),
  );

  useEffect(() => {
    dispatch(setUserFilters({ search: debouncedSearch }));
    dispatch(setUserPage(1));
    dispatch(fetchAdminUsersRequest({ page: 1 }));
  }, [debouncedSearch, dispatch]);

  const columns: Array<DataTableColumn<AdminUserRow>> = [
    { id: 'name', label: 'Name', render: (row) => row.name },
    { id: 'email', label: 'Email', render: (row) => row.email },
    { id: 'role', label: 'Role', render: (row) => row.role },
    {
      id: 'isActive',
      label: 'Status',
      render: (row) => (
        <Chip
          size="small"
          color={row.isActive ? 'success' : 'default'}
          label={row.isActive ? 'Active' : 'Suspended'}
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (row) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() =>
            dispatch(updateUserStatusRequest({ userId: row._id, isActive: !row.isActive }))
          }
        >
          {row.isActive ? 'Suspend' : 'Activate'}
        </Button>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Users</Typography>
      {error ? (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      ) : null}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        className="items-start md:items-center"
      >
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
            dispatch(setUserFilters({ skills: value }));
            dispatch(setUserPage(1));
            dispatch(
              fetchAdminUsersRequest({
                page: 1,
                limit,
                filters: { ...filters, skills: value, search: debouncedSearch },
              }),
            );
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
            dispatch(setUserFilters({ location }));
            dispatch(setUserPage(1));
            dispatch(
              fetchAdminUsersRequest({
                page: 1,
                limit,
                filters: { ...filters, location, search: debouncedSearch },
              }),
            );
          }}
          fullWidth
        />
        <TextField
          select
          label="Role"
          value={filters.role}
          onChange={(e) => {
            const role = e.target.value as typeof filters.role;
            dispatch(setUserFilters({ role }));
            dispatch(setUserPage(1));
            dispatch(
              fetchAdminUsersRequest({
                page: 1,
                limit,
                filters: { ...filters, role, search: debouncedSearch },
              }),
            );
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All</MenuItem>
          {USER_ROLES.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Active"
          value={filters.isActive}
          onChange={(e) => {
            const isActive = e.target.value as typeof filters.isActive;
            dispatch(setUserFilters({ isActive }));
            dispatch(setUserPage(1));
            dispatch(
              fetchAdminUsersRequest({
                page: 1,
                limit,
                filters: { ...filters, isActive, search: debouncedSearch },
              }),
            );
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Any</MenuItem>
          <MenuItem value="true">Active</MenuItem>
          <MenuItem value="false">Suspended</MenuItem>
        </TextField>
      </Stack>

      {loading && items.length === 0 ? (
        <TableSkeletonCard />
      ) : (
        <DataTable<AdminUserRow>
          rows={items}
          columns={columns}
          rowKey={(row) => row._id}
          page={page}
          rowsPerPage={limit}
          total={total}
          onPageChange={(nextPage) => {
            dispatch(setUserPage(nextPage));
            dispatch(
              fetchAdminUsersRequest({
                page: nextPage,
                limit,
                filters: { ...filters, search: debouncedSearch },
              }),
            );
          }}
          onRowsPerPageChange={(nextLimit) => {
            dispatch(
              fetchAdminUsersRequest({
                page: 1,
                limit: nextLimit,
                filters: { ...filters, search: debouncedSearch },
              }),
            );
          }}
          emptyMessage="No users match the current filters."
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSortChange={(field) => {
            const nextOrder =
              filters.sortBy === field && filters.sortOrder === 'desc' ? 'asc' : 'desc';
            dispatch(setUserFilters({ sortBy: field, sortOrder: nextOrder }));
            dispatch(
              fetchAdminUsersRequest({
                page: 1,
                limit,
                filters: {
                  ...filters,
                  sortBy: field,
                  sortOrder: nextOrder,
                  search: debouncedSearch,
                },
              }),
            );
          }}
        />
      )}
      <Typography variant="caption" color="text.secondary">
        Page {page} of {Math.max(totalPages, 1)} — {total} users
      </Typography>
    </Stack>
  );
}
