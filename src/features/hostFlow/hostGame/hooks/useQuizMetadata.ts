import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';

import { rtdb } from '@/shared/lib/firebase';
import { QuizMetadata } from '@/shared/models/lobby.types';

export function useQuizMetadata(gameId: string): { metadata: QuizMetadata | null; loading: boolean } {
  const [metadata, setMetadata] = useState<QuizMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId || gameId.trim() === '') {
      Promise.resolve().then(() => {
        setMetadata(null);
        setLoading(false);
      });
      return;
    }

    const metadataRef = ref(rtdb, `lobbies/${gameId}/metadata`);

    const unsubscribe = onValue(
      metadataRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setMetadata(snapshot.val() as QuizMetadata);
        } else {
          setMetadata(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to quiz metadata:', error);
        setMetadata(null);
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [gameId]);

  return { metadata, loading };
}
