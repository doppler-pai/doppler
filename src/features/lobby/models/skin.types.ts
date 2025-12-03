import type { Rarity } from '@/shared/models/rarity';

/**
 * Represents a skin available in the game.
 */
export type Skin = {
  id: string;
  name: string;
  image: string;
  packId: string;
  rarity: string;
};

/**
 * Config for a single rarity within a pack.
 */
export type RarityConfig = {
  price: number;
  image: string;
};

/**
 * Raw pack data from Firestore.
 */
export type SkinPackData = {
  packId: string;
  name: string;
  images: Record<Rarity, string>;
  prices: Record<Rarity, number>;
};

/**
 * Represents a skin with ownership information.
 */
export type SkinWithOwnership = Skin & {
  isOwned: boolean;
};

/**
 * Represents a pack with its skins and ownership information.
 */
export type PackWithSkins = {
  packName: string;
  packId: string;
  rarities: Record<Rarity, RarityConfig>;
  skins: SkinWithOwnership[];
};
