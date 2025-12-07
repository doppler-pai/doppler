export const BOUNCE_DAMPING = 0.8;
export const MAX_PARTICLES = 200;
export const PARTICLE_SPAWN_RATE = 0.3;

export interface PhysicsBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  radius: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  hue: number;
}

export function applyWallCollisions(body: PhysicsBody, containerWidth: number, containerHeight: number): void {
  const halfWidth = body.width / 2;
  const halfHeight = body.height / 2;

  if (body.x - halfWidth <= 0) {
    body.x = halfWidth;
    body.vx = Math.abs(body.vx) * BOUNCE_DAMPING;
  } else if (body.x + halfWidth >= containerWidth) {
    body.x = containerWidth - halfWidth;
    body.vx = -Math.abs(body.vx) * BOUNCE_DAMPING;
  }

  if (body.y - halfHeight <= 0) {
    body.y = halfHeight;
    body.vy = Math.abs(body.vy) * BOUNCE_DAMPING;
  } else if (body.y + halfHeight >= containerHeight) {
    body.y = containerHeight - halfHeight;
    body.vy = -Math.abs(body.vy) * BOUNCE_DAMPING;
  }
}

export function checkAABBCollision(
  p1: PhysicsBody,
  p2: PhysicsBody,
): { colliding: boolean; overlapX: number; overlapY: number; dx: number; dy: number } {
  const p1Left = p1.x - p1.width / 2;
  const p1Right = p1.x + p1.width / 2;
  const p1Top = p1.y - p1.height / 2;
  const p1Bottom = p1.y + p1.height / 2;

  const p2Left = p2.x - p2.width / 2;
  const p2Right = p2.x + p2.width / 2;
  const p2Top = p2.y - p2.height / 2;
  const p2Bottom = p2.y + p2.height / 2;

  const colliding = p1Right > p2Left && p1Left < p2Right && p1Bottom > p2Top && p1Top < p2Bottom;

  if (!colliding) {
    return { colliding: false, overlapX: 0, overlapY: 0, dx: 0, dy: 0 };
  }

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const overlapX = Math.min(p1Right - p2Left, p2Right - p1Left);
  const overlapY = Math.min(p1Bottom - p2Top, p2Bottom - p1Top);

  return { colliding: true, overlapX, overlapY, dx, dy };
}

export function resolveCollision(p1: PhysicsBody, p2: PhysicsBody): void {
  const { colliding, overlapX, overlapY, dx, dy } = checkAABBCollision(p1, p2);

  if (!colliding) return;

  if (overlapX < overlapY) {
    const separationX = (overlapX / 2) * (dx > 0 ? 1 : -1);
    p1.x -= separationX;
    p2.x += separationX;

    const temp = p1.vx;
    p1.vx = p2.vx * BOUNCE_DAMPING;
    p2.vx = temp * BOUNCE_DAMPING;
  } else {
    const separationY = (overlapY / 2) * (dy > 0 ? 1 : -1);
    p1.y -= separationY;
    p2.y += separationY;

    const temp = p1.vy;
    p1.vy = p2.vy * BOUNCE_DAMPING;
    p2.vy = temp * BOUNCE_DAMPING;
  }
}
