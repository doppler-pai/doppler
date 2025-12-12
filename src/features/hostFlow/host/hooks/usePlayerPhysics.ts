import { useEffect, useState, useRef, RefObject } from 'react';
import { PlayerWithSkin } from './useGamePlayers';
import { PhysicsBody, applyWallCollisions, resolveCollision } from '../lib/physics';

export interface PlayerPhysics extends PlayerWithSkin, PhysicsBody {}

interface UsePlayerPhysicsOptions {
  players: PlayerWithSkin[];
  containerRef: RefObject<HTMLDivElement | null>;
  cardRefs: RefObject<Map<string, HTMLDivElement>>;
  onFrame?: (players: PlayerPhysics[]) => void;
}

export function usePlayerPhysics({ players, containerRef, cardRefs, onFrame }: UsePlayerPhysicsOptions): {
  playerPositions: PlayerPhysics[];
  boostAll: () => void;
  boostPlayer: (playerId: string) => void;
} {
  const [playerPositions, setPlayerPositions] = useState<PlayerPhysics[]>([]);
  const animationRef = useRef<number | undefined>(undefined);

  // Initialize physics for new players
  useEffect(() => {
    if (!containerRef.current) return;

    if (players.length === 0) {
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
          newPositions.push({ ...existing, ...player });
        } else {
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
  }, [players, containerRef]);

  // Measure actual card sizes after render
  useEffect(() => {
    if (playerPositions.length === 0) return;

    const measureCards = () => {
      setPlayerPositions((prev) =>
        prev.map((player) => {
          const cardElement = cardRefs.current?.get(player.id || '');
          if (cardElement) {
            const rect = cardElement.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            const radius = Math.max(width, height) / 2;

            if (Math.abs(player.width - width) > 5 || Math.abs(player.height - height) > 5) {
              return { ...player, width, height, radius };
            }
          }
          return player;
        }),
      );
    };

    const timeout = setTimeout(measureCards, 100);
    return () => clearTimeout(timeout);
  }, [playerPositions.length, cardRefs]);

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

        // Wall collisions
        updated.forEach((player) => {
          applyWallCollisions(player, width, height);
        });

        // Player-to-player collisions
        for (let i = 0; i < updated.length; i++) {
          for (let j = i + 1; j < updated.length; j++) {
            resolveCollision(updated[i], updated[j]);
          }
        }

        // Callback for particle system
        onFrame?.(updated);

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
  }, [playerPositions.length, containerRef, onFrame]);

  const boostAll = () => {
    setPlayerPositions((prev) =>
      prev.map((player) => ({
        ...player,
        vx: player.vx * 1.5 + (Math.random() - 0.5) * 50,
        vy: player.vy * 1.5 + (Math.random() - 0.5) * 50,
      })),
    );
  };

  const boostPlayer = (playerId: string) => {
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

  return { playerPositions, boostAll, boostPlayer };
}
