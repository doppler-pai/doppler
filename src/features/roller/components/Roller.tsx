'use client';

import { useEffect, useRef, useState } from 'react';
import { Rarity } from '@/shared/models/rarity';
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
  Rarity: Rarity;
  onFinish: (skin: Skin) => void;
}

const PACK_RATES: Record<Rarity, { common: number; epic: number; legendary: number }> = {
  [Rarity.COMMON]: { common: 80, epic: 18.5, legendary: 1.5 },
  [Rarity.EPIC]: { common: 5, epic: 85, legendary: 10 },
  [Rarity.LEGENDARY]: { common: 5, epic: 10, legendary: 85 },
};

const RARITY_COLORS = {
  common: {
    border: 'border-gray-400',
    glow: 'shadow-[0_0_15px_rgba(156,163,175,0.4)]',
    bg: 'bg-gray-400/5',
  },
  epic: {
    border: 'border-purple-500',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]',
    bg: 'bg-purple-500/5',
  },
  legendary: {
    border: 'border-yellow-400',
    glow: 'shadow-[0_0_25px_rgba(250,204,21,0.6)]',
    bg: 'bg-yellow-400/5',
  },
};

export default function Roller({ Rarity, onFinish }: RollerProps) {
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

    const rarity = rollRarity(PACK_RATES[Rarity]);
    const skin = rollSkin(skins, rarity);

    setRolledSkin(skin);
    setRolledRarity(rarity);

    setTimeout(() => {
      if (containerRef.current && itemRef.current) {
        startAnimation(skin);
      }
    }, 150);
  }, [skins, Rarity]);

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
    if (skins.common.some((s) => s.id === skin.id)) return 'common';
    if (skins.epic.some((s) => s.id === skin.id)) return 'epic';
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

    const stopOffset = -(targetIndex * itemWidth - containerCenter + itemWidth / 2);

    container.style.transition = 'transform 4.5s cubic-bezier(.05,.8,.1,1)';
    container.style.transform = `translateX(${stopOffset}px)`;

    setTimeout(() => {
      setShowResult(true);
    }, 4600);
  }

  if (!skins) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black backdrop-blur-sm">
        <div className="text-white text-2xl font-semibold animate-pulse">Loading pack...</div>
      </div>
    );
  }

  if (showResult && rolledSkin) {
    const colors = RARITY_COLORS[rolledRarity];

    return (
      <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center backdrop-blur-md">
        <div
          className={`relative p-12 rounded-3xl border-4 ${colors.border} ${colors.glow} bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 max-w-2xl`}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
            <div className={`px-8 py-2 rounded-full border-2 ${colors.border} ${colors.bg} backdrop-blur-sm`}>
              <span className="text-white font-bold text-lg uppercase tracking-wider">{rolledRarity}</span>
            </div>
          </div>

          <h1 className="text-white text-4xl text-center mb-8 mt-4 font-bold tracking-wide">You Got:</h1>

          <div
            className={`w-64 h-64 mx-auto border-4 ${colors.border} ${colors.glow} rounded-2xl flex items-center justify-center ${colors.bg} p-4`}
          >
            <img src={rolledSkin.image} className="w-full h-full object-contain drop-shadow-2xl" />
          </div>

          <h2 className="text-white text-center text-3xl mt-8 font-bold">{rolledSkin.name}</h2>

          <button
            onClick={() => onFinish(rolledSkin)}
            className={`block mt-10 mx-auto px-12 py-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 border-2 ${colors.border}`}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black backdrop-blur-sm">
      <div className="w-[80%] max-w-5xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-10 rounded-2xl shadow-2xl border border-white/20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-pink-500/5 animate-pulse rounded-2xl pointer-events-none"></div>

        <div className="relative z-10">
          <h1 className="text-center text-white text-3xl font-bold mb-2 tracking-wide">
            Opening {Rarity.charAt(0).toUpperCase() + Rarity.slice(1)} Pack
          </h1>
          <p className="text-center text-gray-400 text-sm mb-8">Watch carefully...</p>

          <div className="relative w-full h-48 bg-black/70 overflow-hidden rounded-xl border border-white/10 shadow-inner">
            <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-black/70 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-black/70 to-transparent z-10 pointer-events-none"></div>

            <div ref={containerRef} className="flex items-center h-full py-8 will-change-transform">
              {strip.map((skin, i) => {
                const rarity = getRarityForSkin(skin);
                const colors = RARITY_COLORS[rarity];

                return (
                  <div
                    key={i}
                    ref={i === 0 ? itemRef : null}
                    className={`flex-shrink-0 w-32 h-32 border-2 ${colors.border} ${colors.bg} ${colors.glow} rounded-lg flex items-center justify-center p-2`}
                    style={{
                      margin: 0,
                      padding: '8px',
                    }}
                  >
                    <img src={skin.image} className="w-full h-full object-contain drop-shadow-lg" />
                  </div>
                );
              })}
            </div>
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white to-transparent opacity-80 -translate-x-1/2 z-20"></div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-white rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.5)] z-20 pointer-events-none">
              <div className="absolute inset-0 bg-white/5 rounded-lg"></div>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/30 animate-pulse"
                  style={{ animationDelay: `${i * 0.15}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
