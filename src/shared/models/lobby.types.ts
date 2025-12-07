export enum GameModeType {
  TIME = 'time',
  QUIZ = 'quiz',
  POINTS = 'points',
}

export enum LobbyStatus {
  QUEUED = 'queued',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export type PlayerData = { id?: string; nick?: string; skinId?: string };

export type QuizMetadata = {
  currentRound: number;
  points: Record<string, number>;
};

export type LobbyData = {
  hostId: string;
  setId: string;
  status: LobbyStatus;
  type: GameModeType;
  metadata: Record<string, unknown>;
  createdAt: number;
  players: Record<string, PlayerData>;
};
