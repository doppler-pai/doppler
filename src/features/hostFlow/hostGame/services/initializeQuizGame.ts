import { ref, update, get, child } from 'firebase/database';
import { rtdb } from '@/shared/lib/firebase';
import { PlayerData, QuizMetadata } from '@/shared/models/lobby.types';

export async function initializeQuizGame(gameId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current players to initialize their points
    const playersRef = child(ref(rtdb), `lobbies/${gameId}/players`);
    const snapshot = await get(playersRef);

    const points: Record<string, number> = {};

    if (snapshot.exists()) {
      const playersData = snapshot.val() as Record<string, PlayerData>;
      for (const playerId of Object.keys(playersData)) {
        points[playerId] = 0;
      }
    }

    const metadata: QuizMetadata = {
      currentRound: 1,
      points,
      answers: {},
    };

    const metadataRef = ref(rtdb, `lobbies/${gameId}/metadata`);
    await update(metadataRef, metadata);

    return { success: true };
  } catch (error) {
    console.error('Error initializing quiz game:', error);
    return { success: false, error: 'Failed to initialize quiz game' };
  }
}
