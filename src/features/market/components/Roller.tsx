'use client';

import { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Rarity, RARITY_RATES, RARITY_REFUND } from '@/shared/models/rarity';
import type { SkinWithOwnership } from '@/features/playerFlow/lobby/models/skin.types';

export type RollResult = {
  skin: SkinWithOwnership;
  isDuplicate: boolean;
  refund: number;
};

type RollerProps = {
  rarity: Rarity;
  skins: SkinWithOwnership[];
  onFinish: (result: RollResult) => void;
};

export default function Roller({ rarity, skins, onFinish }: RollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasRolled = useRef(false);

  const rollRarity = useCallback((): Rarity => {
    const rates = RARITY_RATES[rarity];
    const r = Math.random() * 100;
    let sum = 0;

    for (const [rarityKey, rate] of Object.entries(rates)) {
      sum += rate;
      if (r <= sum) {
        return rarityKey as Rarity;
      }
    }
    return Rarity.COMMON;
  }, [rarity]);

  const rollSkin = useCallback(
    (targetRarity: Rarity): SkinWithOwnership => {
      const skinsOfRarity = skins.filter((s) => s.rarity === targetRarity);
      if (skinsOfRarity.length === 0) {
        // Fallback to any skin if no skins of that rarity
        return skins[Math.floor(Math.random() * skins.length)];
      }
      return skinsOfRarity[Math.floor(Math.random() * skinsOfRarity.length)];
    },
    [skins],
  );

  const runAnimation = useCallback(
    (target: SkinWithOwnership) => {
      const container = containerRef.current;
      if (!container) return;

      const itemWidth = 120;
      const repeat = 30;

      const targetIndex = repeat * skins.length + skins.findIndex((s) => s.id === target.id);
      const stopOffset = -(targetIndex * itemWidth) + 300;

      container.style.transition = 'transform 5s cubic-bezier(0.1, 0.9, 0.2, 1)';
      container.style.transform = `translateX(${stopOffset}px)`;

      const isDuplicate = target.isOwned === true;
      const skinRarity = target.rarity.toLowerCase() as Rarity;
      const refund = isDuplicate ? (RARITY_REFUND[skinRarity] ?? 0) : 0;

      setTimeout(() => onFinish({ skin: target, isDuplicate, refund }), 5000);
    },
    [skins, onFinish],
  );

  useEffect(() => {
    if (hasRolled.current || skins.length === 0) return;
    hasRolled.current = true;

    const rolledRarity = rollRarity();
    const skin = rollSkin(rolledRarity);
    runAnimation(skin);
  }, [skins, rollRarity, rollSkin, runAnimation]);

  if (skins.length === 0) {
    return <p className="text-center">No skins available</p>;
  }

  console.log(skins);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111] rounded-xl p-8 shadow-2xl border border-white/10 w-[80%] max-w-4xl">
        <h1 className="text-center text-white text-2xl mb-6">Rolling {rarity.toUpperCase()} Pack...</h1>

        <div className="relative w-full h-40 bg-black/60 overflow-hidden border rounded-lg mx-auto">
          <div ref={containerRef} className="flex gap-4 py-6" style={{ transform: 'translateX(0px)' }}>
            {Array(80)
              .fill(0)
              .flatMap((_, i) =>
                skins.map((skin) => (
                  <Image
                    key={`${skin.id}-${i}`}
                    src={skin.image}
                    alt={skin.name}
                    width={112}
                    height={112}
                    className="object-contain rounded-md"
                  />
                )),
              )}
          </div>

          <div className="absolute left-1/2 top-0 w-[4px] h-full bg-red-500 shadow-[0_0_12px_red]" />
        </div>
      </div>
    </div>
  );
}
