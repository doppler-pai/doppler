import { useState, useEffect } from 'react';

export function useCountdown(durationMs: number, isActive: boolean, resetKey?: unknown): number {
  const [timeLeft, setTimeLeft] = useState(Math.ceil(durationMs / 1000));

  useEffect(() => {
    setTimeLeft(Math.ceil(durationMs / 1000));
  }, [durationMs, resetKey]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, resetKey]);

  return timeLeft;
}
