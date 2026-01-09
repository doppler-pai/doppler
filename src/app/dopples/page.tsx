import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute';
import { MyDopples } from '../../features/dopples/components/MyDopples';

export default function MyDopplesPage() {
  return (
    <ProtectedRoute>
      <MyDopples />
    </ProtectedRoute>
  );
}
