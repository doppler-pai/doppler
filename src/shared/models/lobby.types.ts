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

// Per-player stats
export type PlayerStats = {
  correct: number;
  incorrect: number;
};

// Universal game stats - works across all game modes
export type GameStats = {
  totalCorrect: number;
  totalIncorrect: number;
  totalAnswers: number;
  playerStats?: Record<string, PlayerStats>; // playerId -> stats
};

export type QuizMetadata = {
  currentRound: number;
  points: Record<string, number>;
  answers: Record<string, number>; // playerId -> answerIndex (0-3)
  showResults?: boolean; // true when displaying correct answer between rounds
  correctAnswerIndices?: number[]; // indices of all correct answers for current question
  resultsShownAt?: number; // timestamp when results were shown (for timeout)
  stats?: GameStats; // aggregated game statistics
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
