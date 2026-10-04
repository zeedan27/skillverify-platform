import { SkillBadge } from './badge';
import { CVQuizScore } from './cv';
import { QuizQuestion } from './quiz';

export interface PublicPortfolio {
  fullName: string;
  headline?: string;
  skills: string[];
  badges: SkillBadge[];
  verifiedScores: CVQuizScore[];
}

export interface JobMatch {
  jobId: string;
  matchPercent: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface GenerateQuizAiDto {
  jobId: string;
  count?: number;
  difficultyMix?: {
    easy: number;
    medium: number;
    hard: number;
  };
  multiRatio?: number;
}

export interface GeneratedQuizResponse {
  questions: Omit<QuizQuestion, '_id'>[];
  source: 'gemma4-cloud' | 'llama3-local' | 'template';
  warnings?: string[];
}
