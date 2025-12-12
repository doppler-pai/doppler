'use client';

import { GameModeType } from '@/shared/models/lobby.types';
import { QuizGame } from './QuizGame';

type GameRootProps = {
  gameId: string;
  gameType: GameModeType;
};

export function GameRoot({ gameId, gameType }: GameRootProps) {
  switch (gameType) {
    case GameModeType.QUIZ:
      return <QuizGame gameId={gameId} />;
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
