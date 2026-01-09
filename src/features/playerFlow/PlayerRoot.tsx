'use client';

import { Lobby } from './lobby/components/Lobby';
import { useLobbyState } from '@/shared/hooks/useLobbyState';
import { LobbyStatus } from '@/shared/models/lobby.types';
import { GameRoot } from './game/components/GameRoot';

type Status = 'checking' | 'not-found' | LobbyStatus.QUEUED | LobbyStatus.IN_PROGRESS | LobbyStatus.COMPLETED;

interface PlayerRootProps {
  gameId: string;
}

export function PlayerRoot({ gameId }: PlayerRootProps) {
  const lobbyState = useLobbyState(gameId);

  // Derive status from lobby state
  let status: Status = 'checking';

  if (gameId.length !== 6 || lobbyState === null) {
    status = 'not-found';
  } else if (lobbyState.isHost || (lobbyState.status !== LobbyStatus.QUEUED && !lobbyState.isPlayer)) {
    status = 'not-found';
  } else {
    status = lobbyState.status;
  }

  if (status === 'not-found') {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center px-4">
        <p>Game not found or you cannot join this lobby.</p>
      </div>
    );
  }
  if (status === LobbyStatus.QUEUED) {
    return <Lobby gameId={gameId} />;
  }

  if (status === LobbyStatus.IN_PROGRESS && lobbyState) {
    return <GameRoot gameId={gameId} gameType={lobbyState.gameType} />;
  }

  if (status === LobbyStatus.COMPLETED) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center px-4">
        <p>Game has been completed.</p>
      </div>
    );
  }
  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center px-4">
      <p>Checking game...</p>
    </div>
  );
}
