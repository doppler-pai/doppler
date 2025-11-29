'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { PackCard } from '@/features/market/PackCard';
import Link from 'next/link';

export default function Market() {
  const router = useRouter();

  return (
    <div className="w-full">
      <div className="w-full h-16 flex items-center px-12 justify-between">
        <h1 className="mt-10 ml-12">Dopple Market</h1>
        <div className="flex items-center gap-8 mt-10 mr-12">
          <Button variant={'outline'}>
            value
            <img src="/logo/logo.png" className='w-4 h-4' />
          </Button>
          <Button variant={'outline'}>Skins owned: </Button>
          <Link href="/mydopples">
            <Button>My skin</Button>
          </Link>
        </div>
      </div>
      <div className="w-full h-24 mt-20">
        <div className="ml-24 w-[850px]">
          <h2 className="ml-2 mb-2">Clash Royale</h2>
          <Separator className="bg-white" />
        </div>
      </div>
      <div className='ml-12'>
        <PackCard variant='common'></PackCard>
      </div>
    </div>
  );
}
