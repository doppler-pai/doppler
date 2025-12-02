'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ref, get } from 'firebase/database';

import { Host } from '@/features/host/components/Host';
import { checkLobbyHost } from '@/features/host/services/checkLobbyHost';
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute';
import { rtdb } from '@/shared/lib/firebase';
import { LobbyData } from '@/shared/models/lobby.types';

type Status = 'checking' | 'not-found' | 'no-access' | 'ok';

export default function HostLobbyPage() {
  const params = useParams();
  const gameId = params?.gameId as string;

  const [status, setStatus] = useState<Status>('checking');
  const [setId, setSetId] = useState<string>('');

  useEffect(() => {
    const run = async () => {
      if (!gameId || gameId.length !== 6) {
        setStatus('not-found');
        return;
      }

      // Check if user is the host of this lobby
      const isHost = await checkLobbyHost(gameId);

      if (!isHost) {
        setStatus('no-access');
        return;
      }

      // Get lobby data to extract setId
      const lobbyRef = ref(rtdb, `lobbies/${gameId}`);
      const snapshot = await get(lobbyRef);

      if (!snapshot.exists()) {
        setStatus('not-found');
        return;
      }

      const lobbyData = snapshot.val() as LobbyData;
      setSetId(lobbyData.setId);
      setStatus('ok');
    };

    void run();
  }, [gameId]);

  let content: React.ReactNode;

  if (status === 'checking') {
    content = (
      <div className="flex min-h-[70vh] w-full items-center justify-center px-4">
        <p>Checking lobby...</p>
      </div>
    );
  } else if (status === 'not-found') {
    content = (
      <div className="flex min-h-[70vh] w-full items-center justify-center px-4">
        <p>Lobby not found.</p>
      </div>
    );
  } else if (status === 'no-access') {
    content = (
      <div className="flex min-h-[70vh] w-full items-center justify-center px-4">
        <p>You are not the host of this lobby.</p>
      </div>
    );
  } else {
    content = <Host gameId={gameId} setId={setId} />;
  }

  return <ProtectedRoute>{content}</ProtectedRoute>;
}
