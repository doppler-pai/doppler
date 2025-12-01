'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/shared/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { PackCard } from '@/features/market/PackCard';
import OpenPack, { Skin } from '@/features/roller/components/Roller';
import Link from 'next/link';

export default function Market() {
  const [coins, setCoins] = useState<number | null>(null);
  const [skinsCount, setSkinsCount] = useState<number | null>(null);
  const [rollingPack, setRollingPack] = useState<'common' | 'epic' | 'legendary' | null>(null);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCoins(null);
        setSkinsCount(null);
        return;
      }

      const ref = doc(db, 'users', user.uid);

      unsubscribeSnapshot = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setCoins(data.currency ?? 0);
          setSkinsCount((data.ownedSkinIds ?? []).length);
        }
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const handleBuy = async (packType: 'common' | 'epic' | 'legendary', price: number) => {
    const user = auth.currentUser;
    if (!user || coins === null) return;

    if (coins < price) {
      alert('Not enough coins!');
      return;
    }

    const newCoins = coins - price;
    const ref = doc(db, 'users', user.uid);
    await updateDoc(ref, { currency: newCoins });
    setCoins(newCoins);

    setRollingPack(packType);
  };

  const handleRollFinish = async (skin: Skin) => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, 'users', user.uid);
    await updateDoc(ref, {
      ownedSkinIds: arrayUnion(skin.id),
    });

    setRollingPack(null);
  };

  return (
    <div className="w-full">
      <div className="w-full h-16 flex items-center px-12 justify-between">
        <h1 className="mt-10 ml-12">Dopple Market</h1>
        <div className="flex items-center gap-8 mt-10 mr-12">
          <Button variant="outline" className="flex items-center gap-1">
            {coins !== null ? coins : '...'}
            <img src="/logo/logo.png" className="w-4 h-4" />
          </Button>
          <Button variant="outline">
            Skins owned: {skinsCount !== null ? skinsCount : '...'}
          </Button>
          <Link href="/mydopples">
            <Button>My skin</Button>
          </Link>
        </div>
      </div>

      <div className="w-full h-24 mt-20">
        <div className="ml-24 w-[900px]">
          <h2 className="ml-2 mb-2">Clash Royale</h2>
          <Separator className="bg-white" />
        </div>
      </div>

      <div className="ml-38 flex gap-36">
        <PackCard variant="common" onBuy={(price) => handleBuy('common', price)} />
        <PackCard variant="epic" onBuy={(price) => handleBuy('epic', price)} />
        <PackCard variant="legendary" onBuy={(price) => handleBuy('legendary', price)} />
      </div>

      {rollingPack && (
        <OpenPack
          packType={rollingPack}
          onFinish={handleRollFinish}
        />
      )}

      <div className="w-full h-24 mt-16">
        <div className="ml-24 w-[900px]">
          <h2 className="ml-2 mb-2">Brainrot</h2>
          <Separator className="bg-white" />
        </div>
      </div>

      <div className="ml-38 flex gap-36">
        <PackCard variant="common" onBuy={(price) => handleBuy('common', price)} />
        <PackCard variant="epic" onBuy={(price) => handleBuy('epic', price)} />
        <PackCard variant="legendary" onBuy={(price) => handleBuy('legendary', price)} />
      </div>
    </div>
  );
}
