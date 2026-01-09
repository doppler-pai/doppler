import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';

import { rtdb } from '@/shared/lib/firebase';
import { PlayerData } from '@/shared/models/lobby.types';
import { transformPlayersData, PlayerWithSkin } from '../services/getGamePlayers';

// Re-export for convenience
export type { PlayerWithSkin };

/**
 * Hook that listens to game players in real-time.
 * Automatically updates when players join, leave, or change their skins.
 */
export function useGamePlayers(gameId: string): { players: PlayerWithSkin[]; loading: boolean } {
  const [players, setPlayers] = useState<PlayerWithSkin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId || gameId.trim() === '') {
      // Use a microtask to avoid synchronous setState
      Promise.resolve().then(() => {
        setPlayers([]);
        setLoading(false);
      });
      return;
    }

    const playersRef = ref(rtdb, `lobbies/${gameId}/players`);

    const unsubscribe = onValue(
      playersRef,
      async (snapshot) => {
        const playersData = snapshot.exists() ? (snapshot.val() as Record<string, PlayerData>) : null;
        const playersWithSkins = await transformPlayersData(playersData);
        setPlayers(playersWithSkins);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to game players:', error);
        setPlayers([]);
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [gameId]);

  return { players, loading };
}
