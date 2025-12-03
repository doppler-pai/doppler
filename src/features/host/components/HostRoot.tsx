'use client';

import { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';

import { Host } from './Host';
import { checkLobbyHost } from '../services/checkLobbyHost';
import { rtdb } from '@/shared/lib/firebase';
import { LobbyData } from '@/shared/models/lobby.types';

type Status = 'checking' | 'not-found' | 'no-access' | 'ok';

interface HostRootProps {
  gameId: string;
}

export function HostRoot({ gameId }: HostRootProps) {
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

  if (status === 'checking') {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center px-4">
        <p>Checking lobby...</p>
      </div>
    );
  }

  if (status === 'not-found') {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center px-4">
        <p>Lobby not found.</p>
      </div>
    );
  }

  if (status === 'no-access') {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center px-4">
        <p>You are not the host of this lobby.</p>
      </div>
    );
  }

  return <Host gameId={gameId} setId={setId} />;
}
