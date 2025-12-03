'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { auth, db } from '@/shared/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Rarity } from '@/shared/models/rarity';
import { handleBuyService } from '../services/handleBuy';
import { getSkinData } from '@/shared/services/getSkinData';
import type { PackWithSkins, SkinWithOwnership } from '@/features/lobby/models/skin.types';

import { Button } from '@/shared/components/ui/button';
import { PackSection } from './PackSection';
import Roller, { type RollResult } from './Roller';

export default function Market() {
  const [coins, setCoins] = useState<number | null>(null);
  const [skinsCount, setSkinsCount] = useState<number | null>(null);
  const [packs, setPacks] = useState<PackWithSkins[]>([]);
  const [rollingRarity, setRollingRarity] = useState<Rarity | null>(null);
  const [rollingSkins, setRollingSkins] = useState<SkinWithOwnership[]>([]);
  const [rollResult, setRollResult] = useState<RollResult | null>(null);
  const [rollKey, setRollKey] = useState(0);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCoins(null);
        setSkinsCount(null);
        setPacks([]);
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

      // Fetch packs
      getSkinData(user.uid).then((result) => {
        if (result) {
          setPacks(result);
        }
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const handleBuy = async (packId: string, rarity: Rarity, price: number) => {
    const user = auth.currentUser;
    if (!user || coins === null) return;

    if (coins < price) {
      alert('Not enough coins!');
      return;
    }

    const result = await handleBuyService({
      userId: user.uid,
      price,
    });

    if (!result) {
      return;
    }

    const pack = packs.find((p) => p.packId === packId);
    if (!pack) return;

    setCoins(result);
    setRollingRarity(rarity);
    setRollingSkins(pack.skins);
    setRollKey((k) => k + 1);
  };

  const handleRollFinish = async (result: RollResult) => {
    const { skin, isDuplicate, refund } = result;
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, 'users', user.uid);

    if (isDuplicate) {
      // Refund currency for duplicate
      await updateDoc(ref, {
        currency: increment(refund),
      });
    } else {
      // Add skin to owned skins in Firestore
      await updateDoc(ref, {
        ownedSkinIds: arrayUnion(skin.id),
      });

      // Update local state to mark skin as owned (for future rolls in same session)
      setPacks((prevPacks) =>
        prevPacks.map((pack) => ({
          ...pack,
          skins: pack.skins.map((s) => (s.id === skin.id ? { ...s, isOwned: true } : s)),
        })),
      );
    }

    setRollingRarity(null);
    setRollingSkins([]);
    setRollResult(result);
  };

  const closeResult = () => {
    setRollResult(null);
  };

  return (
    <div className="w-full">
      <div className="w-full h-16 flex items-center px-12 justify-between">
        <h1 className="mt-10 ml-12">Dopple Market</h1>
        <div className="flex items-center gap-8 mt-10 mr-12">
          <Button variant="outline" className="flex items-center gap-1">
            {coins !== null ? coins : '...'}
            <Image src="/logo/logo.png" alt="coins" width={16} height={16} />
          </Button>
          <Button variant="outline">Skins owned: {skinsCount !== null ? skinsCount : '...'}</Button>
          <Link href="/mydopples">
            <Button>My skin</Button>
          </Link>
        </div>
      </div>

      {packs.map((pack) => (
        <PackSection
          key={pack.packId}
          packName={pack.packName}
          packId={pack.packId}
          rarities={pack.rarities}
          onBuy={handleBuy}
        />
      ))}

      {rollingRarity && (
        <Roller key={rollKey} rarity={rollingRarity} skins={rollingSkins} onFinish={handleRollFinish} />
      )}

      {rollResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-bg-dark rounded-xl p-8 shadow-2xl border border-border w-[90%] max-w-md text-center">
            <h2 className="mb-4">You got:</h2>
            <div className="mb-4">
              <Image
                src={rollResult.skin.image}
                alt={rollResult.skin.name}
                width={160}
                height={160}
                className="mx-auto rounded-lg"
              />
            </div>
            <h3 className="mb-2">{rollResult.skin.name}</h3>
            <p className="text-sm text-text-muted capitalize mb-4">{rollResult.skin.rarity}</p>
            {rollResult.isDuplicate && (
              <p className="text-yellow-400 mb-4">Duplicate! +{rollResult.refund} coins refunded</p>
            )}
            <Button onClick={closeResult}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}
