import { ref, update, get, child } from 'firebase/database';
import { rtdb } from '@/shared/lib/firebase';
import { PlayerData, PlayerStats, QuizMetadata } from '@/shared/models/lobby.types';

export async function initializeQuizGame(gameId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current players to initialize their points
    const playersRef = child(ref(rtdb), `lobbies/${gameId}/players`);
    const snapshot = await get(playersRef);

    const points: Record<string, number> = {};
    const playerStats: Record<string, PlayerStats> = {};

    if (snapshot.exists()) {
      const playersData = snapshot.val() as Record<string, PlayerData>;
      for (const playerId of Object.keys(playersData)) {
        points[playerId] = 0;
        playerStats[playerId] = { correct: 0, incorrect: 0 };
      }
    }

    const metadata: QuizMetadata = {
      currentRound: 1,
      points,
      answers: {},
      stats: {
        totalCorrect: 0,
        totalIncorrect: 0,
        totalAnswers: 0,
        playerStats,
      },
    };

    const metadataRef = ref(rtdb, `lobbies/${gameId}/metadata`);
    await update(metadataRef, metadata);

    return { success: true };
  } catch (error) {
    console.error('Error initializing quiz game:', error);
    return { success: false, error: 'Failed to initialize quiz game' };
  }
}
