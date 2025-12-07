import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';

import { auth, rtdb } from '@/shared/lib/firebase';
import { GameModeType, LobbyData, LobbyStatus } from '@/shared/models/lobby.types';

export type LobbyState = {
  isHost: boolean;
  isPlayer: boolean;
  status: LobbyStatus;
  gameType: GameModeType;
};

/**
 * Hook that listens to lobby state changes in real-time.
 * Returns null if the lobby doesn't exist or if there's no authenticated user.
 * Otherwise returns:
 * - isHost: true if the current user is the host
 * - isPlayer: true if the current user is in the players list
 * - status: the current status of the lobby
 */
export function useLobbyState(gameId: string): LobbyState | null {
  const [lobbyState, setLobbyState] = useState<LobbyState | null>(null);

  useEffect(() => {
    const currentUserId = auth.currentUser?.uid;

    // If no user or invalid gameId, reset state and don't set up listener
    if (!currentUserId || !gameId || gameId.trim() === '') {
      // Use a microtask to avoid synchronous setState
      Promise.resolve().then(() => setLobbyState(null));
      return;
    }

    const lobbyRef = ref(rtdb, `lobbies/${gameId}`);

    const unsubscribe = onValue(
      lobbyRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setLobbyState(null);
          return;
        }

        const lobbyData = snapshot.val() as LobbyData;
        const hostId = lobbyData?.hostId;

        if (!hostId) {
          setLobbyState(null);
          return;
        }

        const isHost = currentUserId === hostId;
        const isPlayer = Boolean(lobbyData.players?.[currentUserId]);

        setLobbyState({
          isHost,
          isPlayer,
          status: lobbyData.status,
          gameType: lobbyData.type,
        });
      },
      (error) => {
        console.error('Error listening to lobby state:', error);
        setLobbyState(null);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [gameId]);

  return lobbyState;
}
