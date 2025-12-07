'use client';

type GameProgressBarProps = {
  progress: number; // 0 to 1
};

export function GameProgressBar({ progress }: GameProgressBarProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress));

  return (
    <div className="fixed top-0 left-0 right-0 h-2 bg-very-dark z-50">
      <div
        className="h-full bg-linear-to-r from-purple-500 to-purple-400 transition-all duration-300 ease-out"
        style={{ width: `${clampedProgress * 100}%` }}
      />
    </div>
  );
}
