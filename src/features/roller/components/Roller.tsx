'use client';

import { useEffect, useRef, useState } from 'react';
import { PackType } from '@/shared/models/PackType';

export interface Skin {
  id: string;
  name: string;
  image: string;
}

export interface SkinsData {
  common: Skin[];
  epic: Skin[];
  legendary: Skin[];
}

interface RollerProps {
  packType: PackType;
  onFinish: (skin: Skin) => void;
}

const PACK_RATES: Record<PackType, { common: number, epic: number, legendary: number }> = {
  [PackType.COMMON]: { common: 80, epic: 18.5, legendary: 1.5 },
  [PackType.EPIC]: { common: 5, epic: 85, legendary: 10 },
  [PackType.LEGENDARY]: { common: 5, epic: 10, legendary: 85 },
};

const RARITY_COLORS = {
  common: 'border-gray-400',
  epic: 'border-purple-500',
  legendary: 'border-yellow-400',
};

export default function Roller({ packType, onFinish }: RollerProps) {
  const [skins, setSkins] = useState<SkinsData | null>(null);
  const [rolledSkin, setRolledSkin] = useState<Skin | null>(null);
  const [rolledRarity, setRolledRarity] = useState<keyof SkinsData>('common');
  const [showResult, setShowResult] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch('/data/skins.json');
      const data = await res.json();
      setSkins(data);
    }
    load();
  }, []);

  useEffect(() => {
    if (!skins) return;

    const rarity = rollRarity(PACK_RATES[packType]);
    const skin = rollSkin(skins, rarity);

    setRolledSkin(skin);
    setRolledRarity(rarity);

    setTimeout(() => {
      if (containerRef.current && itemRef.current) {
        startAnimation(skin);
      }
    }, 150);
  }, [skins, packType]);

  function rollRarity(rates: Record<string, number>): keyof SkinsData {
    const r = Math.random() * 100;
    let sum = 0;

    for (const rarity in rates) {
      sum += rates[rarity];
      if (r <= sum) {
        return rarity as keyof SkinsData;
      }
    }
    return 'common';
  }

  function rollSkin(skins: SkinsData, rarity: keyof SkinsData): Skin {
    const list = skins[rarity];
    return list[Math.floor(Math.random() * list.length)];
  }

  function getRarityForSkin(skin: Skin): keyof SkinsData {
    if (!skins) return 'common';
    if (skins.common.some(s => s.id === skin.id)) return 'common';
    if (skins.epic.some(s => s.id === skin.id)) return 'epic';
    return 'legendary';
  }

  function buildStrip(target: Skin) {
    const all = Object.values(skins!).flat();

    const STRIP = [];

    const prePadding = 100;  
    const postPadding = 100;

    for (let i = 0; i < prePadding; i++) STRIP.push(all[Math.floor(Math.random() * all.length)]);

    STRIP.push(target);

    for (let i = 0; i < postPadding; i++) STRIP.push(all[Math.floor(Math.random() * all.length)]);

    return STRIP;
  }

  const strip = rolledSkin ? buildStrip(rolledSkin) : [];

  function startAnimation(target: Skin) {
    const container = containerRef.current;
    const item = itemRef.current;
    if (!container || !item) return;

    const itemWidth = item.getBoundingClientRect().width;

    const targetIndex = 100;

    const containerCenter = container.parentElement!.offsetWidth / 2;

    const stopOffset =
      -(targetIndex * itemWidth - containerCenter + itemWidth / 2);

    container.style.transition = 'transform 4.5s cubic-bezier(.05,.8,.1,1)';
    container.style.transform = `translateX(${stopOffset}px)`;

    setTimeout(() => {
      setShowResult(true);
    }, 4600);
  }

  if (!skins) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 text-white text-xl">
        Loading...
      </div>
    );
  }

  if (showResult && rolledSkin) {
    const color = RARITY_COLORS[rolledRarity];

    return (
      <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center">
        <div className={`p-10 rounded-3xl border-4 ${color} bg-gray-900`}>
          <h1 className="text-white text-3xl text-center mb-6 font-bold">
            You got:
          </h1>

          <div className="w-64 h-64 mx-auto border-4 rounded-xl flex items-center justify-center bg-black">
            <img src={rolledSkin.image} className="w-full h-full object-contain" />
          </div>

          <h2 className="text-white text-center text-2xl mt-6 font-bold">
            {rolledSkin.name}
          </h2>

          <button
            onClick={() => onFinish(rolledSkin)}
            className="block mt-8 mx-auto px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
      <div className="w-[80%] max-w-5xl bg-gray-800 p-10 rounded-xl">

        <h1 className="text-center text-white text-2xl font-bold mb-8">
          Rolling...
        </h1>

        <div className="relative w-full h-40 bg-black overflow-hidden rounded-lg border border-white/20">
          
          <div ref={containerRef} className="flex items-center">
            {strip.map((skin, i) => {
              const rarity = getRarityForSkin(skin);
              const color = RARITY_COLORS[rarity];

              return (
                <div
                  key={i}
                  ref={i === 0 ? itemRef : null}
                  className={`flex-shrink-0 w-32 h-32 border-4 ${color} bg-gray-900 flex items-center justify-center`}
                  style={{
                    margin: 0,
                    padding: 0,
                  }}
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
