'use client';

import { useMemo } from 'react';
import { GameLayout, Answer } from './GameLayout';
import { useQuizGame } from '../hooks/useQuizGame';
import { submitAnswer } from '../services/submitAnswer';
import { QuestionType } from '@/shared/models/sets.type';

type QuizGameProps = {
  gameId: string;
};

export function QuizGame({ gameId }: QuizGameProps) {
  const { loading, currentQuestion, currentRound, totalQuestions, progress, leaderboardEntries, hasAnswered } =
    useQuizGame(gameId);

  const answers: Answer[] = useMemo(() => {
    if (!currentQuestion) return [];

    if (currentQuestion.type === QuestionType.FOUR_OPTIONS) {
      return currentQuestion.metadata.answers.map((answer, index) => ({
        text: answer.answer,
        onSelect: () => {
          if (!hasAnswered) {
            submitAnswer(gameId, index);
          }
        },
      }));
    }

    if (currentQuestion.type === QuestionType.TRUE_FALSE) {
      return [
        {
          text: 'True',
          onSelect: () => {
            if (!hasAnswered) {
              submitAnswer(gameId, 0);
            }
          },
        },
        {
          text: 'False',
          onSelect: () => {
            if (!hasAnswered) {
              submitAnswer(gameId, 1);
            }
          },
        },
      ];
    }

    return [];
  }, [currentQuestion, gameId, hasAnswered]);

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
      disabled={hasAnswered}
    />
  );
}
