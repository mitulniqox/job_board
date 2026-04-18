'use client';

import { Card, CardContent, Skeleton, Stack } from '@mui/material';

type Props = {
  lines?: number;
};

export function CardSkeleton({ lines = 3 }: Props) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1.5}>
          <Skeleton variant="text" width="40%" height={28} />
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} variant="text" />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
