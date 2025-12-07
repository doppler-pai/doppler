import { child, get, ref } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';

import { rtdb, db } from '@/shared/lib/firebase';
import { PlayerData } from '@/shared/models/lobby.types';
import type { Skin } from '@/features/playerFlow/lobby/models/skin.types';

export type PlayerWithSkin = PlayerData & {
  skinImage?: string;
};

/**
 * Transforms raw players data into players with skin images.
 * This function is shared between the one-time fetch and real-time listener.
 */
export async function transformPlayersData(playersData: Record<string, PlayerData> | null): Promise<PlayerWithSkin[]> {
  if (!playersData) {
    return [];
  }

  // Convert the record to an array of players
  const playersArray = Object.entries(playersData).map(([playerId, playerData]) => ({
    id: playerId,
    nick: playerData.nick,
    skinId: playerData.skinId,
  }));

  // Fetch skin images for each player
  const playersWithSkins = await Promise.all(
    playersArray.map(async (player) => {
      if (player.skinId) {
        try {
          const skinDoc = await getDoc(doc(db, 'skins', player.skinId));
          if (skinDoc.exists()) {
            const skinData = skinDoc.data() as Skin;
            return { ...player, skinImage: skinData.image };
          }
        } catch (error) {
          console.error(`Error fetching skin ${player.skinId}:`, error);
        }
      }
      return player;
    }),
  );

  return playersWithSkins;
}

/**
 * One-time fetch of game players.
 * For real-time updates, use the useGamePlayers hook instead.
 */
export async function getGamePlayers(gameId: string): Promise<PlayerWithSkin[]> {
  try {
    const playersRef = child(ref(rtdb), `lobbies/${gameId}/players`);
    const snapshot = await get(playersRef);

    if (!snapshot.exists()) {
      return [];
    }

    const playersData = snapshot.val() as Record<string, PlayerData>;
    return await transformPlayersData(playersData);
  } catch (error) {
    console.error('Error fetching game players:', error);
    return [];
  }
}
