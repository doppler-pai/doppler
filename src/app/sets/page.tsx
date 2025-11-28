'use client'

import { SetCardList } from '@/features/sets/components/SetCardList';
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute';
import { useAuth } from '@/shared/hooks/useAuth'

export default function setsPage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute>
      {' '}
      <main>
        <SetCardList userId={user?.uid || ''}/>
      </main>
    </ProtectedRoute>
  );
}
