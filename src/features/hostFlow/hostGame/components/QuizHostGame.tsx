'use client';

import { useMemo } from 'react';
import { GameLayout } from './GameLayout';
import { useQuizMetadata } from '../hooks/useQuizMetadata';
import { useGameSet } from '../hooks/useGameSet';
import { useGamePlayers } from '../../host/hooks/useGamePlayers';
import { LeaderboardEntry } from '@/shared/models/leaderboard.types';

type QuizHostGameProps = {
  gameId: string;
};

export function QuizHostGame({ gameId }: QuizHostGameProps) {
  const { metadata, loading: metadataLoading } = useQuizMetadata(gameId);
  const { set, loading: setLoading } = useGameSet(gameId);
  const { players, loading: playersLoading } = useGamePlayers(gameId);

  const totalQuestions = set?.questions.length ?? 0;
  const currentRound = metadata?.currentRound ?? 0;
  const progress = totalQuestions > 0 ? currentRound / totalQuestions : 0;

  const leaderboardEntries: LeaderboardEntry[] = useMemo(() => {
    if (!metadata?.points || players.length === 0) return [];

    return players
      .map((player) => ({
        playerId: player.id ?? '',
        playerName: player.nick ?? 'Unknown',
        imagePath: player.skinImage ?? '/skins/clashRoyale/skeleton.png',
        points: metadata.points[player.id ?? ''] ?? 0,
      }))
      .sort((a, b) => b.points - a.points)
      .map(({ playerId, playerName, imagePath, points }) => ({
        playerId,
        playerName,
        imagePath,
        label: `Points: ${points}`,
      }));
  }, [metadata, players]);

  if (metadataLoading || setLoading || playersLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p>Loading game...</p>
      </div>
    );
  }

  return (
    <GameLayout
      progress={progress}
      primaryHeaderText="Game mode: Quiz"
      secondaryHeaderText={`Question: ${currentRound}/${totalQuestions}`}
      leaderboardEntries={leaderboardEntries}
    >
      <div className="flex-1 mt-6">in progress</div>
    </GameLayout>
  );
}
