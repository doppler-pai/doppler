import { ref, update } from 'firebase/database';

import { rtdb } from '@/shared/lib/firebase';
import { LobbyStatus } from '@/shared/models/lobby.types';

export async function startGame(gameId: string): Promise<void> {
  const lobbyRef = ref(rtdb, `lobbies/${gameId}`);

  await update(lobbyRef, {
    status: LobbyStatus.IN_PROGRESS,
  });
}
