import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute';
import { CreateSet } from '@/features/sets/components/CreateSet';

export default function AddSet() {
  return (
    <ProtectedRoute>
      <main>
        <CreateSet />
      </main>
    </ProtectedRoute>
  );
}
