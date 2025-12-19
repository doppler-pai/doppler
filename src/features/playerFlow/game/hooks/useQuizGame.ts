import { useMemo } from 'react';
import { useQuizMetadata } from '@/features/hostFlow/hostGame/hooks/useQuizMetadata';
import { useGameSet } from '@/features/hostFlow/hostGame/hooks/useGameSet';
import { useGamePlayers } from '@/features/hostFlow/host/hooks/useGamePlayers';
import { LeaderboardEntry } from '@/shared/models/leaderboard.types';
import { auth } from '@/shared/lib/firebase';
import { Question } from '@/shared/models/sets.type';

export type QuizGameState = {
  loading: boolean;
  currentQuestion: Question | null;
  currentRound: number;
  totalQuestions: number;
  progress: number;
  leaderboardEntries: LeaderboardEntry[];
  hasAnswered: boolean;
  selectedAnswer: number | null;
  showResults: boolean;
  correctAnswerIndices: number[];
  currentUserPoints: number;
};

export function useQuizGame(gameId: string): QuizGameState {
  const { metadata, loading: metadataLoading } = useQuizMetadata(gameId);
  const { set, loading: setLoading } = useGameSet(gameId);
  const { players, loading: playersLoading } = useGamePlayers(gameId);

  const currentUserId = auth.currentUser?.uid;

  const loading = metadataLoading || setLoading || playersLoading;

  const totalQuestions = set?.questions.length ?? 0;
  const currentRound = metadata?.currentRound ?? 0;
  const progress = totalQuestions > 0 ? currentRound / totalQuestions : 0;

  // Get current question (currentRound is 1-indexed, array is 0-indexed)
  const currentQuestion = useMemo(() => {
    if (!set?.questions || currentRound <= 0) return null;
    return set.questions[currentRound - 1] ?? null;
  }, [set, currentRound]);

  // Check if current player has answered
  const hasAnswered = useMemo(() => {
    if (!currentUserId || !metadata?.answers) return false;
    return currentUserId in metadata.answers;
  }, [currentUserId, metadata]);

  // Get player's selected answer
  const selectedAnswer = useMemo(() => {
    if (!currentUserId || !metadata?.answers) return null;
    return metadata.answers[currentUserId] ?? null;
  }, [currentUserId, metadata]);

  // Build leaderboard entries sorted by points
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
        label: `${points}`,
      }));
  }, [metadata, players]);

  const showResults = metadata?.showResults ?? false;
  const correctAnswerIndices = metadata?.correctAnswerIndices ?? [];
  const currentUserPoints = currentUserId ? (metadata?.points?.[currentUserId] ?? 0) : 0;

  return {
    loading,
    currentQuestion,
    currentRound,
    totalQuestions,
    progress,
    leaderboardEntries,
    hasAnswered,
    selectedAnswer,
    showResults,
    correctAnswerIndices,
    currentUserPoints,
  };
}
