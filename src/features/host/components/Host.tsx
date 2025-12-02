'use client';

import Image from 'next/image';

interface HostProps {
  gameId: string;
  setId: string;
}

export function Host({ gameId, setId }: HostProps) {
  return (
    <main className="flex h-screen w-full relative">
      <Image
        src="/images/host-background.png"
        height={500}
        width={500}
        alt="Host Background"
        className="absolute top-20 left-1/2 -translate-x-1/2"
      />
    </main>
  );
}
