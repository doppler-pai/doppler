'use client';

import { GameProgressBar } from '@/features/hostFlow/hostGame/components/GameProgressBar';
import { LeaderboardEntry } from '@/shared/models/leaderboard.types';
import { MiniLeaderboard } from './MiniLeaderboard';
import { AnswerTile, AnswerColor } from './AnswerTile';

export type AnswerState = 'default' | 'correct' | 'wrong' | 'dimmed';

export type Answer = {
  text: string;
  onSelect: () => void;
  state?: AnswerState;
};

type GameLayoutProps = {
  progress: number;
  label: string;
  question: string;
  answers: Answer[];
  leaderboardEntries: LeaderboardEntry[];
  disabled?: boolean;
  timeLeft?: number | null;
  points?: number;
};

const answerColors: AnswerColor[] = ['orange', 'purple', 'green', 'blue'];

export function GameLayout({
  progress,
  label,
  question,
  answers,
  leaderboardEntries,
  disabled = false,
  timeLeft,
  points,
}: GameLayoutProps) {
  return (
    <div className="h-screen w-full flex flex-col bg-dark">
      <GameProgressBar progress={progress} />

      {/* Top half */}
      <div className="h-1/2 relative">
        {/* Timer and Points - absolute top left */}
        <div className="absolute top-4 left-4 flex flex-col gap-1">
          {timeLeft != null && <p className="text-2xl font-bold">{timeLeft}s</p>}
          {points != null && <p className="text-muted">Points: {points}</p>}
        </div>

        {/* Question area - centered */}
        <div className="h-full flex flex-col items-center justify-center px-8">
          {/* Label */}
          <p className="text-muted mb-4">{label}</p>

          {/* Question */}
          <h1 className="text-center max-w-2xl">{question}</h1>
        </div>

        {/* Mini Leaderboard - absolute top right */}
        <div className="absolute top-4 right-0">
          <MiniLeaderboard entries={leaderboardEntries} />
        </div>
      </div>

      {/* Bottom half - Answer tiles */}
      <div className="h-1/2 p-6 pt-0">
        <div className={`h-full grid gap-4 ${answers.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'}`}>
          {answers.map((answer, index) => (
            <AnswerTile
              key={index}
              text={answer.text}
              color={answerColors[index]}
              onClick={answer.onSelect}
              disabled={disabled}
              state={answer.state}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
