import { RoleGuard } from '@/components/common/RoleGuard';
import { JobsListScreen } from '@/screens/Dashboard/JobsListScreen';

export default function SavedJobsPage() {
  return (
    <RoleGuard allow={['CANDIDATE']}>
      <JobsListScreen savedOnly />
    </RoleGuard>
  );
}
