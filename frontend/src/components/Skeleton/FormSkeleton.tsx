'use client';

import { Skeleton, Stack } from '@mui/material';

type Props = {
  fields?: number;
};

export function FormSkeleton({ fields = 4 }: Props) {
  return (
    <Stack spacing={2} className="p-2">
      {Array.from({ length: fields }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={56} />
      ))}
      <Skeleton variant="rounded" height={40} width={140} />
    </Stack>
  );
}
