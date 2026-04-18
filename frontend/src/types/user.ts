import type { UserRole } from '@/constants/roles';

export type CandidateProfile = {
  skills: string[];
  experience: number;
  location: string;
  resume: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  candidateProfile: CandidateProfile;
  createdAt: string | null;
};
