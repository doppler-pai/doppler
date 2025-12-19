'use client';

import { Host } from './host/components/Host';
import { HostGameRoot } from './hostGame/components/HostGameRoot';
import { HostGameSummary } from './hostResults/components/HostGameSummary';
import { useLobbyState } from '@/shared/hooks/useLobbyState';
import { LobbyStatus } from '@/shared/models/lobby.types';

type Status =
  | 'checking'
  | 'not-found'
  | 'no-access'
  | LobbyStatus.QUEUED
  | LobbyStatus.IN_PROGRESS
  | LobbyStatus.COMPLETED;

interface HostRootProps {
  gameId: string;
}

export function HostRoot({ gameId }: HostRootProps) {
  const lobbyState = useLobbyState(gameId);

  // Derive status from lobby state
  let status: Status = 'checking';

  if (gameId.length !== 6 || lobbyState === null) {
    status = 'not-found';
  } else if (!lobbyState.isHost) {
    status = 'no-access';
  } else {
    status = lobbyState.status;
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

  if (status === LobbyStatus.QUEUED && lobbyState) {
    return <Host gameId={gameId} gameType={lobbyState.gameType} />;
  }

  if (status === LobbyStatus.IN_PROGRESS) {
    return <HostGameRoot gameId={gameId} gameType={lobbyState!.gameType} />;
  }

  if (status === LobbyStatus.COMPLETED) {
    return <HostGameSummary gameId={gameId} />;
  }

  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center px-4">
      <p>Checking lobby...</p>
    </div>
  );
}
