import { ref, update } from 'firebase/database';

import { rtdb } from '@/shared/lib/firebase';
import { GameModeType, LobbyStatus } from '@/shared/models/lobby.types';
import { initializeQuizGame } from '../../hostGame/services/initializeQuizGame';

export async function startGame(gameId: string, gameType: GameModeType): Promise<void> {
  const lobbyRef = ref(rtdb, `lobbies/${gameId}`);

  await update(lobbyRef, {
    status: LobbyStatus.IN_PROGRESS,
  });

  // Initialize game-specific metadata
  if (gameType === GameModeType.QUIZ) {
    await initializeQuizGame(gameId);
  }
}
