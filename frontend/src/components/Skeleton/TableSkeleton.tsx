'use client';

import { Box, Skeleton, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

type Props = {
  rows?: number;
  columns?: number;
};

export function TableSkeleton({ rows = 6, columns = 5 }: Props) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          {Array.from({ length: columns }).map((_, i) => (
            <TableCell key={i}>
              <Skeleton variant="text" width="60%" />
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: rows }).map((_, r) => (
          <TableRow key={r}>
            {Array.from({ length: columns }).map((_, c) => (
              <TableCell key={c}>
                <Skeleton variant="text" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function TableSkeletonCard({ rows = 6, columns = 5 }: Props) {
  return (
    <Box className="p-4">
      <TableSkeleton rows={rows} columns={columns} />
    </Box>
  );
}
