import { ref, set, serverTimestamp } from 'firebase/database';

import { auth, rtdb } from '@/shared/lib/firebase';
import { GameModeType, LobbyData, LobbyStatus } from '@/shared/models/lobby.types';
import { CreateLobbyParams } from '../models/createLobby.types';

function generateLobbyCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createLobby(
  params: CreateLobbyParams,
): Promise<{ success: boolean; lobbyId?: string; error?: string }> {
  try {
    const currentUserId = auth.currentUser?.uid;

    if (!currentUserId) {
      return { success: false, error: 'User not authenticated' };
    }

    const lobbyId = generateLobbyCode();
    const lobbyRef = ref(rtdb, `lobbies/${lobbyId}`);

    const metadata: Record<string, unknown> = {};

    if (params.type === GameModeType.TIME && params.timeValue) {
      metadata.timeValue = params.timeValue;
    }

    if (params.type === GameModeType.POINTS && params.pointsValue) {
      metadata.pointsValue = params.pointsValue;
    }

    const lobbyData: Omit<LobbyData, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
      hostId: currentUserId,
      setId: params.setId,
      status: LobbyStatus.QUEUED,
      type: params.type,
      metadata,
      createdAt: serverTimestamp(),
    };

    await set(lobbyRef, lobbyData);

    return { success: true, lobbyId };
  } catch (error) {
    console.error('Error creating lobby:', error);
    return { success: false, error: 'Failed to create lobby' };
  }
}
