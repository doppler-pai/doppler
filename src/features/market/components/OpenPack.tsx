'use client';

import { useState } from 'react';
import Image from 'next/image';
import Roller, { type RollResult } from '@/features/market/components/Roller';
import { Rarity } from '@/shared/models/rarity';
import type { SkinWithOwnership } from '@/features/lobby/models/skin.types';

type OpenPackProps = {
  rarity: Rarity;
  skins: SkinWithOwnership[];
  onFinish?: (result: RollResult) => void;
};

export default function OpenPack({ rarity, skins, onFinish }: OpenPackProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<RollResult | null>(null);

  const handleFinish = (rollResult: RollResult) => {
    setIsRolling(false);
    setResult(rollResult);
    onFinish?.(rollResult);
  };

  return (
    <div>
      {!isRolling && !result && (
        <button
          onClick={() => {
            setIsRolling(true);
            setResult(null);
          }}
          className="px-6 py-3 bg-blue-600 rounded-md"
        >
          OPEN {rarity.toUpperCase()} PACK
        </button>
      )}

      {isRolling && <Roller rarity={rarity} skins={skins} onFinish={handleFinish} />}

      {result && (
        <div className="mt-4 text-center">
          <h2>You got: {result.skin.name}</h2>
          {result.isDuplicate && <p className="text-yellow-400">Duplicate! +{result.refund} coins refunded</p>}
          <Image src={result.skin.image} alt={result.skin.name} width={128} height={128} className="mx-auto" />
        </div>
      )}
    </div>
  );
}
