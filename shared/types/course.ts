import { CourseModuleType } from './enums';
import { QuizQuestion } from './quiz';

export interface CourseModule {
  _id: string;
  title: string;
  type: CourseModuleType;
  order: number;
  content: {
    text?: string;           // For TEXT type
    fileUrl?: string;        // For FILE and VIDEO types (Firebase Storage URL)
    fileName?: string;
    durationSeconds?: number; // For VIDEO type
  };
  checkpoint?: {
    questions: Omit<QuizQuestion, '_id'>[];
    minCorrect: number;
  };
}

export interface Course {
  _id: string;
  jobId: string;
  employerId: string;
  title: string;
  description?: string;
  modules: CourseModule[];   // Ordered list
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseDto {
  jobId: string;
  title: string;
  description?: string;
  modules: Omit<CourseModule, '_id'>[];
}
