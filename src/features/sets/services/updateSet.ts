import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { SetData } from '@/shared/models/sets.type';

export const updateSet = async (id: string, setData: Partial<SetData>): Promise<void> => {
  try {
    if (!id) throw new Error('ID is required for update');
    const setDocRef = doc(db, 'sets', id);
    await updateDoc(setDocRef, setData);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update set');
  }
};
