'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { getSkinData } from '@/shared/services/getSkinData';
import { SkinList } from '@/features/dopples/components/skinList';
import type { PackWithSkins } from '@/features/playerFlow/lobby/models/skin.types';

import { db } from '@/shared/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';

export function MyDopples() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [packs, setPacks] = useState<PackWithSkins[]>([]);

  // NEW (snapshot same as Market)
  const [coins, setCoins] = useState<number | null>(null);
  const [skinsCount, setSkinsCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    const ref = doc(db, 'users', user.uid);

    // snapshot for coins + owned skins
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();
      setCoins(data.currency ?? 0);
      setSkinsCount((data.ownedSkinIds ?? []).length);
    });

    return () => unsub();
  }, [user]);

  // load skins
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const result = await getSkinData(user.uid);
        if (result) setPacks(result);
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
    <div className="min-h-screen w-full pb-20">
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 md:px-12 py-8 gap-6">
        <h1 className="text-3xl md:text-4xl font-bold text-center md:text-left">My Dopples</h1>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button variant="outline" className="flex items-center gap-2 min-w-[100px]">
            {coins !== null ? coins : '...'}
            <Image src="/logo/logo.png" alt="coins" width={16} height={16} />
          </Button>

          <Button variant="outline" className="min-w-[120px]">
            Owned: {skinsCount !== null ? skinsCount : '...'}
          </Button>

          <Link href="/market">
            <Button>Market</Button>
          </Link>
        </div>
      </div>

      {/* LISTA */}
      <div className="container mx-auto max-w-5xl pb-8 px-4">
        <SkinList packs={packs} readonly />
      </div>
    </div>
  );
}
