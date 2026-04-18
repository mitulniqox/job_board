import { RoleGuard } from '@/components/common/RoleGuard';
import { MyApplicationsScreen } from '@/screens/Dashboard/MyApplicationsScreen';

export default function MyApplicationsPage() {
  return (
    <RoleGuard allow={['CANDIDATE']}>
      <MyApplicationsScreen />
    </RoleGuard>
  );
}
