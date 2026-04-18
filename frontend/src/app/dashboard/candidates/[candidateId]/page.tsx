import { RoleGuard } from '@/components/common/RoleGuard';
import { CandidateApplicationsScreen } from '@/screens/Dashboard/CandidateApplicationsScreen';

export default function CandidateApplicationsPage() {
  return (
    <RoleGuard allow={['ADMIN', 'RECRUITER']}>
      <CandidateApplicationsScreen />
    </RoleGuard>
  );
}
