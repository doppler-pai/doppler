'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { getSkinData } from '@/shared/services/getSkinData';
import { SkinList } from '@/features/dopples/components/skinList';
import type { PackWithSkins } from '@/features/playerFlow/lobby/models/skin.types';

export function MyDopples() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [packs, setPacks] = useState<PackWithSkins[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const result = await getSkinData(user.uid);

        if (result) {
          setPacks(result);
        }
      } catch (error) {
        console.error('Failed to fetch skins:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading your collection...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">My Dopples</h1>
      </div>

      <SkinList packs={packs} readonly />
    </div>
  );
}
