
export interface WordEntry {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  remarks?: string;
}

export enum QuizState {
  LOADING = 'LOADING',
  NOT_STARTED = 'NOT_STARTED',
  ONGOING = 'ONGOING',
  SHOWING_FEEDBACK = 'SHOWING_FEEDBACK',
  SET_COMPLETED = 'SET_COMPLETED',
  ALL_COMPLETED = 'ALL_COMPLETED',
}

export interface QuizSetResult {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  incorrectWordsInSet: string; // Comma-separated list of words for simplicity in display
}
