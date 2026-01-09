export enum QuestionType {
  FOUR_OPTIONS = 'four_options',
  TRUE_FALSE = 'true_false',
}

export type FourOptionsAnswer = {
  answer: string;
  isCorrect: boolean;
};

export type FourOptionsMetadata = {
  question: string;
  answers: [FourOptionsAnswer, FourOptionsAnswer, FourOptionsAnswer, FourOptionsAnswer];
};

export type TrueFalseMetadata = {
  question: string;
  correctAnswer: boolean;
};

export type Question =
  | { type: QuestionType.FOUR_OPTIONS; metadata: FourOptionsMetadata }
  | { type: QuestionType.TRUE_FALSE; metadata: TrueFalseMetadata };

export type SetData = {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  ownerId: string;
  questions: Question[];
};
