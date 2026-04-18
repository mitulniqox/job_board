import { RoleGuard } from '@/components/common/RoleGuard';
import { AdminConsoleScreen } from '@/screens/Dashboard/AdminConsoleScreen';

export default function AdminConsolePage() {
  return (
    <RoleGuard allow={['ADMIN']}>
      <AdminConsoleScreen />
    </RoleGuard>
  );
}
