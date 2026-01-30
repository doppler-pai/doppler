'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Sparkles, Trophy, Target, Award } from 'lucide-react';

import { useGamePlayers } from '@/features/hostFlow/host/hooks/useGamePlayers';
import { useQuizMetadata } from '@/features/hostFlow/hostGame/hooks/useQuizMetadata';
import { auth } from '@/shared/lib/firebase';
import { awardGameReward } from '../services/awardGameReward';
import { Button } from '@/shared/components/ui/button';

type PlayerGameSummaryProps = {
  gameId: string;
};

function CircularProgress({ percentage }: { percentage: number }) {
  const radius = 60;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140">
        {/* Background circle */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-bg-light"
        />
        {/* Progress circle */}
        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-green-400"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
        />
      </svg>
      {/* Percentage text */}
      <motion.div
        className="absolute flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <span className="text-4xl font-bold text-text-unmuted">{Math.round(percentage)}%</span>
        <span className="text-xs text-text-muted">accuracy</span>
      </motion.div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  delay: number;
}) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2 rounded-lg bg-bg-light p-6"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
    >
      <Icon className="h-8 w-8 text-text-muted" />
      <span className="text-3xl font-bold text-text-unmuted">{value}</span>
      <span className="text-sm text-text-muted">{label}</span>
    </motion.div>
  );
}

export function PlayerGameSummary({ gameId }: PlayerGameSummaryProps) {
  const router = useRouter();
  const { players, loading: playersLoading } = useGamePlayers(gameId);
  const { metadata, loading: metadataLoading } = useQuizMetadata(gameId);
  const [reward, setReward] = useState<number | null>(null);
  const [rewardAwarded, setRewardAwarded] = useState(false);

  const currentUserId = auth.currentUser?.uid;

  // Award reward on mount
  useEffect(() => {
    if (!currentUserId || rewardAwarded) return;

    const awardReward = async () => {
      const amount = await awardGameReward(currentUserId);
      if (amount !== null) {
        setReward(amount);
        setRewardAwarded(true);
      }
    };

    void awardReward();
  }, [currentUserId, rewardAwarded]);

  const playerData = useMemo(() => {
    if (!currentUserId || !metadata?.points || players.length === 0) return null;

    const allPlayers = players
      .map((player) => ({
        ...player,
        points: metadata.points[player.id ?? ''] ?? 0,
        playerStats: metadata.stats?.playerStats?.[player.id ?? ''] ?? { correct: 0, incorrect: 0 },
      }))
      .sort((a, b) => b.points - a.points);

    const currentPlayerIndex = allPlayers.findIndex((p) => p.id === currentUserId);
    if (currentPlayerIndex === -1) return null;

    const currentPlayer = allPlayers[currentPlayerIndex];
    const rank = currentPlayerIndex + 1;
    const total = currentPlayer.playerStats.correct + currentPlayer.playerStats.incorrect;
    const accuracy = total > 0 ? (currentPlayer.playerStats.correct / total) * 100 : 0;

    return {
      rank,
      points: currentPlayer.points,
      correct: currentPlayer.playerStats.correct,
      incorrect: currentPlayer.playerStats.incorrect,
      accuracy,
      totalPlayers: allPlayers.length,
      skinImage: currentPlayer.skinImage ?? '/skins/clashRoyale/skeleton.png',
      nick: currentPlayer.nick ?? 'Player',
    };
  }, [currentUserId, metadata, players]);

  const isLoading = playersLoading || metadataLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-very-dark">
        <p className="text-text-muted">Loading results...</p>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-very-dark">
        <p className="text-text-muted">Unable to load your results</p>
      </div>
    );
  }

  const getRankSuffix = (rank: number) => {
    if (rank % 10 === 1 && rank !== 11) return 'st';
    if (rank % 10 === 2 && rank !== 12) return 'nd';
    if (rank % 10 === 3 && rank !== 13) return 'rd';
    return 'th';
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-very-dark px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="mb-2">Game Complete!</h1>
          <p className="text-text-muted">Great job out there!</p>
        </motion.div>

        {/* Player Card */}
        <motion.div
          className="mb-8 flex flex-col items-center gap-6 rounded-xl bg-bg-dark p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Player Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Image
              src={playerData.skinImage}
              alt={playerData.nick}
              width={180}
              height={180}
              className="rounded-lg object-contain"
            />
          </motion.div>

          {/* Player Name & Rank */}
          <div className="text-center">
            <motion.h2
              className="mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {playerData.nick}
            </motion.h2>
            <motion.div
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Trophy className="h-5 w-5 text-yellow-500" />
              <p className="text-xl font-bold text-text-unmuted">
                {playerData.rank}
                {getRankSuffix(playerData.rank)} Place
              </p>
              <span className="text-text-muted">/ {playerData.totalPlayers}</span>
            </motion.div>
          </div>

          {/* Accuracy Circle */}
          <CircularProgress percentage={playerData.accuracy} />
        </motion.div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <StatCard icon={Award} label="Points" value={playerData.points} delay={0.6} />
          <StatCard icon={Target} label="Correct" value={playerData.correct} delay={0.7} />
          <StatCard icon={Sparkles} label="Incorrect" value={playerData.incorrect} delay={0.8} />
        </div>

        {/* Reward Section */}
        {reward !== null && (
          <motion.div
            className="mb-8 rounded-xl bg-gradient-to-br from-yellow-600/20 to-orange-600/20 p-8 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, type: 'spring' }}
          >
            <motion.div
              className="mb-4 flex justify-center"
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 1.4, type: 'spring', bounce: 0.5 }}
            >
              <Sparkles className="h-12 w-12 text-yellow-400" />
            </motion.div>
            <h4 className="mb-2">Reward Earned!</h4>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold text-yellow-400">+{reward}</span>
              <Image src="/logo/logo.png" alt="coins" width={32} height={32} />
            </div>
            <p className="mt-2 text-sm text-text-muted">Thanks for playing!</p>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          className="flex gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <Button className="flex-1" variant="outline" onClick={() => router.push('/sets')}>
            Browse Sets
          </Button>
          <Button className="flex-1" onClick={() => router.push('/market')}>
            Visit Market
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
