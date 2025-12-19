'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Rarity } from '@/shared/models/rarity';

export interface Skin {
  id: string;
  name: string;
  image: string;
  rarity?: Rarity;
  isOwned?: boolean;
}

export type RollResult = {
  skin: Skin;
  isDuplicate: boolean;
  refund: number;
};

interface RollerProps {
  rarity: Rarity;
  skins: Skin[];
  prices: Record<string, number>;
  onFinish: (result: RollResult) => void;
}

const PACK_RATES: Record<Rarity, { common: number; epic: number; legendary: number }> = {
  [Rarity.COMMON]: { common: 80, epic: 18.5, legendary: 1.5 },
  [Rarity.EPIC]: { common: 5, epic: 85, legendary: 10 },
  [Rarity.LEGENDARY]: { common: 5, epic: 10, legendary: 85 },
};

const RARITY_COLORS = {
  common: {
    bg: 'bg-gradient-to-br from-blue-600 to-blue-900',
    border: 'border-blue-500',
  },
  epic: {
    bg: 'bg-gradient-to-br from-purple-600 to-indigo-900',
    border: 'border-purple-500',
  },
  legendary: {
    bg: 'bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-600',
    border: 'border-yellow-400',
  },
};

export default function Roller({ rarity, skins, prices, onFinish }: RollerProps) {
  const [rolledSkin, setRolledSkin] = useState<Skin | null>(null);
  const hasRolled = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasRolled.current) return;
    hasRolled.current = true;

    if (!skins.length) return;

    const skin = rollSkin(skins);
    setRolledSkin(skin);

    setTimeout(() => {
      if (containerRef.current && itemRef.current) {
        startAnimation(skin);
      }
    }, 150);
  }, [skins]);

  function rollSkin(list: Skin[]): Skin {
    const rates = PACK_RATES[rarity];
    const roll = Math.random() * 100;

    let targetRarity: Rarity;
    if (roll < rates.common) {
      targetRarity = Rarity.COMMON;
    } else if (roll < rates.common + rates.epic) {
      targetRarity = Rarity.EPIC;
    } else {
      targetRarity = Rarity.LEGENDARY;
    }

    const candidates = list.filter((s) => {
      const skinRarity = (s.rarity || 'common').toLowerCase();
      return skinRarity === targetRarity.toLowerCase();
    });

    if (candidates.length > 0) {
      console.log(
        `[Roller] Pack: ${rarity}, Roll: ${roll.toFixed(2)}, Target: ${targetRarity}, Candidates: ${candidates.length}`,
      );
      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    console.warn(`[Roller] No skin found for target ${targetRarity} in pack ${rarity}. Falling back to random.`);
    return list[Math.floor(Math.random() * list.length)];
  }

  function startAnimation(skin: Skin) {
    const container = containerRef.current;
    const item = itemRef.current;
    if (!container || !item) return;

    const itemWidth = item.getBoundingClientRect().width;
    const targetIndex = 100;
    const containerCenter = container.parentElement!.offsetWidth / 2;
    const stopOffset = -(targetIndex * itemWidth - containerCenter + itemWidth / 2);

    container.style.transition = 'transform 4.5s cubic-bezier(.05,.8,.1,1)';
    container.style.transform = `translateX(${stopOffset}px)`;

    setTimeout(() => {
      handleFinish(skin);
    }, 4600);
  }

  function buildStrip(target: Skin) {
    const STRIP = [];
    const prePadding = 100;
    const postPadding = 100;

    for (let i = 0; i < prePadding; i++) STRIP.push(skins[Math.floor(Math.random() * skins.length)]);
    STRIP.push(target);
    for (let i = 0; i < postPadding; i++) STRIP.push(skins[Math.floor(Math.random() * skins.length)]);

    return STRIP;
  }

  const strip = useMemo(() => {
    return rolledSkin ? buildStrip(rolledSkin) : [];
  }, [rolledSkin]);

  function handleFinish(skin: Skin) {
    if (!skin) return;

    const isDuplicate = !!skin.isOwned;
    const skinRarity = (skin.rarity || 'common').toLowerCase();
    const basePrice = prices[skinRarity] || 0;
    const refund = isDuplicate ? Math.floor(basePrice * 0.5) : 0;

    onFinish({
      skin: skin,
      isDuplicate,
      refund,
    });
  }

  if (!skins.length) return <div>Loading...</div>;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
      <div className="w-[80%] max-w-5xl bg-gray-800 p-10 rounded-xl">
        <h1 className="text-center text-white text-2xl font-bold mb-8">Rolling...</h1>

        <div className="relative w-full h-40 bg-red overflow-hidden rounded-lg border border-white/20">
          <div ref={containerRef} className="flex items-center">
            {strip.map((skin, i) => {
              const rarityKey = (skin.rarity || 'common').toLowerCase() as keyof typeof RARITY_COLORS;
              const color = RARITY_COLORS[rarityKey];
              return (
                <div
                  key={i}
                  ref={i === 0 ? itemRef : null}
                  className={`flex-shrink-0 w-32 h-32 border-4 ${color.border} ${color.bg} flex items-center justify-center`}
                  style={{ margin: 0, padding: 0 }}
                >
                  <img src={skin.image} className="w-full h-full object-contain" />
                </div>
              );
            })}
          </div>
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/70 -translate-x-1/2"></div>
        </div>
      </div>
    </div>
  );
}
