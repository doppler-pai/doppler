import { ref, update, get, child } from 'firebase/database';
import { rtdb } from '@/shared/lib/firebase';
import { QuizMetadata, LobbyStatus } from '@/shared/models/lobby.types';
import { Question, QuestionType } from '@/shared/models/sets.type';

function isAnswerCorrect(question: Question, answerIndex: number): boolean {
  if (question.type === QuestionType.FOUR_OPTIONS) {
    return question.metadata.answers[answerIndex]?.isCorrect ?? false;
  }

  if (question.type === QuestionType.TRUE_FALSE) {
    // answerIndex 0 = true, answerIndex 1 = false
    const playerAnsweredTrue = answerIndex === 0;
    return playerAnsweredTrue === question.metadata.correctAnswer;
  }

  return false;
}

type AdvanceRoundResult = { success: true; gameCompleted: boolean } | { success: false; error: string };

export async function advanceQuizRound(
  gameId: string,
  currentQuestion: Question,
  totalQuestions: number,
): Promise<AdvanceRoundResult> {
  try {
    // Get current metadata
    const metadataRef = child(ref(rtdb), `lobbies/${gameId}/metadata`);
    const snapshot = await get(metadataRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'Metadata not found' };
    }

    const metadata = snapshot.val() as QuizMetadata;
    const { currentRound, points, answers } = metadata;

    // Calculate new points based on answers
    const newPoints = { ...points };
    for (const [playerId, answerIndex] of Object.entries(answers)) {
      if (isAnswerCorrect(currentQuestion, answerIndex)) {
        newPoints[playerId] = (newPoints[playerId] ?? 0) + 1;
      }
    }

    // Check if game is completed
    const isLastRound = currentRound >= totalQuestions;

    if (isLastRound) {
      // Game completed - update status and final points
      const lobbyRef = ref(rtdb, `lobbies/${gameId}`);
      await update(lobbyRef, {
        status: LobbyStatus.COMPLETED,
        'metadata/points': newPoints,
        'metadata/answers': {},
      });
      return { success: true, gameCompleted: true };
    }

    // Move to next round
    const updateRef = ref(rtdb, `lobbies/${gameId}/metadata`);
    await update(updateRef, {
      currentRound: currentRound + 1,
      points: newPoints,
      answers: {},
    });

    return { success: true, gameCompleted: false };
  } catch (error) {
    console.error('Error advancing quiz round:', error);
    return { success: false, error: 'Failed to advance round' };
  }
}
