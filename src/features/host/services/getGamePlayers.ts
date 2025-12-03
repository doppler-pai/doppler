import { child, get, ref } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';

import { rtdb, db } from '@/shared/lib/firebase';
import { PlayerData } from '@/shared/models/lobby.types';
import type { Skin } from '@/features/lobby/models/skin.types';

export type PlayerWithSkin = PlayerData & {
  skinImage?: string;
};

export async function getGamePlayers(gameId: string): Promise<PlayerWithSkin[]> {
  try {
    const playersRef = child(ref(rtdb), `lobbies/${gameId}/players`);
    const snapshot = await get(playersRef);

    if (!snapshot.exists()) {
      return [];
    }

    const playersData = snapshot.val() as Record<string, PlayerData>;

    // Convert the record to an array of players and fetch skin images
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

    console.log(playersWithSkins);

    return playersWithSkins;
  } catch (error) {
    console.error('Error fetching game players:', error);
    return [];
  }
}
