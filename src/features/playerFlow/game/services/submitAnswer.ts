import { ref, update } from 'firebase/database';
import { auth, rtdb } from '@/shared/lib/firebase';

type SubmitAnswerResult = { success: true } | { success: false; error: string };

export async function submitAnswer(gameId: string, answerIndex: number): Promise<SubmitAnswerResult> {
  try {
    const currentUserId = auth.currentUser?.uid;

    if (!currentUserId) {
      return { success: false, error: 'User not authenticated' };
    }

    if (answerIndex < 0 || answerIndex > 3) {
      return { success: false, error: 'Invalid answer index' };
    }

    const answersRef = ref(rtdb, `lobbies/${gameId}/metadata/answers`);
    await update(answersRef, { [currentUserId]: answerIndex });

    return { success: true };
  } catch (error) {
    console.error('Error submitting answer:', error);
    return { success: false, error: 'Failed to submit answer' };
  }
}
