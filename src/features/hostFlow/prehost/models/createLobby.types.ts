import { GameModeType } from '@/shared/models/lobby.types';

export interface CreateLobbyParams {
  setId: string;
  type: GameModeType;
  timeValue?: number;
  pointsValue?: number;
}
