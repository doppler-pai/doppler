'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { useMemo } from 'react';

import { useGamePlayers, PlayerWithSkin } from '../../host/hooks/useGamePlayers';
import { useQuizMetadata } from '../../hostGame/hooks/useQuizMetadata';
import { useLobbyState } from '@/shared/hooks/useLobbyState';
import { GameStats, PlayerStats } from '@/shared/models/lobby.types';
import { Check, X } from 'lucide-react';

type PodiumPlayer = PlayerWithSkin & {
  points: number;
  rank: 1 | 2 | 3;
};

type HostGameSummaryProps = {
  gameId: string;
};

function getPodiumGradient(rank: 1 | 2 | 3): string {
  if (rank === 1) return 'bg-gradient-to-b from-gold to-gold/30';
  if (rank === 2) return 'bg-gradient-to-b from-silver to-silver/30';
  return 'bg-gradient-to-b from-bronze to-bronze/30';
}

function getPodiumHeight(rank: 1 | 2 | 3): number {
  if (rank === 1) return 700;
  if (rank === 2) return 520;
  return 380;
}

function getRankLabel(rank: 1 | 2 | 3): { text: string; color: string } {
  if (rank === 1) return { text: '1st', color: 'text-[#ffd700]' };
  if (rank === 2) return { text: '2nd', color: 'text-[#c0c0c0]' };
  return { text: '3rd', color: 'text-[#cd7f32]' };
}

function getAnimationDelay(rank: 1 | 2 | 3): number {
  // 3rd appears first, then 2nd, then 1st
  if (rank === 3) return 0;
  if (rank === 2) return 0.6;
  return 1.2;
}

function CircularProgress({ percentage }: { percentage: number }) {
  const radius = 80;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex h-56 w-56 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-bg-light"
        />
        {/* Progress circle */}
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-green-400"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, delay: 2, ease: 'easeOut' }}
        />
      </svg>
      {/* Percentage text */}
      <motion.div
        className="absolute flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        <span className="text-6xl font-bold text-text-unmuted">{Math.round(percentage)}%</span>
        <span className="text-base text-text-muted">correct</span>
      </motion.div>
    </div>
  );
}

function StatItem({ label, value, delay }: { label: string; value: string | number; delay: number }) {
  return (
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <span className="text-4xl font-bold text-text-unmuted">{value}</span>
      <span className="text-base text-text-muted">{label}</span>
    </motion.div>
  );
}

function StatsSection({
  stats,
  totalPlayers,
  createdAt,
}: {
  stats: GameStats;
  totalPlayers: number;
  createdAt: number;
}) {
  const percentage = stats.totalAnswers > 0 ? (stats.totalCorrect / stats.totalAnswers) * 100 : 0;

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.section
      className="flex w-full max-w-4xl items-center justify-center gap-20 px-8 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.8 }}
    >
      {/* Left - Circular progress */}
      <CircularProgress percentage={percentage} />

      {/* Right - Stats */}
      <div className="flex flex-col gap-6">
        <motion.p
          className="text-xl text-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          {formattedDate}
        </motion.p>
        <div className="grid grid-cols-2 gap-x-16 gap-y-6">
          <StatItem label="Total Correct" value={stats.totalCorrect} delay={2.1} />
          <StatItem label="Total Incorrect" value={stats.totalIncorrect} delay={2.2} />
          <StatItem label="Total Players" value={totalPlayers} delay={2.3} />
          <StatItem label="Total Answers" value={stats.totalAnswers} delay={2.4} />
        </div>
      </div>
    </motion.section>
  );
}

type LeaderboardPlayer = PlayerWithSkin & {
  points: number;
  rank: number;
  playerStats: PlayerStats;
};

function MiniCircularProgress({ percentage }: { percentage: number }) {
  const radius = 16;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-bg-light"
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-green-400"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <span className="absolute text-xs font-bold text-text-unmuted">{Math.round(percentage)}</span>
    </div>
  );
}

