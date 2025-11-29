'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/shared/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';


import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { PackCard } from '@/features/market/PackCard';
import Link from 'next/link';

export default function Market() {
  const [coins, setCoins] = useState<number | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCoins(null);
        return;
      }
  
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);

      console.log("DOC DATA:", snap.data());
  
      if (snap.exists()) {
        setCoins(snap.data().currency ?? 0);
      }
    });
  
    return () => unsubscribe();
  }, []);
  

  return (
    <div className="w-full">
      <div className="w-full h-16 flex items-center px-12 justify-between">
        <h1 className="mt-10 ml-12">Dopple Market</h1>
        <div className="flex items-center gap-8 mt-10 mr-12">
          <Button variant={'outline'} className="flex items-center gap-1">
            {coins !== null ? coins : '...'}
            <img src="/logo/logo.png" className="w-4 h-4" />
          </Button>
          <Button variant={'outline'}>Skins owned: </Button>
          <Link href="/mydopples">
            <Button>My skin</Button>
          </Link>
        </div>
      </div>
      <div className="w-full h-24 mt-24">
        <div className="ml-24 w-[900px]">
          <h2 className="ml-2 mb-2">Clash Royale</h2>
          <Separator className="bg-white" />
        </div>
      </div>
      <div className="ml-38 flex gap-36">
        <PackCard variant="common"></PackCard>
        <PackCard variant="epic"></PackCard>
        <PackCard variant="legendary"></PackCard>
      </div>
    </div>
  );
}
