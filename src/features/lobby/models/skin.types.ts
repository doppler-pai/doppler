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
 * Grouped skins by pack ID.
 */
export type SkinPack = {
  packId: string;
  name: string;
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
  skins: SkinWithOwnership[];
};
