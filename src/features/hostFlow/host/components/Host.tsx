'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useGamePlayers, PlayerWithSkin } from '../hooks/useGamePlayers';
import { User } from 'lucide-react';
import { PlayerCard } from '@/shared/components/player/PlayerCard';

interface HostProps {
  gameId: string;
}

interface PlayerPhysics extends PlayerWithSkin {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  width: number; // Actual measured width
  height: number; // Actual measured height
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0 to 1
  size: number;
  hue: number;
}

const BOUNCE_DAMPING = 0.8; // Energy loss on collision
const MAX_PARTICLES = 200; // Limit particles for performance
const PARTICLE_SPAWN_RATE = 0.3; // Probability per frame when player is moving

export function Host({ gameId }: HostProps) {
  const { players, loading } = useGamePlayers(gameId);
  const [playerPositions, setPlayerPositions] = useState<PlayerPhysics[]>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Initialize physics for new players
  useEffect(() => {
    if (!containerRef.current) return;

    // Clear positions if no players
    if (players.length === 0) {
      // Use microtask to avoid synchronous setState
      Promise.resolve().then(() => setPlayerPositions([]));
      return;
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    setPlayerPositions((prev) => {
      const newPositions: PlayerPhysics[] = [];

      players.forEach((player) => {
        const existing = prev.find((p) => p.id === player.id);
        if (existing) {
          // Keep existing physics but update player data (skinId, nick, skinImage)
          newPositions.push({ ...existing, ...player });
        } else {
          // Initialize new player with default size (will be measured after render)
          const defaultWidth = 200;
          const defaultHeight = 80;
          newPositions.push({
            ...player,
            x: Math.random() * (width - defaultWidth) + defaultWidth / 2,
            y: Math.random() * (height - defaultHeight) + defaultHeight / 2,
            vx: (Math.random() - 0.5) * 100,
            vy: (Math.random() - 0.5) * 100,
            radius: Math.max(defaultWidth, defaultHeight) / 2,
            width: defaultWidth,
            height: defaultHeight,
          });
        }
      });

      return newPositions;
    });
  }, [players]);

  // Measure actual card sizes after render
  useEffect(() => {
    if (playerPositions.length === 0) return;

    const measureCards = () => {
      setPlayerPositions((prev) =>
        prev.map((player) => {
          const cardElement = cardRefs.current.get(player.id || '');
          if (cardElement) {
            const rect = cardElement.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            const radius = Math.max(width, height) / 2;

            // Only update if significantly different
            if (Math.abs(player.width - width) > 5 || Math.abs(player.height - height) > 5) {
              return { ...player, width, height, radius };
            }
          }
          return player;
        }),
      );
    };

    // Measure after a short delay to ensure DOM is rendered
    const timeout = setTimeout(measureCards, 100);
    return () => clearTimeout(timeout);
  }, [playerPositions.length]);

  // Setup canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const updateCanvasSize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Physics animation loop with particles
  useEffect(() => {
    if (!containerRef.current || playerPositions.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    const animate = () => {
      const width = containerRef.current!.clientWidth;
      const height = containerRef.current!.clientHeight;

      setPlayerPositions((prev) => {
        const updated = prev.map((player) => ({
          ...player,
          x: player.x + player.vx,
          y: player.y + player.vy,
        }));

        // Generate particles for moving players
        if (particlesRef.current.length < MAX_PARTICLES) {
          updated.forEach((player) => {
            const speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
            if (speed > 2 && Math.random() < PARTICLE_SPAWN_RATE) {
              particlesRef.current.push({
                x: player.x + (Math.random() - 0.5) * player.width * 0.5,
                y: player.y + (Math.random() - 0.5) * player.height * 0.5,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 1,
                size: Math.random() * 3 + 2,
                hue: Math.random() * 60 + 180, // Blue-ish tones
              });
            }
          });
        }

        // Wall collision detection
        updated.forEach((player) => {
          const halfWidth = player.width / 2;
          const halfHeight = player.height / 2;

          if (player.x - halfWidth <= 0) {
            player.x = halfWidth;
            player.vx = Math.abs(player.vx) * BOUNCE_DAMPING;
          } else if (player.x + halfWidth >= width) {
            player.x = width - halfWidth;
            player.vx = -Math.abs(player.vx) * BOUNCE_DAMPING;
          }

          if (player.y - halfHeight <= 0) {
            player.y = halfHeight;
            player.vy = Math.abs(player.vy) * BOUNCE_DAMPING;
          } else if (player.y + halfHeight >= height) {
            player.y = height - halfHeight;
            player.vy = -Math.abs(player.vy) * BOUNCE_DAMPING;
          }
        });

        // Player-to-player collision detection (AABB - Axis Aligned Bounding Box)
        for (let i = 0; i < updated.length; i++) {
          for (let j = i + 1; j < updated.length; j++) {
            const p1 = updated[i];
            const p2 = updated[j];

            // Calculate bounding boxes
            const p1Left = p1.x - p1.width / 2;
            const p1Right = p1.x + p1.width / 2;
            const p1Top = p1.y - p1.height / 2;
            const p1Bottom = p1.y + p1.height / 2;

            const p2Left = p2.x - p2.width / 2;
            const p2Right = p2.x + p2.width / 2;
            const p2Top = p2.y - p2.height / 2;
            const p2Bottom = p2.y + p2.height / 2;

            // Check for overlap
            if (p1Right > p2Left && p1Left < p2Right && p1Bottom > p2Top && p1Top < p2Bottom) {
              // Collision detected - calculate centers and distance
              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;

              // Calculate overlap amounts
              const overlapX = p1Right > p2Left && p1Left < p2Right ? Math.min(p1Right - p2Left, p2Right - p1Left) : 0;
              const overlapY = p1Bottom > p2Top && p1Top < p2Bottom ? Math.min(p1Bottom - p2Top, p2Bottom - p1Top) : 0;

              // Separate along the axis with least overlap
              if (overlapX < overlapY) {
                // Separate horizontally
                const separationX = (overlapX / 2) * (dx > 0 ? 1 : -1);
                p1.x -= separationX;
                p2.x += separationX;

                // Swap horizontal velocities
                const temp = p1.vx;
                p1.vx = p2.vx * BOUNCE_DAMPING;
                p2.vx = temp * BOUNCE_DAMPING;
              } else {
                // Separate vertically
                const separationY = (overlapY / 2) * (dy > 0 ? 1 : -1);
                p1.y -= separationY;
                p2.y += separationY;

                // Swap vertical velocities
                const temp = p1.vy;
                p1.vy = p2.vy * BOUNCE_DAMPING;
                p2.vy = temp * BOUNCE_DAMPING;
              }
            }
          }
        }

        return updated;
      });

      // Update and render particles
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update particles
        particlesRef.current = particlesRef.current
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 0.015,
          }))
          .filter((particle) => particle.life > 0);

        // Render particles
        particlesRef.current.forEach((particle) => {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.life * 0.6})`;
          ctx.fill();
        });
      }

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

  const handleBoost = () => {
    setPlayerPositions((prev) =>
      prev.map((player) => ({
        ...player,
        vx: player.vx * 1.5 + (Math.random() - 0.5) * 50,
        vy: player.vy * 1.5 + (Math.random() - 0.5) * 50,
      })),
    );
  };

  const handlePlayerClick = (playerId: string | undefined) => {
    if (!playerId) return;

    setPlayerPositions((prev) =>
      prev.map((player) =>
        player.id === playerId
          ? {
              ...player,
              vx: player.vx * 1.3 + (Math.random() - 0.5) * 80,
              vy: player.vy * 1.3 + (Math.random() - 0.5) * 80,
            }
          : player,
      ),
    );
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
          onMouseDown={() => handlePlayerClick(player.id)}
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
          <Button size="lg" onClick={handleBoost} disabled={players.length === 0} variant="outline">
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
