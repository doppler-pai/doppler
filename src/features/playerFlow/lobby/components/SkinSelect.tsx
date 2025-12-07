'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Label } from '@/shared/components/ui/label';
import { getSkinData } from '@/shared/services/getSkinData';
import type { PackWithSkins } from '../models/skin.types';

type SkinSelectProps = {
  userId: string;
  selectedSkinId: string | null;
  onSelectSkin: (skinId: string) => void;
};

export function SkinSelect({ userId, selectedSkinId, onSelectSkin }: SkinSelectProps) {
  const [loading, setLoading] = useState(true);
  const [packs, setPacks] = useState<PackWithSkins[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const result = await getSkinData(userId);

      if (!result) {
        setLoading(false);
        return;
      }

      setPacks(result);
      setLoading(false);
    };

    void fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Choose your skin</Label>
        <p>Loading skins...</p>
      </div>
    );
  }

  if (packs.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Choose your skin</Label>
        <p>No skins available.</p>
      </div>
    );
  }

  const selectedSkin = packs.flatMap((pack) => pack.skins).find((skin) => skin.id === selectedSkinId);

  return (
    <div className="space-y-2">
      <Label>Choose your skin</Label>
      <div className="space-y-4">
        {packs.map((pack) => (
          <div key={pack.packId} className="space-y-2">
            <p className="text-sm font-medium">{pack.packName}</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {pack.skins.map((skin) => {
                const isSelected = selectedSkinId === skin.id;
                console.log(skin.image);

                return (
                  <button
                    key={skin.id}
                    type="button"
                    disabled={!skin.isOwned}
                    onClick={() => skin.isOwned && onSelectSkin(skin.id)}
                    className={`
                      relative aspect-square rounded-lg border-2 transition-all
                      ${isSelected ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-bg-dark' : 'border-border'}
                      ${skin.isOwned ? 'cursor-pointer hover:border-primary/50' : 'cursor-not-allowed opacity-40'}
                    `}
                    title={`${skin.name} (${skin.rarity})`}
                  >
                    <Image src={skin.image} alt={skin.name} fill className="rounded-md object-cover" />
                    {!skin.isOwned && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/60">
                        <span className="text-xs font-semibold text-white">🔒</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {selectedSkin && <p className="text-xs text-muted">Selected: {selectedSkin.name}</p>}
    </div>
  );
}
