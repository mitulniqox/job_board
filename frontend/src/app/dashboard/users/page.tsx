import { RoleGuard } from '@/components/common/RoleGuard';
import { AdminUsersScreen } from '@/screens/Dashboard/AdminUsersScreen';

export default function UsersPage() {
  return (
    <RoleGuard allow={['ADMIN']}>
      <AdminUsersScreen />
    </RoleGuard>
  );
}
