import { child, ref, update } from 'firebase/database';
import { rtdb } from '@/shared/lib/firebase';

export type UpdatePlayerSkinParams = {
  gameId: string;
  playerId: string;
  skinId: string;
};

export type UpdatePlayerSkinResult =
  | {
      success: true;
      skinId: string;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Updates a player's skin in the lobby.
 */
export async function updatePlayerSkin({
  gameId,
  playerId,
  skinId,
}: UpdatePlayerSkinParams): Promise<UpdatePlayerSkinResult> {
  if (!skinId) {
    return {
      success: false,
      error: 'Please select a skin.',
    };
  }

  try {
    const playerRef = child(ref(rtdb), `lobbies/${gameId}/players/${playerId}`);

    await update(playerRef, {
      skinId,
    });

    return {
      success: true,
      skinId,
    };
  } catch (error) {
    console.error('Error updating player skin:', error);
    return {
      success: false,
      error: 'Unable to update skin. Please try again.',
    };
  }
}
