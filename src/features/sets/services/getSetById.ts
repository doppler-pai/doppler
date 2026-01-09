import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { SetData } from '@/shared/models/sets.type';

export const getSetById = async (id: string): Promise<SetData | null> => {
  try {
    const setDocRef = doc(db, 'sets', id);
    const docSnap = await getDoc(setDocRef);

    if (docSnap.exists()) {
      const raw = docSnap.data();
      // Explicitly map fields to handle potential casing mismatches or missing fields
      return {
        id: docSnap.id,
        title: raw.title || raw.Title || '',
        description: raw.description || raw.Description || '',
        isPublic: raw.isPublic ?? raw.IsPublic ?? false,
        ownerId: raw.ownerId || raw.OwnerId || '',
        questions: raw.questions || raw.Questions || [],
      } as SetData;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch set');
  }
};
