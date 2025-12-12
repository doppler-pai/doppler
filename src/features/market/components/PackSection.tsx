import { Separator } from '@/shared/components/ui/separator';
import { PackCard } from './PackCard';
import { Rarity, RARITIES } from '@/shared/models/rarity';
import type { RarityConfig } from '@/features/playerFlow/lobby/models/skin.types';

type PackSectionProps = {
  packName: string;
  packId: string;
  rarities: Record<Rarity, RarityConfig>;
  onBuy: (packId: string, rarity: Rarity, price: number) => void;
};

export function PackSection({ packName, packId, rarities, onBuy }: PackSectionProps) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 mb-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 ml-2">{packName}</h2>
        <Separator className="bg-white/20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
        {RARITIES.map((rarity) => {
          const config = rarities[rarity];
          return (
            <PackCard
              key={rarity}
              rarity={rarity}
              price={config.price}
              image={config.image}
              onBuy={(price) => onBuy(packId, rarity, price)}
            />
          );
        })}
      </div>
    </div>
  );
}
