import { ref, get } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';

import { rtdb, db } from '@/shared/lib/firebase';
import { SetData } from '@/shared/models/sets.type';

export async function getGameSet(gameId: string): Promise<SetData | null> {
  try {
    const lobbyRef = ref(rtdb, `lobbies/${gameId}/setId`);
    const lobbySnapshot = await get(lobbyRef);

    if (!lobbySnapshot.exists()) {
      return null;
    }

    const setId = lobbySnapshot.val() as string;
    const setDoc = await getDoc(doc(db, 'sets', setId));

    if (!setDoc.exists()) {
      return null;
    }

    return { id: setDoc.id, ...setDoc.data() } as SetData;
  } catch (error) {
    console.error('Error fetching game set:', error);
    return null;
  }
}
