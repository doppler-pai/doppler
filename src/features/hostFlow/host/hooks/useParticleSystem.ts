import { useEffect, useRef, RefObject, useCallback } from 'react';
import { Particle, PhysicsBody, MAX_PARTICLES, PARTICLE_SPAWN_RATE } from '../lib/physics';

interface UseParticleSystemOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
}

export function useParticleSystem({ canvasRef, containerRef }: UseParticleSystemOptions) {
  const particlesRef = useRef<Particle[]>([]);

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
  }, [canvasRef, containerRef]);

  const spawnParticlesForBodies = useCallback((bodies: PhysicsBody[]) => {
    if (particlesRef.current.length >= MAX_PARTICLES) return;

    bodies.forEach((body) => {
      const speed = Math.sqrt(body.vx * body.vx + body.vy * body.vy);
      if (speed > 2 && Math.random() < PARTICLE_SPAWN_RATE) {
        particlesRef.current.push({
          x: body.x + (Math.random() - 0.5) * body.width * 0.5,
          y: body.y + (Math.random() - 0.5) * body.height * 0.5,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 1,
          size: Math.random() * 3 + 2,
          hue: Math.random() * 60 + 180,
        });
      }
    });
  }, []);

  const updateAndRender = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!ctx || !canvas) return;

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
  }, [canvasRef]);

  const onPhysicsFrame = useCallback(
    (bodies: PhysicsBody[]) => {
      spawnParticlesForBodies(bodies);
      updateAndRender();
    },
    [spawnParticlesForBodies, updateAndRender],
  );

  return { onPhysicsFrame };
}
