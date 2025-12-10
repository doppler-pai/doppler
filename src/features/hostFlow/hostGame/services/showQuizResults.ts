import { ref, update, get, child } from 'firebase/database';
import { rtdb } from '@/shared/lib/firebase';
import { QuizMetadata } from '@/shared/models/lobby.types';
import { Question, QuestionType } from '@/shared/models/sets.type';

function isAnswerCorrect(question: Question, answerIndex: number): boolean {
  if (question.type === QuestionType.FOUR_OPTIONS) {
    return question.metadata.answers[answerIndex]?.isCorrect ?? false;
  }

  if (question.type === QuestionType.TRUE_FALSE) {
    const playerAnsweredTrue = answerIndex === 0;
    return playerAnsweredTrue === question.metadata.correctAnswer;
  }

  return false;
}

function getCorrectAnswerIndices(question: Question): number[] {
  if (question.type === QuestionType.FOUR_OPTIONS) {
    return question.metadata.answers
      .map((a, index) => (a.isCorrect ? index : -1))
      .filter((index) => index !== -1);
  }

  if (question.type === QuestionType.TRUE_FALSE) {
    return [question.metadata.correctAnswer ? 0 : 1];
  }

  return [];
}

type ShowResultsResult = { success: true } | { success: false; error: string };

export async function showQuizResults(gameId: string, currentQuestion: Question): Promise<ShowResultsResult> {
  try {
    const metadataRef = child(ref(rtdb), `lobbies/${gameId}/metadata`);
    const snapshot = await get(metadataRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'Metadata not found' };
    }

    const metadata = snapshot.val() as QuizMetadata;
    const { points, answers } = metadata;

    // Calculate new points based on answers
    const newPoints = { ...points };
    for (const [playerId, answerIndex] of Object.entries(answers)) {
      if (isAnswerCorrect(currentQuestion, answerIndex)) {
        newPoints[playerId] = (newPoints[playerId] ?? 0) + 1;
      }
    }

    const correctAnswerIndices = getCorrectAnswerIndices(currentQuestion);

    // Update metadata to show results
    const updateRef = ref(rtdb, `lobbies/${gameId}/metadata`);
    await update(updateRef, {
      points: newPoints,
      showResults: true,
      correctAnswerIndices,
      resultsShownAt: Date.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error showing quiz results:', error);
    return { success: false, error: 'Failed to show results' };
  }
}
