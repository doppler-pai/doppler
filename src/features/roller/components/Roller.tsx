'use client';

import { useEffect, useRef, useState } from 'react';

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
  packType: 'common' | 'epic' | 'legendary';
  onFinish: (skin: Skin) => void;
}

const PACK_RATES = {
  common: { common: 80, epic: 18.5, legendary: 1.5 },
  epic: { common: 5, epic: 85, legendary: 10 },
  legendary: { common: 5, epic: 10, legendary: 85 },
};

export default function Roller({ packType, onFinish }: RollerProps) {
  const [skins, setSkins] = useState<SkinsData | null>(null);
  const [rolledSkin, setRolledSkin] = useState<Skin | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

    runAnimation(skin, skins);
  }, [skins]);

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

  function runAnimation(target: Skin, skins: SkinsData) {
    const container = containerRef.current;
    if (!container) return;

    const itemWidth = 120;
    const repeat = 50;

    const all = Object.values(skins).flat();
    const targetIndex = repeat * all.length + all.findIndex((s) => s.id === target.id);

    const stopOffset = -(targetIndex * itemWidth) + 300;

    container.style.transition = 'transform 5s cubic-bezier(0.1, 0.9, 0.2, 1)';
    container.style.transform = `translateX(${stopOffset}px)`;

    setTimeout(() => onFinish(target), 5000);
  }

  if (!skins) return <p className="text-center">Loading...</p>;

  const allSkins = Object.values(skins).flat();

  return (
    <div className="relative w-full h-40 bg-black/60 overflow-hidden border rounded-md">
      <div ref={containerRef} className="flex gap-4" style={{ transform: 'translateX(0px)' }}>
        {Array(100)
          .fill(0)
          .flatMap((_, i) =>
            allSkins.map((skin) => (
              <img key={skin.id + '-' + i + '-' + Math.random()} src={skin.image} className="w-24 h-24 object-contain" />
            )),
          )}
      </div>

      <div className="absolute left-1/2 top-0 w-[3px] h-full bg-red-500"></div>
    </div>
  );
}
