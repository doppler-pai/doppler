export type Answer = {
  answer: string;
  isCorrect: boolean;
};

export type Data = {
  answers: Answer[];
  question: string;
};

export type Question = {
  type: string;
  data: Data;
};

export type SetData = {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  ownerId: string;
  questions: Question[];
};
