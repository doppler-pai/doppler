'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { LeaderboardEntry } from '@/shared/models/leaderboard.types';

type LeaderboardProps = {
  entries: LeaderboardEntry[];
};

function getRankStyle(rank: number): string {
  if (rank === 1) return 'bg-linear-to-r from-transparent to-gold';
  if (rank === 2) return 'bg-linear-to-r from-transparent to-silver';
  if (rank === 3) return 'bg-linear-to-r from-transparent to-bronze';
  return rank % 2 === 0 ? 'bg-transparent' : 'bg-linear-to-r from-transparent to-bg-dark';
}

export function Leaderboard({ entries }: LeaderboardProps) {
  return (
    <div className="relative h-full overflow-y-auto">
      {/* Gradient fade overlay from left */}
      <div className="absolute inset-y-0 left-0 w-16 z-10 pointer-events-none" />

      {/* Scrollable content */}
      <div className="h-full overflow-y-auto">
        <div className="flex flex-col">
          {entries.map((entry, index) => {
            const rank = index + 1;
            return (
              <motion.div
                key={entry.playerId}
                layoutId={entry.playerId}
                layout
                transition={{ type: 'tween', duration: 0.3 }}
                className={`flex items-center gap-4 pl-20 h-18 ${getRankStyle(rank)}`}
              >
                <h3 className="w-8">#{rank}</h3>
                <div className="h-fit overflow-hidden">
                  <Image
                    src={entry.imagePath}
                    alt={entry.playerName}
                    width={50}
                    height={50}
                    className="object-cover block"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="truncate">{entry.playerName}</h3>
                  <p className="text-muted truncate">{entry.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
