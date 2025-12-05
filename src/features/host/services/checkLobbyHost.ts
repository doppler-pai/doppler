import { ref, get } from 'firebase/database';

import { auth, rtdb } from '@/shared/lib/firebase';
import { LobbyData } from '@/shared/models/lobby.types';

export async function checkLobbyHost(gameId: string): Promise<boolean> {
  try {
    const currentUserId = auth.currentUser?.uid;

    if (!currentUserId) {
      console.log('no current user id');
      return false;
    }

    if (!gameId || gameId.trim() === '') {
      return false;
    }

    const lobbyRef = ref(rtdb, `lobbies/${gameId}`);
    const snapshot = await get(lobbyRef);

    if (!snapshot.exists()) {
      return false;
    }

    const lobbyData = snapshot.val() as LobbyData;
    const hostId = lobbyData?.hostId;

    console.log('hostId', hostId);
    console.log('currentUserId', currentUserId);

    if (!hostId) {
      return false;
    }

    return currentUserId === hostId;
  } catch (error) {
    console.error('Error checking lobby host:', error);
    return false;
  }
}
