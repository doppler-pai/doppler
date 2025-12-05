import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { SetData } from '@/shared/models/sets.type';

export const fetchSets = async (userId: string): Promise<SetData[]> => {
  try {
    const setsCollection = collection(db, 'sets');
    const q = query(setsCollection, where('ownerId', '==', userId));
    const setsSnapshot = await getDocs(q);
    const setsData = setsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SetData[];

    return setsData;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'An error occurred');
  }
};
