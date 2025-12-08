'use client';

import { useMemo, useEffect, useRef } from 'react';
import { HostGameLayout } from './HostGameLayout';
import { useQuizMetadata } from '../hooks/useQuizMetadata';
import { useGameSet } from '../hooks/useGameSet';
import { useGamePlayers } from '../../host/hooks/useGamePlayers';
import { LeaderboardEntry } from '@/shared/models/leaderboard.types';
import { advanceQuizRound } from '../services/advanceQuizRound';
import { QuestionType } from '@/shared/models/sets.type';

type QuizHostGameProps = {
  gameId: string;
};

export function QuizHostGame({ gameId }: QuizHostGameProps) {
  const { metadata, loading: metadataLoading } = useQuizMetadata(gameId);
  const { set, loading: setLoading } = useGameSet(gameId);
  const { players, loading: playersLoading } = useGamePlayers(gameId);

  const isAdvancingRef = useRef(false);

  const totalQuestions = set?.questions.length ?? 0;
  const currentRound = metadata?.currentRound ?? 0;
  const progress = totalQuestions > 0 ? currentRound / totalQuestions : 0;

  // Get current question
  const currentQuestion = useMemo(() => {
    if (!set?.questions || currentRound <= 0) return null;
    return set.questions[currentRound - 1] ?? null;
  }, [set, currentRound]);

  // Check if all players have answered
  const allPlayersAnswered = useMemo(() => {
    if (!metadata?.answers || players.length === 0) return false;
    const answeredCount = Object.keys(metadata.answers).length;
    return answeredCount >= players.length;
  }, [metadata, players.length]);

  // Advance to next round when all players have answered
  useEffect(() => {
    if (!allPlayersAnswered || !currentQuestion || isAdvancingRef.current) return;

    isAdvancingRef.current = true;

    // Small delay to show that everyone answered before advancing
    const timer = setTimeout(async () => {
      await advanceQuizRound(gameId, currentQuestion, totalQuestions);
      isAdvancingRef.current = false;
    }, 1500);

    return () => {
      clearTimeout(timer);
      isAdvancingRef.current = false;
    };
  }, [allPlayersAnswered, currentQuestion, gameId, totalQuestions]);

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

  // Count how many players have answered
  const answeredCount = Object.keys(metadata?.answers ?? {}).length;

  if (metadataLoading || setLoading || playersLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p>Loading game...</p>
      </div>
    );
  }

  return (
    <HostGameLayout
      progress={progress}
      primaryHeaderText="Game mode: Quiz"
      secondaryHeaderText={`Question: ${currentRound}/${totalQuestions}`}
      leaderboardEntries={leaderboardEntries}
    >
      <div className="flex flex-col items-center justify-center h-full gap-8">
        {currentQuestion && (
          <>
            <h1 className="text-center max-w-3xl">{currentQuestion.metadata.question}</h1>

            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
              {currentQuestion.type === QuestionType.FOUR_OPTIONS &&
                currentQuestion.metadata.answers.map((answer, index) => (
                  <div key={index} className="p-4 rounded-lg border-2 border-bg-light">
                    <p className="text-center">{answer.answer}</p>
                  </div>
                ))}

              {currentQuestion.type === QuestionType.TRUE_FALSE && (
                <>
                  <div className="p-4 rounded-lg border-2 border-bg-light">
                    <p className="text-center">True</p>
                  </div>
                  <div className="p-4 rounded-lg border-2 border-bg-light">
                    <p className="text-center">False</p>
                  </div>
                </>
              )}
            </div>

            <p className="text-muted">
              {answeredCount}/{players.length} players answered
            </p>
          </>
        )}
      </div>
    </HostGameLayout>
  );
}
