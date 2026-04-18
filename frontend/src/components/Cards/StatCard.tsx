'use client';

import { Card, CardContent, Typography } from '@mui/material';

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
};

export function StatCard({ title, value, subtitle }: Props) {
  return (
    <Card variant="outlined" className="h-full">
      <CardContent>
        <Typography color="text.secondary" variant="overline">
          {title}
        </Typography>
        <Typography variant="h4" className="mt-1">
          {value}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" className="mt-1">
            {subtitle}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}
