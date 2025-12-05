'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import { getGamePlayers, PlayerWithSkin } from '../services/getGamePlayers';
import { User } from 'lucide-react';
import { PlayerCard } from '@/shared/components/player/PlayerCard';

interface HostProps {
  gameId: string;
  setId: string;
}

interface PlayerPhysics extends PlayerWithSkin {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const CARD_SIZE = 80; // Card radius in pixels
const BOUNCE_DAMPING = 0.9; // Energy loss on collision

export function Host({ gameId }: HostProps) {
  const [players, setPlayers] = useState<PlayerWithSkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerPositions, setPlayerPositions] = useState<PlayerPhysics[]>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch players data
  useEffect(() => {
    const fetchPlayers = async () => {
      const gamePlayers = await getGamePlayers(gameId);
      setPlayers(gamePlayers);
      setLoading(false);
    };

    void fetchPlayers();

    // Poll for new players every 2 seconds
    const interval = setInterval(() => {
      void fetchPlayers();
    }, 2000);

    return () => clearInterval(interval);
  }, [gameId]);

  // Initialize physics for new players
  useEffect(() => {
    if (!containerRef.current || players.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    setPlayerPositions((prev) => {
      const newPositions: PlayerPhysics[] = [];

      players.forEach((player) => {
        const existing = prev.find((p) => p.id === player.id);
        if (existing) {
          // Keep existing physics
          newPositions.push({ ...player, ...existing });
        } else {
          // Initialize new player with random position and velocity
          newPositions.push({
            ...player,
            x: Math.random() * (width - CARD_SIZE * 2) + CARD_SIZE,
            y: Math.random() * (height - CARD_SIZE * 2) + CARD_SIZE,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            radius: CARD_SIZE,
          });
        }
      });

      return newPositions;
    });
  }, [players]);

  // Physics animation loop
  useEffect(() => {
    if (!containerRef.current || playerPositions.length === 0) return;

    const animate = () => {
      const width = containerRef.current!.clientWidth;
      const height = containerRef.current!.clientHeight;

      setPlayerPositions((prev) => {
        const updated = prev.map((player) => ({
          ...player,
          x: player.x + player.vx,
          y: player.y + player.vy,
        }));

        // Wall collision detection
        updated.forEach((player) => {
          if (player.x - player.radius <= 0) {
            player.x = player.radius;
            player.vx = Math.abs(player.vx) * BOUNCE_DAMPING;
          } else if (player.x + player.radius >= width) {
            player.x = width - player.radius;
            player.vx = -Math.abs(player.vx) * BOUNCE_DAMPING;
          }

          if (player.y - player.radius <= 0) {
            player.y = player.radius;
            player.vy = Math.abs(player.vy) * BOUNCE_DAMPING;
          } else if (player.y + player.radius >= height) {
            player.y = height - player.radius;
            player.vy = -Math.abs(player.vy) * BOUNCE_DAMPING;
          }
        });

        // Player-to-player collision detection
        for (let i = 0; i < updated.length; i++) {
          for (let j = i + 1; j < updated.length; j++) {
            const p1 = updated[i];
            const p2 = updated[j];

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = p1.radius + p2.radius;

            if (distance < minDistance) {
              // Collision detected - elastic collision
              const angle = Math.atan2(dy, dx);
              const sin = Math.sin(angle);
              const cos = Math.cos(angle);

              // Rotate velocities
              const vx1 = p1.vx * cos + p1.vy * sin;
              const vy1 = p1.vy * cos - p1.vx * sin;
              const vx2 = p2.vx * cos + p2.vy * sin;
              const vy2 = p2.vy * cos - p2.vx * sin;

              // Swap x velocities (elastic collision)
              const vx1Final = vx2 * BOUNCE_DAMPING;
              const vx2Final = vx1 * BOUNCE_DAMPING;

              // Rotate back
              p1.vx = vx1Final * cos - vy1 * sin;
              p1.vy = vy1 * cos + vx1Final * sin;
              p2.vx = vx2Final * cos - vy2 * sin;
              p2.vy = vy2 * cos + vx2Final * sin;

              // Separate overlapping players
              const overlap = minDistance - distance;
              const separationX = (overlap * cos) / 2;
              const separationY = (overlap * sin) / 2;

              p1.x -= separationX;
              p1.y -= separationY;
              p2.x += separationX;
              p2.y += separationY;
            }
          }
        }

        return updated;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [playerPositions.length]);

  const handlePlay = () => {
    // TODO: Start the game
    console.log('Starting game...');
  };

  return (
    <main ref={containerRef} className="flex h-screen w-full relative items-center justify-center overflow-hidden">
      {/* Flying player cards - behind the text */}
      {playerPositions.map((player) => (
        <div
          key={player.id}
          className="absolute z-0 transition-transform"
          style={{
            left: `${player.x - CARD_SIZE}px`,
            top: `${player.y - CARD_SIZE}px`,
            width: `${CARD_SIZE * 2}px`,
            height: `${CARD_SIZE * 2}px`,
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <PlayerCard nick={player.nick || 'Player'} image={player.skinImage || '/placeholder.png'} />
          </div>
        </div>
      ))}

      {/* Center content - above the cards */}
      <div className="z-10 flex flex-col items-center gap-2">
        <h4>Game ID</h4>
        <h1 className="text-8xl! font-bold bg-bg-dark rounded-lg px-8 py-2 ">{gameId}</h1>
        <h4 className="text-2xl text-muted flex items-center gap-2 ">
          {loading ? 'Loading...' : `${players.length} ${players.length === 1 ? 'Player' : 'Players'}`} <User />
        </h4>

        <Button size="lg" onClick={handlePlay} disabled={players.length === 0} className="mt-4">
          Play
        </Button>
      </div>
    </main>
  );
}
