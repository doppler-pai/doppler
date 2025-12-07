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
    <div>
      <div className="w-full h-24 mt-16 first:mt-4">
        <div className="ml-24 w-[900px]">
          <h2 className="ml-2 mb-2">{packName}</h2>
          <Separator className="bg-white" />
        </div>
      </div>

      <div className="ml-38 flex gap-36">
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
