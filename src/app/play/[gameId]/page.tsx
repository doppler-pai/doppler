'use client';

import { useParams } from 'next/navigation';

import { PlayerRoot } from '@/features/playerFlow/lobby/components/PlayerRoot';
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute';

export default function PlayGamePage() {
  const params = useParams();
  const gameIdParam = params?.gameId;
  const gameId = typeof gameIdParam === 'string' ? gameIdParam : Array.isArray(gameIdParam) ? gameIdParam[0] : '';

  return (
    <ProtectedRoute>
      <PlayerRoot gameId={gameId} />
    </ProtectedRoute>
  );
}
