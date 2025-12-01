"use client";

import { useState } from "react";
import Roller, { Skin } from "@/features/roller/components/Roller";

interface Props {
  packType: "common" | "epic" | "legendary";
}

export default function OpenPack({ packType }: Props) {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<Skin | null>(null);

  return (
    <div>
      {!isRolling && (
        <button
          onClick={() => {
            setIsRolling(true);
            setResult(null);
          }}
          className="px-6 py-3 bg-blue-600 rounded-md"
        >
          OPEN {packType.toUpperCase()} PACK
        </button>
      )}

      {isRolling && (
        <Roller
          packType={packType}
          onFinish={(skin) => {
            setIsRolling(false);
            setResult(skin);
            console.log("Wylosowano:", skin);
          }}
        />
      )}

      {result && (
        <div className="mt-4 text-center">
          <h2>You got: {result.name}</h2>
          <img className="w-32 mx-auto" src={result.image} />
        </div>
      )}
    </div>
  );
}
