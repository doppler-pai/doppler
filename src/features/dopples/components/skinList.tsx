'use client';

import Image from 'next/image';
import { cn } from '@/shared/lib/utils';
import type { PackWithSkins } from '@/features/playerFlow/lobby/models/skin.types';

type SkinListProps = {
  packs: PackWithSkins[];
  selectedSkinId?: string | null;
  onSelectSkin?: (skinId: string) => void;
  readonly?: boolean;
};

export function SkinList({ packs, selectedSkinId, onSelectSkin, readonly = false }: SkinListProps) {
  if (packs.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <p>No skins available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {packs.map((pack) => (
        <div key={pack.packId} className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">{pack.packName}</h2>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {pack.skins.map((skin) => {
              const isSelected = selectedSkinId === skin.id;
              const canSelect = !readonly && skin.isOwned;

              return (
                <div key={skin.id} className="group relative space-y-1.5 text-center">
                  <button
                    type="button"
                    disabled={!canSelect}
                    onClick={() => canSelect && onSelectSkin?.(skin.id)}
                    className={cn(
                      'relative aspect-square w-full overflow-hidden rounded-xl border-2 transition-all',
                      isSelected
                        ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-bg-dark'
                        : 'border-border',
                      canSelect ? 'cursor-pointer hover:border-primary/50' : 'cursor-default opacity-60',
                      readonly && 'opacity-100',
                    )}
                    title={`${skin.name} (${skin.rarity})`}
                  >
                    <Image
                      src={skin.image}
                      alt={skin.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw"
                    />

                    {!skin.isOwned && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
                        <span className="text-xl">🔒</span>
                      </div>
                    )}
                  </button>
                  <p className="truncate text-xs font-medium text-muted-foreground">{skin.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
