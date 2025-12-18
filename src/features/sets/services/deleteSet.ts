import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';

export const deleteSet = async (setId: string): Promise<void> => {
  try {
    const setDocRef = doc(db, 'sets', setId);
    await deleteDoc(setDocRef);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete set');
  }
};
