import { doc, increment, updateDoc } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';

/**
 * Awards a random amount of currency to a player after completing a game.
 * Returns the amount awarded, or null if the operation fails.
 */
export async function awardGameReward(userId: string): Promise<number | null> {
  try {
    // Random reward between 50 and 200 coins
    const rewardAmount = Math.floor(Math.random() * 151) + 50;

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      currency: increment(rewardAmount),
    });

    return rewardAmount;
  } catch (error) {
    console.error('Failed to award game reward:', error);
    return null;
  }
}
