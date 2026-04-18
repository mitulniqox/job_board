import { RoleGuard } from '@/components/common/RoleGuard';
import { JobCreateScreen } from '@/screens/Dashboard/JobCreateScreen';

export default function JobNewPage() {
  return (
    <RoleGuard allow={['RECRUITER']}>
      <JobCreateScreen />
    </RoleGuard>
  );
}
