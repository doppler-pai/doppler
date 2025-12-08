import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute';
import { SetForm } from '@/features/sets/components/AddSetForm';

export default function AddSet() {
  return (
    <ProtectedRoute>
      <main>
        <SetForm />
      </main>
    </ProtectedRoute>
  );
}