function AccuracyBar({ correct, incorrect }: { correct: number; incorrect: number }) {
  const total = correct + incorrect;
  const percentage = total > 0 ? (correct / total) * 100 : 0;

  return (
    <div className="relative flex h-7 flex-1 overflow-hidden rounded-md">
      {/* Green section */}
      <div
        className="flex h-full items-center justify-center bg-green-600 transition-all"
        style={{ width: `${percentage}%` }}
      >
        {percentage > 15 && (
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">{correct}</span>
          </div>
        )}
      </div>
      {/* Red section */}
      <div
        className="flex h-full items-center justify-center bg-red-600 transition-all"
        style={{ width: `${100 - percentage}%` }}
      >
        {100 - percentage > 15 && (
          <div className="flex items-center gap-1">
            <X className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">{incorrect}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function LeaderboardRow({ player, index }: { player: LeaderboardPlayer; index: number }) {
  const total = player.playerStats.correct + player.playerStats.incorrect;
  const percentage = total > 0 ? (player.playerStats.correct / total) * 100 : 0;

  return (
    <motion.tr
      className="border-b border-bg-light"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.5 + index * 0.05 }}
    >
      {/* Place */}
      <td className="py-4 pl-4 pr-2">
        <span className="text-lg font-bold text-text-muted">#{player.rank}</span>
      </td>
      {/* Player */}
      <td className="py-4 px-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded">
            <Image
              src={player.skinImage ?? '/skins/clashRoyale/skeleton.png'}
              alt={player.nick ?? 'Unknown'}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <span className="text-base font-medium text-text-unmuted">{player.nick ?? 'Unknown'}</span>
        </div>
      </td>
      {/* Accuracy */}
      <td className="py-4 px-2">
        <div className="flex items-center gap-4">
          <MiniCircularProgress percentage={percentage} />
          <AccuracyBar correct={player.playerStats.correct} incorrect={player.playerStats.incorrect} />
        </div>
      </td>
      {/* Points */}
      <td className="py-4 pl-2 pr-4 text-right">
        <span className="text-lg font-bold text-text-unmuted">{player.points}</span>
      </td>
    </motion.tr>
  );
}

function LeaderboardTable({ players }: { players: LeaderboardPlayer[] }) {
  return (
    <motion.section
      className="w-full max-w-4xl px-8 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.3 }}
    >
      <motion.h2
        className="mb-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4 }}
      >
        Leaderboard
      </motion.h2>
      <table className="w-full">
        <thead>
          <tr className="border-b border-bg-light text-left text-sm text-text-muted">
            <th className="py-3 pl-4 pr-2 font-medium">Place</th>
            <th className="py-3 px-2 font-medium">Player</th>
            <th className="py-3 px-2 font-medium">Accuracy</th>
            <th className="py-3 pl-2 pr-4 text-right font-medium">Points</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <LeaderboardRow key={player.id} player={player} index={index} />
          ))}
        </tbody>
      </table>
    </motion.section>
  );
}

function PodiumPlace({ player }: { player: PodiumPlayer }) {
  const { text: rankText, color: rankColor } = getRankLabel(player.rank);
  const podiumHeight = getPodiumHeight(player.rank);
  const delay = getAnimationDelay(player.rank);

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      {/* Player skin - positioned to stand on top of podium */}
      <motion.div
        className="relative z-10 -mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.8, delay: delay + 0.5 }}
      >
        <Image
          src={player.skinImage ?? '/skins/clashRoyale/skeleton.png'}
          alt={player.nick ?? 'Unknown'}
          width={200}
          height={200}
          className="object-contain drop-shadow-lg"
        />
      </motion.div>

      {/* Podium block */}
      <motion.div
        className={`flex w-80 flex-col items-center rounded-t-xl pt-8 ${getPodiumGradient(player.rank)}`}
        initial={{ height: 0 }}
        animate={{ height: podiumHeight }}
        transition={{ type: 'spring', duration: 1, delay }}
      >
        {/* Rank */}
        <motion.span
          className={`text-6xl font-bold ${rankColor}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.6 }}
        >
          {rankText}
        </motion.span>

        {/* Player name */}
        <motion.h2
          className="mt-4 max-w-64 truncate px-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.7 }}
        >
          {player.nick ?? 'Unknown'}
        </motion.h2>

        {/* Points */}
        <motion.p
          className="mt-2 text-lg text-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.8 }}
        >
          {player.points} pts
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

export function HostGameSummary({ gameId }: HostGameSummaryProps) {
  const { players, loading: playersLoading } = useGamePlayers(gameId);
  const { metadata, loading: metadataLoading } = useQuizMetadata(gameId);
  const lobbyState = useLobbyState(gameId);

  const allPlayers = useMemo((): LeaderboardPlayer[] => {
    if (!metadata?.points || players.length === 0) return [];

    return players
      .map((player) => ({
        ...player,
        points: metadata.points[player.id ?? ''] ?? 0,
        playerStats: metadata.stats?.playerStats?.[player.id ?? ''] ?? { correct: 0, incorrect: 0 },
      }))
      .sort((a, b) => b.points - a.points)
      .map((player, index) => ({
        ...player,
        rank: index + 1,
      }));
  }, [metadata, players]);

  const topThree = useMemo((): PodiumPlayer[] => {
    return allPlayers.slice(0, 3).map((player) => ({
      ...player,
      rank: player.rank as 1 | 2 | 3,
    }));
  }, [allPlayers]);

  const stats: GameStats = metadata?.stats ?? {
    totalCorrect: 0,
    totalIncorrect: 0,
    totalAnswers: 0,
  };

  const isLoading = playersLoading || metadataLoading || !lobbyState;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-very-dark">
        <p className="text-text-muted">Loading results...</p>
      </div>
    );
  }

  if (topThree.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-very-dark">
        <p className="text-text-muted">No results available</p>
      </div>
    );
  }

  // Reorder for podium display: 2nd, 1st, 3rd
  const podiumOrder = [
    topThree.find((p) => p.rank === 2),
    topThree.find((p) => p.rank === 1),
    topThree.find((p) => p.rank === 3),
  ].filter(Boolean) as PodiumPlayer[];

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-very-dark">
      {/* Hero Section - Podium */}
      <section className="flex min-h-screen flex-col items-center justify-end px-4 pb-16">
        {/* Podium */}
        <div className="flex items-end justify-center gap-6">
          {podiumOrder.map((player) => (
            <PodiumPlace key={player.id} player={player} />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="flex justify-center py-8">
        <StatsSection stats={stats} totalPlayers={players.length} createdAt={lobbyState.createdAt} />
      </section>

      {/* Leaderboard Section */}
      <section className="flex justify-center pb-16">
        <LeaderboardTable players={allPlayers} />
      </section>
    </div>
  );
}
