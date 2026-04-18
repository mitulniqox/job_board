import type { UserRole } from '@/constants/roles';

export type NavItem = {
  label: string;
  href: string;
  roles: UserRole[];
};

export const DASHBOARD_NAV: NavItem[] = [
  { label: 'Overview', href: '/dashboard', roles: ['ADMIN', 'RECRUITER', 'CANDIDATE'] },
  { label: 'Admin console', href: '/dashboard/admin', roles: ['ADMIN'] },
  { label: 'Users', href: '/dashboard/users', roles: ['ADMIN'] },
  { label: 'Jobs', href: '/dashboard/jobs', roles: ['ADMIN', 'RECRUITER', 'CANDIDATE'] },
  { label: 'Create job', href: '/dashboard/jobs/new', roles: ['RECRUITER'] },
  { label: 'Saved jobs', href: '/dashboard/saved-jobs', roles: ['CANDIDATE'] },
  { label: 'My applications', href: '/dashboard/my-applications', roles: ['CANDIDATE'] },
  { label: 'Profile', href: '/dashboard/profile', roles: ['ADMIN', 'RECRUITER', 'CANDIDATE'] },
];
