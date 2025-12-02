import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import type { SkinPack } from '../../features/lobby/models/skin.types';

type GetSkinPacksResult = { success: true; packs: SkinPack[] } | { success: false; error: string };

/**
 * Fetches all available skin packs from Firestore.
 */
export async function getSkinPacks(): Promise<GetSkinPacksResult> {
  try {
    const packsCollection = collection(db, 'packs');
    const snapshot = await getDocs(packsCollection);

    const packs: SkinPack[] = snapshot.docs.map((doc) => ({
      packId: doc.id,
      ...(doc.data() as Omit<SkinPack, 'packId'>),
    }));

    return { success: true, packs };
  } catch (error) {
    console.error('Error fetching skin packs:', error);
    return { success: false, error: 'Failed to fetch skin packs.' };
  }
}
