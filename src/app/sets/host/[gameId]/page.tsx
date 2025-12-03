'use client';

import { useParams } from 'next/navigation';

import { HostRoot } from '@/features/host/components/HostRoot';
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute';

export default function HostLobbyPage() {
  const params = useParams();
  const gameId = params?.gameId as string;

  return (
    <ProtectedRoute>
      <HostRoot gameId={gameId} />
    </ProtectedRoute>
  );
}
