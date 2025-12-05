'use client';

import { useState, useEffect } from 'react';
import { SkinSelect } from './SkinSelect';
import { updatePlayerSkin } from '../services/updatePlayerSkin';
import { getSkinData } from '@/shared/services/getSkinData';
import { PlayerCard } from '@/shared/components/player/PlayerCard';

type PostLobbyProps = {
  gameId: string;
  userId: string;
  nick: string;
  selectedSkinId: string;
  onSkinChange: (skinId: string) => void;
};

export const PostLobby = ({ gameId, userId, nick, selectedSkinId, onSkinChange }: PostLobbyProps) => {
  const [skinImageUrl, setSkinImageUrl] = useState<string | null>(null);
  const [isUpdatingSkin, setIsUpdatingSkin] = useState(false);

  useEffect(() => {
    const fetchSkinImage = async () => {
      const result = await getSkinData(userId);
      if (!result) return;

      const allSkins = result.flatMap((pack) => pack.skins);
      const currentSkin = allSkins.find((skin) => skin.id === selectedSkinId);
      if (currentSkin) {
        setSkinImageUrl(currentSkin.image);
      }
    };

    void fetchSkinImage();
  }, [userId, selectedSkinId]);

  const handleSkinSelect = async (skinId: string) => {
    setIsUpdatingSkin(true);
    const result = await updatePlayerSkin({
      gameId,
      playerId: userId,
      skinId,
    });

    if (result.success) {
      onSkinChange(skinId);
    }

    setIsUpdatingSkin(false);
  };

  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-xl border bg-bg-dark p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-semibold">Lobby</h1>

        {skinImageUrl && (
          <div className="mb-6">
            <PlayerCard image={skinImageUrl} nick={nick} />
          </div>
        )}

        <div className="space-y-4">
          <SkinSelect userId={userId} selectedSkinId={selectedSkinId} onSelectSkin={handleSkinSelect} />
          {isUpdatingSkin && <p className="text-xs text-muted">Updating skin...</p>}
        </div>
      </div>
    </div>
  );
};
