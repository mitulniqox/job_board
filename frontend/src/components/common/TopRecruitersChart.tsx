'use client';

import { Chart } from 'react-google-charts';

interface TopRecruiter {
  name: string;
  applicationsCount: number;
}

interface TopRecruitersChartProps {
  topRecruiters: TopRecruiter[];
}

export function TopRecruitersChart({ topRecruiters }: TopRecruitersChartProps) {
  const data = [
    ['Company', 'Hiring Score'],
    ...topRecruiters.map((recruiter) => [recruiter.name, recruiter.applicationsCount]),
  ];

  const options = {
    title: 'Top Recruiters',
    hAxis: {
      title: 'Hiring Score',
      minValue: 0,
    },
    vAxis: {
      title: 'Companies (Recruiters)',
      minValue: 0,
    },
    legend: 'none',
  };

  return (
    <Chart
      chartType="ColumnChart"
      width="100%"
      height="400px"
      data={data}
      options={options}
    />
  );
}