'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { auth, db } from '@/shared/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Rarity } from '@/shared/models/rarity';
import { handleBuyService } from '../services/handleBuy';
import { getSkinData } from '@/shared/services/getSkinData';
import type { PackWithSkins, SkinWithOwnership } from '@/features/playerFlow/lobby/models/skin.types';

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

  // Calculate prices map for Roller to use in refunds
  const rarityPrices = useMemo(() => {
    const prices: Record<string, number> = {};
    packs.forEach((pack) => {
      Object.entries(pack.rarities).forEach(([rarity, config]) => {
        prices[rarity.toLowerCase()] = config.price;
      });
    });
    return prices;
  }, [packs]);

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
    <div className="min-h-screen w-full pb-20">
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 md:px-12 py-8 gap-6">
        <h1 className="text-3xl md:text-4xl font-bold text-center md:text-left">Dopple Market</h1>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button variant="outline" className="flex items-center gap-2 min-w-[100px]">
            {coins !== null ? coins : '...'}
            <Image src="/logo/logo.png" alt="coins" width={16} height={16} />
          </Button>
          <Button variant="outline" className="min-w-[120px]">
            Owned: {skinsCount !== null ? skinsCount : '...'}
          </Button>
          <Link href="/mydopples">
            <Button>My Skins</Button>
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

      {rollingRarity && rollingSkins.length > 0 && (
        <Roller
          key={rollKey}
          rarity={rollingRarity}
          skins={rollingSkins.map((skin) => ({ ...skin, rarity: skin.rarity as Rarity }))}
          prices={rarityPrices}
          onFinish={handleRollFinish}
        />
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
