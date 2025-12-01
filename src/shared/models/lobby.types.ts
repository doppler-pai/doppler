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

export interface LobbyData {
  hostId: string;
  setId: string;
  status: LobbyStatus;
  type: GameModeType;
  metadata: Record<string, unknown>;
  createdAt: number;
}
