import { QuizAttemptState, IntegrityEventType } from './enums';

export interface QuizQuestion {
  _id: string;
  text: string;
  options: string[];         // Exactly 4 options
  correctIndex?: number;     // 0-3, index into options[] (single choice)
  correctIndices?: number[]; // indices into options[] (for multiple correct answers)
  isMultiple?: boolean;      // True if question allows multiple answers
  explanation?: string;      // Shown after quiz submission
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Quiz {
  _id: string;
  jobId: string;
  employerId: string;
  questions: QuizQuestion[]; // 10 to 40 questions (pool)
  passingScore: number;      // Mirrors job.passingScore
  timeLimit?: number;        // In minutes; undefined = no limit
  poolSize?: number;         // Total questions in pool
  deliverCount?: number;     // Number of questions delivered to applicant (10-20)
  shuffleOptions?: boolean;  // Whether to randomize option order
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuizDto {
  jobId: string;
  questions: Omit<QuizQuestion, '_id'>[];
  timeLimit?: number;
  poolSize?: number;
  deliverCount?: number;
  shuffleOptions?: boolean;
}

export interface QuizSubmission {
  quizId: string;
  jobId: string;
  answers: (number | number[])[]; // One index or array of indices per question
  submittedAt: string;
}

export interface QuizResult {
  quizAttemptId: string;
  score: number;             // 0-100 percentage
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  nextState: QuizAttemptState;
  breakdown?: {
    questionId: string;
    selectedIndex?: number;
    selectedIndices?: number[];
    correctIndex?: number;
    correctIndices?: number[];
    isCorrect: boolean;
    explanation?: string;
  }[];
}

export interface QuizAttempt {
  _id: string;
  applicantId: string;
  jobId: string;
  quizId: string;
  state: QuizAttemptState;
  startedAt?: string;        // Server timestamp for timer enforcement (RULE-011)
  integrityFlags?: number;   // Tab-switching / blur event count
  servedQuestionIds?: string[]; // IDs of questions served to applicant
  integrityEvents?: {
    type: IntegrityEventType;
    at: string;
  }[];
  attempts: {
    attemptNumber: 1 | 2;
    score: number;
    submittedAt: string;
    answers: (number | number[])[];
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface RecordIntegrityEventDto {
  type: IntegrityEventType;
}

