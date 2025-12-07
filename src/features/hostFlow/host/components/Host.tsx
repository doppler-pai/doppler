'use client';

import { useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useGamePlayers } from '../hooks/useGamePlayers';
import { usePlayerPhysics } from '../hooks/usePlayerPhysics';
import { useParticleSystem } from '../hooks/useParticleSystem';
import { User } from 'lucide-react';
import { PlayerCard } from '@/shared/components/player/PlayerCard';

interface HostProps {
  gameId: string;
}

export function Host({ gameId }: HostProps) {
  const { players, loading } = useGamePlayers(gameId);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { onPhysicsFrame } = useParticleSystem({ canvasRef, containerRef });

  const { playerPositions, boostAll, boostPlayer } = usePlayerPhysics({
    players,
    containerRef,
    cardRefs,
    onFrame: onPhysicsFrame,
  });

  const handlePlay = () => {
    // TODO: Start the game
    console.log('Starting game...');
  };

  return (
    <main ref={containerRef} className="flex h-screen w-full relative items-center justify-center overflow-hidden">
      {/* Particle canvas - furthest back */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />

      {/* Flying player cards - behind the text */}
      {playerPositions.map((player) => (
        <div
          key={player.id}
          ref={(el) => {
            if (el && player.id) {
              cardRefs.current.set(player.id, el);
            }
          }}
          onMouseDown={() => player.id && boostPlayer(player.id)}
          className="absolute cursor-pointer hover:scale-105 transition-transform active:scale-95"
          style={{
            zIndex: 1,
            left: `${player.x - player.width / 2}px`,
            top: `${player.y - player.height / 2}px`,
          }}
        >
          <PlayerCard nick={player.nick || 'Player'} image={player.skinImage || '/skins/clashRoyale/golem.png'} />
        </div>
      ))}

      {/* Center content - above the cards */}
      <div className="z-10 flex flex-col items-center gap-2">
        <h4>Game ID</h4>
        <h1 className="text-8xl! font-bold bg-bg-dark rounded-lg px-8 py-2 ">{gameId}</h1>
        <h4 className="text-2xl text-muted flex items-center gap-2 ">
          {loading ? 'Loading...' : `${players.length} ${players.length === 1 ? 'Player' : 'Players'}`} <User />
        </h4>

        <div className="flex gap-3 mt-4">
          <Button size="lg" onClick={boostAll} disabled={players.length === 0} variant="outline">
            🚀 Boost
          </Button>
          <Button size="lg" onClick={handlePlay} disabled={players.length === 0}>
            Play
          </Button>
        </div>
      </div>
    </main>
  );
}
