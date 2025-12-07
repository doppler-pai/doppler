'use client';

import { GameModeType } from '@/shared/models/lobby.types';
import { QuizHostGame } from './QuizHostGame';

type HostGameRootProps = {
  gameId: string;
  gameType: GameModeType;
};

export function HostGameRoot({ gameId, gameType }: HostGameRootProps) {
  switch (gameType) {
    case GameModeType.QUIZ:
      return <QuizHostGame gameId={gameId} />;
    case GameModeType.TIME:
      return (
        <div className="flex h-screen w-screen items-center justify-center">
          <p>Time mode coming soon...</p>
        </div>
      );
    case GameModeType.POINTS:
      return (
        <div className="flex h-screen w-screen items-center justify-center">
          <p>Points mode coming soon...</p>
        </div>
      );
  }
}
