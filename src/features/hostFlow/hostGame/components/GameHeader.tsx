'use client';

type GameHeaderProps = {
  primaryText: string;
  secondaryText: string;
};

export function GameHeader({ primaryText, secondaryText }: GameHeaderProps) {
  return (
    <div className="flex flex-col items-start gap-1">
      <h2 className="text-muted">{primaryText}</h2>
      <h3 className="text-muted">{secondaryText}</h3>
    </div>
  );
}
