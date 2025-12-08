'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { LeaderboardEntry } from '@/shared/models/leaderboard.types';

type MiniLeaderboardProps = {
  entries: LeaderboardEntry[];
};

function getRankStyle(rank: number): string {
  if (rank === 1) return 'bg-linear-to-r from-transparent to-gold';
  if (rank === 2) return 'bg-linear-to-r from-transparent to-silver';
  if (rank === 3) return 'bg-linear-to-r from-transparent to-bronze';
  return '';
}

export function MiniLeaderboard({ entries }: MiniLeaderboardProps) {
  const topEntries = entries.slice(0, 8);

  return (
    <div className="flex flex-col">
      {topEntries.map((entry, index) => {
        const rank = index + 1;
        return (
          <motion.div
            key={entry.playerId}
            layoutId={`mini-${entry.playerId}`}
            layout
            transition={{ type: 'tween', duration: 0.3 }}
            className={`flex items-center justify-end gap-2 py-1 pr-0 px-4 pl-8 ${getRankStyle(rank)}`}
          >
            <div className="h-8 w-8 overflow-hidden rounded-sm">
              <Image src={entry.imagePath} alt={entry.playerName} width={32} height={32} className="object-cover" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
