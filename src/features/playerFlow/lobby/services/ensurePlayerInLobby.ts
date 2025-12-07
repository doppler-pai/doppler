import { child, get, ref, update } from 'firebase/database';

import { rtdb } from '@/shared/lib/firebase';

export type EnsurePlayerInLobbyParams = {
  gameId: string;
  playerId: string;
  nick: string;
  skinId: string;
};

export type EnsurePlayerInLobbyResult =
  | {
      success: true;
      alreadyJoined: boolean;
      nick: string;
      skinId: string;
    }
  | {
      success: false;
      error: string;
    };

export async function ensurePlayerInLobby({
  gameId,
  playerId,
  nick,
  skinId,
}: EnsurePlayerInLobbyParams): Promise<EnsurePlayerInLobbyResult> {
  const trimmedNick = nick.trim();

  if (!trimmedNick) {
    return {
      success: false,
      error: 'Nickname cannot be empty.',
    };
  }

  if (!skinId) {
    return {
      success: false,
      error: 'Please select a skin.',
    };
  }

  try {
    const playersRef = child(ref(rtdb), `lobbies/${gameId}/players`);
    const snapshot = await get(playersRef);
    const players = (snapshot.exists() ? snapshot.val() : {}) as Record<string, { nick: string; skinId: string }>;

    const existingPlayer = players[playerId];

    if (existingPlayer) {
      return {
        success: true,
        alreadyJoined: true,
        nick: existingPlayer.nick,
        skinId: existingPlayer.skinId,
      };
    }

    // New player
    const playerData = {
      nick: trimmedNick,
      skinId,
    };

    await update(playersRef, {
      [playerId]: playerData,
    });

    return {
      success: true,
      alreadyJoined: false,
      nick: trimmedNick,
      skinId,
    };
  } catch (error) {
    console.error('Error ensuring player in lobby:', error);
    return {
      success: false,
      error: 'Unable to join lobby. Please try again.',
    };
  }
}
