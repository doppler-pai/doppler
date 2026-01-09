import { useEffect, useState } from 'react';

import { SetData } from '@/shared/models/sets.type';
import { getGameSet } from '../services/getGameSet';

export function useGameSet(gameId: string): { set: SetData | null; loading: boolean } {
  const [set, setSet] = useState<SetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId || gameId.trim() === '') {
      Promise.resolve().then(() => {
        setSet(null);
        setLoading(false);
      });
      return;
    }

    getGameSet(gameId)
      .then((data) => {
        setSet(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching game set:', error);
        setSet(null);
        setLoading(false);
      });
  }, [gameId]);

  return { set, loading };
}
