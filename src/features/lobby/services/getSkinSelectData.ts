import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { getSkinPacks } from '@/shared/services/getSkinPacks';
import type { Skin, PackWithSkins, SkinWithOwnership } from '../models/skin.types';

/**
 * Fetches all skin packs with their skins and ownership information for a user.
 * @param userId - The ID of the user to check ownership for
 * @returns An array of packs with their skins, each skin marked with isOwned field
 */
export async function getSkinSelectData(userId: string): Promise<PackWithSkins[] | null> {
  try {
    // Fetch all skins from Firestore
    const skinsCollection = collection(db, 'skins');
    const skinsSnapshot = await getDocs(skinsCollection);
    const allSkins: Skin[] = skinsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Skin, 'id'>),
    }));

    // Fetch all skin packs
    const packsResult = await getSkinPacks();
    if (!packsResult.success) {
      return null;
    }

    const allPacks = packsResult.packs;

    // Fetch user's owned skin IDs
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    let ownedSkinIds: string[] = [];
    if (userDoc.exists()) {
      const userData = userDoc.data();
      ownedSkinIds = (userData?.ownedSkinIds as string[]) || [];
    }

    const ownedSkinIdsSet = new Set(ownedSkinIds);

    // Group skins by pack
    const skinsMap = new Map<string, SkinWithOwnership[]>();
    for (const skin of allSkins) {
      const skinWithOwnership: SkinWithOwnership = {
        ...skin,
        isOwned: ownedSkinIdsSet.has(skin.id),
      };

      const existing = skinsMap.get(skin.packId) || [];
      existing.push(skinWithOwnership);
      skinsMap.set(skin.packId, existing);
    }

    // Create the final result
    const result: PackWithSkins[] = allPacks
      .map((pack) => ({
        packName: pack.name,
        packId: pack.packId,
        skins: skinsMap.get(pack.packId) || [],
      }))
      .filter((pack) => pack.skins.length > 0); // Only include packs with skins

    return result;
  } catch (error) {
    console.error('Error fetching skin select data:', error);
    return null;
  }
}
