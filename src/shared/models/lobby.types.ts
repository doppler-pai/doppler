export enum GameModeType {
  TIME = 'TIME',
  QUIZ = 'QUIZ',
  POINTS = 'POINTS',
}

export enum LobbyStatus {
  QUEUED = 'QUEUED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export type PlayerData = { id: string; nick: string; skinId: string };

export type LobbyData = {
  hostId: string;
  setId: string;
  status: LobbyStatus;
  type: GameModeType;
  metadata: Record<string, unknown>;
  createdAt: number;
  players: Record<string, PlayerData>;
};
