'use client';

import { useMemo } from 'react';
import { GameLayout, Answer, AnswerState } from './GameLayout';
import { useQuizGame } from '../hooks/useQuizGame';
import { submitAnswer } from '../services/submitAnswer';
import { QuestionType } from '@/shared/models/sets.type';
import { useCountdown } from '@/shared/hooks/useCountdown';

const PLAYER_ANSWER_TIMEOUT_MS = 15000;

type QuizGameProps = {
  gameId: string;
};

export function QuizGame({ gameId }: QuizGameProps) {
  const {
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
  } = useQuizGame(gameId);

  // Countdown timer - only active when not showing results and question is visible
  const timeLeft = useCountdown(PLAYER_ANSWER_TIMEOUT_MS, !showResults && !!currentQuestion, currentRound);

  // Determine the state for each answer tile
  const getAnswerState = (index: number): AnswerState => {
    if (!showResults) return 'default';

    const isCorrect = correctAnswerIndices.includes(index);
    const wasSelected = index === selectedAnswer;

    if (isCorrect) return 'correct';
    if (wasSelected && !isCorrect) return 'wrong';
    return 'dimmed';
  };

  const answers: Answer[] = useMemo(() => {
    if (!currentQuestion) return [];

    if (currentQuestion.type === QuestionType.FOUR_OPTIONS) {
      return currentQuestion.metadata.answers.map((answer, index) => ({
        text: answer.answer,
        onSelect: () => {
          if (!hasAnswered && !showResults) {
            submitAnswer(gameId, index);
          }
        },
        state: getAnswerState(index),
      }));
    }

    if (currentQuestion.type === QuestionType.TRUE_FALSE) {
      return [
        {
          text: 'True',
          onSelect: () => {
            if (!hasAnswered && !showResults) {
              submitAnswer(gameId, 0);
            }
          },
          state: getAnswerState(0),
        },
        {
          text: 'False',
          onSelect: () => {
            if (!hasAnswered && !showResults) {
              submitAnswer(gameId, 1);
            }
          },
          state: getAnswerState(1),
        },
      ];
    }

    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, gameId, hasAnswered, showResults, correctAnswerIndices, selectedAnswer]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-dark">
        <p>Loading game...</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-dark">
        <p>Waiting for next question...</p>
      </div>
    );
  }

  return (
    <GameLayout
      progress={progress}
      label={`Question ${currentRound}/${totalQuestions}`}
      question={currentQuestion.metadata.question}
      answers={answers}
      leaderboardEntries={leaderboardEntries}
      disabled={hasAnswered || showResults}
      timeLeft={!showResults ? timeLeft : null}
      points={currentUserPoints}
    />
  );
}
