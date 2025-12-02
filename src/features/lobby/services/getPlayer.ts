import { child, get, ref } from 'firebase/database';

import { rtdb } from '@/shared/lib/firebase';
import { PlayerData } from '@/shared/models/lobby.types';

export async function getPlayer(gameId: string, playerId: string): Promise<PlayerData | null> {
  try {
    const playerRef = child(ref(rtdb), `lobbies/${gameId}/players/${playerId}`);
    const snapshot = await get(playerRef);

    if (!snapshot.exists()) {
      return null;
    }

    const playerData = snapshot.val();

    return {
      id: playerData?.id,
      nick: playerData?.nick,
      skinId: playerData?.skinId,
    };
  } catch (error) {
    console.error('Error reading player nick from lobby:', error);
    throw new Error('Unable to read player info. Please try again.');
  }
}
