import { ref, update, get, child } from 'firebase/database';
import { rtdb } from '@/shared/lib/firebase';
import { QuizMetadata, LobbyStatus } from '@/shared/models/lobby.types';

type AdvanceRoundResult = { success: true; gameCompleted: boolean } | { success: false; error: string };

export async function advanceQuizRound(gameId: string, totalQuestions: number): Promise<AdvanceRoundResult> {
  try {
    // Get current metadata
    const metadataRef = child(ref(rtdb), `lobbies/${gameId}/metadata`);
    const snapshot = await get(metadataRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'Metadata not found' };
    }

    const metadata = snapshot.val() as QuizMetadata;
    const { currentRound } = metadata;

    // Check if game is completed
    const isLastRound = currentRound >= totalQuestions;

    if (isLastRound) {
      // Game completed - update status
      const lobbyRef = ref(rtdb, `lobbies/${gameId}`);
      await update(lobbyRef, {
        status: LobbyStatus.COMPLETED,
        'metadata/answers': {},
        'metadata/showResults': false,
        'metadata/correctAnswerIndices': null,
        'metadata/resultsShownAt': null,
      });
      return { success: true, gameCompleted: true };
    }

    // Move to next round - clear results state
    const updateRef = ref(rtdb, `lobbies/${gameId}/metadata`);
    await update(updateRef, {
      currentRound: currentRound + 1,
      answers: {},
      showResults: false,
      correctAnswerIndices: null,
      resultsShownAt: null,
    });

    return { success: true, gameCompleted: false };
  } catch (error) {
    console.error('Error advancing quiz round:', error);
    return { success: false, error: 'Failed to advance round' };
  }
}
