import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute';
import Market from '@/features/market/components/Market';

export default function Page() {
  return (
    <ProtectedRoute>
      <Market />
    </ProtectedRoute>
  );
}
