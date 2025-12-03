export enum Rarity {
  COMMON = 'common',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export const RARITIES = [Rarity.COMMON, Rarity.EPIC, Rarity.LEGENDARY] as const;

export const RARITY_RATES: Record<Rarity, Record<Rarity, number>> = {
  [Rarity.COMMON]: {
    [Rarity.COMMON]: 93,
    [Rarity.EPIC]: 6,
    [Rarity.LEGENDARY]: 1,
  },
  [Rarity.EPIC]: {
    [Rarity.COMMON]: 25,
    [Rarity.EPIC]: 70,
    [Rarity.LEGENDARY]: 5,
  },
  [Rarity.LEGENDARY]: {
    [Rarity.COMMON]: 15,
    [Rarity.EPIC]: 25,
    [Rarity.LEGENDARY]: 60,
  },
};

export const RARITY_REFUND: Record<Rarity, number> = {
  [Rarity.COMMON]: 100,
  [Rarity.EPIC]: 300,
  [Rarity.LEGENDARY]: 500,
};
