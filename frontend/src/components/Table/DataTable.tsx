'use client';

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@mui/material';

export type DataTableColumn<T> = {
  id: keyof T | string;
  label: string;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  width?: number | string;
  render: (row: T) => React.ReactNode;
};

type Props<T> = {
  rows: T[];
  columns: Array<DataTableColumn<T>>;
  rowKey: (row: T) => string;
  page: number;
  rowsPerPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (field: string) => void;
  emptyMessage?: string;
};

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  page,
  rowsPerPage,
  total,
  onPageChange,
  onRowsPerPageChange,
  sortBy,
  sortOrder,
  onSortChange,
  emptyMessage = 'No records found.',
}: Props<T>) {
  return (
    <Paper variant="outlined" className="w-full">
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={String(col.id)}
                  align={col.align ?? 'left'}
                  sx={{ width: col.width }}
                >
                  {col.sortable && onSortChange ? (
                    <TableSortLabel
                      active={sortBy === col.id}
                      direction={sortBy === col.id ? sortOrder : 'asc'}
                      onClick={() => onSortChange(String(col.id))}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Box className="py-8 text-center text-sm text-slate-500">{emptyMessage}</Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={rowKey(row)} hover>
                  {columns.map((col) => (
                    <TableCell key={String(col.id)} align={col.align ?? 'left'}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={Math.max(0, page - 1)}
        onPageChange={(_, next) => onPageChange(next + 1)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => onRowsPerPageChange?.(Number(e.target.value))}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Paper>
  );
}
