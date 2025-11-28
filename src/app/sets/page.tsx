import { SetCard } from '@/features/sets/components/SetCard';
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute';

export default async function setsPage() {
  return (
    <ProtectedRoute>
      {' '}
      <main>
        <SetCard name="cwaniak" plays={6969} edited={420}></SetCard>
      </main>
    </ProtectedRoute>
  );
}
