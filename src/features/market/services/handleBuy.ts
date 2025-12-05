import { doc, runTransaction } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';

export async function handleBuyService({ userId, price }: { userId: string; price: number }): Promise<number | null> {
  try {
    const userRef = doc(db, 'users', userId);

    const newBalance = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const currentBalance = userDoc.data().currency ?? 0;

      if (currentBalance < price) {
        throw new Error('Insufficient funds');
      }

      const updatedBalance = currentBalance - price;
      transaction.update(userRef, { currency: updatedBalance });

      return updatedBalance;
    });

    return newBalance;
  } catch (error) {
    console.error('handleBuyService error:', error);
    return null;
  }
}
