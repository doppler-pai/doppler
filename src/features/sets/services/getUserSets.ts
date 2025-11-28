// services/getSets.ts

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';

interface Question {
  type: string;
  question: string;
}

interface SetData {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  ownerId: string;
  questions: Question[];
}

export const fetchSets = async (userId: string): Promise<SetData[]> => {
  const setsCollection = collection(db, 'sets');
  const q = query(setsCollection, where('ownerId', '==', userId));
  const setsSnapshot = await getDocs(q);
  const setsData = setsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as SetData[];
  
  return setsData;
};