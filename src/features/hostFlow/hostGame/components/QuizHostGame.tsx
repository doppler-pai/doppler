'use client';

import { useMemo, useEffect, useRef, useCallback } from 'react';
import { HostGameLayout } from './HostGameLayout';
import { useQuizMetadata } from '../hooks/useQuizMetadata';
import { useGameSet } from '../hooks/useGameSet';
import { useGamePlayers } from '../../host/hooks/useGamePlayers';
import { LeaderboardEntry } from '@/shared/models/leaderboard.types';
import { advanceQuizRound } from '../services/advanceQuizRound';
import { showQuizResults } from '../services/showQuizResults';
import { QuestionType } from '@/shared/models/sets.type';
import { Button } from '@/shared/components/ui/button';
import { useCountdown } from '@/shared/hooks/useCountdown';

const PLAYER_ANSWER_TIMEOUT_MS = 15000; // 15 seconds for players to answer
const HOST_NEXT_ROUND_TIMEOUT_MS = 10000; // 10 seconds for host to click next round

type QuizHostGameProps = {
  gameId: string;
};

export function QuizHostGame({ gameId }: QuizHostGameProps) {
  const { metadata, loading: metadataLoading } = useQuizMetadata(gameId);
  const { set, loading: setLoading } = useGameSet(gameId);
  const { players, loading: playersLoading } = useGamePlayers(gameId);

  const isShowingResultsRef = useRef(false);
  const isAdvancingRef = useRef(false);
  const answerTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalQuestions = set?.questions.length ?? 0;
  const currentRound = metadata?.currentRound ?? 0;
  const progress = totalQuestions > 0 ? currentRound / totalQuestions : 0;
  const showResults = metadata?.showResults ?? false;
  const correctAnswerIndices = metadata?.correctAnswerIndices ?? [];

  // Get current question
  const currentQuestion = useMemo(() => {
    if (!set?.questions || currentRound <= 0) return null;
    return set.questions[currentRound - 1] ?? null;
  }, [set, currentRound]);

  // Countdown timers
  const answerTimeLeft = useCountdown(PLAYER_ANSWER_TIMEOUT_MS, !showResults && !!currentQuestion, currentRound);
  const nextRoundTimeLeft = useCountdown(HOST_NEXT_ROUND_TIMEOUT_MS, showResults, showResults);

  // Check if all players have answered
  const allPlayersAnswered = useMemo(() => {
    if (!metadata?.answers || players.length === 0) return false;
    const answeredCount = Object.keys(metadata.answers).length;
    return answeredCount >= players.length;
  }, [metadata, players.length]);

  // Reset refs and clear timer when round changes
  useEffect(() => {
    isShowingResultsRef.current = false;
    isAdvancingRef.current = false;
    if (answerTimerRef.current) {
      clearTimeout(answerTimerRef.current);
      answerTimerRef.current = null;
    }
  }, [currentRound]);

  // Handle showing results (when all players answered or timeout)
  const handleShowResults = useCallback(async () => {
    if (!currentQuestion || isShowingResultsRef.current) return;
    isShowingResultsRef.current = true;
    await showQuizResults(gameId, currentQuestion);
  }, [currentQuestion, gameId]);

  // Handle advancing to next round
  const handleNextRound = useCallback(async () => {
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;
    await advanceQuizRound(gameId, totalQuestions);
  }, [gameId, totalQuestions]);

  // Show results when all players have answered
  useEffect(() => {
    if (!allPlayersAnswered || showResults || !currentQuestion) return;
    handleShowResults();
  }, [allPlayersAnswered, showResults, currentQuestion, handleShowResults]);

  // Player answer timeout (15s) - start timer once when question loads
  useEffect(() => {
    // Don't start timer if already showing results, no question, or timer already running
    if (showResults || !currentQuestion || answerTimerRef.current) return;

    answerTimerRef.current = setTimeout(async () => {
      answerTimerRef.current = null;
      if (!isShowingResultsRef.current && currentQuestion) {
        isShowingResultsRef.current = true;
        await showQuizResults(gameId, currentQuestion);
      }
    }, PLAYER_ANSWER_TIMEOUT_MS);

    // Don't clear timer on cleanup - let it run even if deps change
    // Timer is only cleared on round change (see effect above)
  }, [currentQuestion, gameId, showResults]);

  // Host next round timeout (10s after results shown)
  useEffect(() => {
    if (!showResults) return;

    const timer = setTimeout(async () => {
      if (!isAdvancingRef.current) {
        isAdvancingRef.current = true;
        await advanceQuizRound(gameId, totalQuestions);
      }
    }, HOST_NEXT_ROUND_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [showResults, gameId, totalQuestions]);

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

  // Determine if an answer is correct for styling
  const isCorrectAnswer = (index: number) => {
    if (!showResults) return false;
    return correctAnswerIndices.includes(index);
  };

  if (metadataLoading || setLoading || playersLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p>Loading game...</p>
      </div>
    );
  }

  const isLastRound = currentRound >= totalQuestions;

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
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      isCorrectAnswer(index)
                        ? 'border-green-500 bg-green-500/20'
                        : showResults
                          ? 'border-bg-light opacity-50'
                          : 'border-bg-light'
                    }`}
                  >
                    <p className="text-center">{answer.answer}</p>
                  </div>
                ))}

              {currentQuestion.type === QuestionType.TRUE_FALSE && (
                <>
                  <div
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      isCorrectAnswer(0)
                        ? 'border-green-500 bg-green-500/20'
                        : showResults
                          ? 'border-bg-light opacity-50'
                          : 'border-bg-light'
                    }`}
                  >
                    <p className="text-center">True</p>
                  </div>
                  <div
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      isCorrectAnswer(1)
                        ? 'border-green-500 bg-green-500/20'
                        : showResults
                          ? 'border-bg-light opacity-50'
                          : 'border-bg-light'
                    }`}
                  >
                    <p className="text-center">False</p>
                  </div>
                </>
              )}
            </div>

            {!showResults && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-muted">
                  {answeredCount}/{players.length} players answered
                </p>
                <p className="text-2xl font-bold">{answerTimeLeft}s</p>
              </div>
            )}

            {showResults && (
              <div className="flex flex-col items-center gap-4">
                <Button onClick={handleNextRound} size="lg">
                  {isLastRound ? 'Finish Game' : 'Next Round'}
                </Button>
                <p className="text-muted">Auto-advancing in {nextRoundTimeLeft}s</p>
              </div>
            )}
          </>
        )}
      </div>
    </HostGameLayout>
  );
}
