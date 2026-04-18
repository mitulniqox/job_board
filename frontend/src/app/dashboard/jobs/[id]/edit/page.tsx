import { RoleGuard } from '@/components/common/RoleGuard';
import { JobCreateScreen } from '@/screens/Dashboard/JobCreateScreen';

export default function JobEditPage() {
  return (
    <RoleGuard allow={['RECRUITER']}>
      <JobCreateScreen mode="edit" />
    </RoleGuard>
  );
}
