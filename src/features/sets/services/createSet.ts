import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { SetData } from '@/shared/models/sets.type';

export const createSet = async (setData: Omit<SetData, 'id'>): Promise<string> => {
  try {
    const setsCollection = collection(db, 'sets');
    const docRef = await addDoc(setsCollection, setData);
    return docRef.id;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create set');
  }
};
