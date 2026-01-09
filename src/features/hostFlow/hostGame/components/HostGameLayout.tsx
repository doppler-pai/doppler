'use client';

import { LeaderboardEntry } from '@/shared/models/leaderboard.types';
import { GameProgressBar } from './GameProgressBar';
import { GameHeader } from './GameHeader';
import { Leaderboard } from './Leaderboard';

type HostGameLayoutProps = {
  progress: number;
  primaryHeaderText: string;
  secondaryHeaderText: string;
  leaderboardEntries: LeaderboardEntry[];
  children: React.ReactNode;
};

export function HostGameLayout({
  progress,
  primaryHeaderText,
  secondaryHeaderText,
  leaderboardEntries,
  children,
}: HostGameLayoutProps) {
  return (
    <div className="h-screen w-full flex bg-dark">
      <GameProgressBar progress={progress} />

      {/* Left section - 60% */}
      <div className="w-3/5 flex flex-col p-6 pt-8">
        <GameHeader primaryText={primaryHeaderText} secondaryText={secondaryHeaderText} />
        <div className="flex-1 mt-6">{children}</div>
      </div>

      {/* Leaderboard - 40% */}
      <div className="w-2/5 h-full pt-2">
        <Leaderboard entries={leaderboardEntries} />
      </div>
    </div>
  );
}
