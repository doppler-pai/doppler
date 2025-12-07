import { ref, get } from 'firebase/database';

import { auth, rtdb } from '@/shared/lib/firebase';
import { LobbyData, LobbyStatus } from '@/shared/models/lobby.types';

export type LobbyState = {
  isHost: boolean;
  isPlayer: boolean;
  status: LobbyStatus;
};

/**
 * Check the state of a lobby for the current user.
 * Returns null if the lobby doesn't exist or if there's no authenticated user.
 * Otherwise returns:
 * - isHost: true if the current user is the host
 * - isPlayer: true if the current user is not the host and can join (lobby is QUEUED)
 * - status: the current status of the lobby
 * - lobbyData: the full lobby data
 */
export async function checkLobbyState(gameId: string): Promise<LobbyState | null> {
  try {
    const currentUserId = auth.currentUser?.uid;

    if (!currentUserId) {
      return null;
    }

    if (!gameId || gameId.trim() === '') {
      return null;
    }

    const lobbyRef = ref(rtdb, `lobbies/${gameId}`);
    const snapshot = await get(lobbyRef);

    if (!snapshot.exists()) {
      return null;
    }

    const lobbyData = snapshot.val() as LobbyData;
    const hostId = lobbyData?.hostId;

    if (!hostId) {
      return null;
    }

    const isHost = currentUserId === hostId;
    const isPlayer = Boolean(lobbyData.players?.[currentUserId]);

    return {
      isHost,
      isPlayer,
      status: lobbyData.status,
    };
  } catch (error) {
    console.error('Error checking lobby state:', error);
    return null;
  }
}
