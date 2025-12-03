import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { RARITIES } from '@/shared/models/rarity';
import type {
  Skin,
  SkinPackData,
  PackWithSkins,
  SkinWithOwnership,
  RarityConfig,
} from '@/features/lobby/models/skin.types';
import type { Rarity } from '@/shared/models/rarity';

/**
 * Fetches all skin packs with their skins and ownership information for a user.
 * @param userId - The ID of the user to check ownership for
 * @returns An array of packs with their skins, each skin marked with isOwned field
 */
export async function getSkinData(userId: string): Promise<PackWithSkins[] | null> {
  try {
    // Fetch all skins from Firestore
    const skinsCollection = collection(db, 'skins');
    const skinsSnapshot = await getDocs(skinsCollection);
    const allSkins: Skin[] = skinsSnapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Skin, 'id'>),
    }));

    // Fetch all skin packs
    const packsCollection = collection(db, 'packs');
    const packsSnapshot = await getDocs(packsCollection);
    const allPacks: SkinPackData[] = packsSnapshot.docs.map((d) => ({
      packId: d.id,
      ...(d.data() as Omit<SkinPackData, 'packId'>),
    }));

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

    // Create the final result, transforming images+prices into rarities
    const result: PackWithSkins[] = allPacks
      .map((pack) => {
        const rarities = RARITIES.reduce(
          (acc, rarity) => {
            acc[rarity] = {
              price: pack.prices[rarity],
              image: pack.images[rarity],
            };
            return acc;
          },
          {} as Record<Rarity, RarityConfig>,
        );

        return {
          packName: pack.name,
          packId: pack.packId,
          rarities,
          skins: skinsMap.get(pack.packId) || [],
        };
      })
      .filter((pack) => pack.skins.length > 0); // Only include packs with skins

    return result;
  } catch (error) {
    console.error('Error fetching skin data:', error);
    return null;
  }
}
