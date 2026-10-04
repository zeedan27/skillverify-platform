import { Education, WorkExperience } from './user';

export interface CVQuizScore {
  jobTitle: string;
  companyName: string;
  score: number;
  passedAt: string;
}

export interface CVTemplateData {
  fullName: string;
  email: string;
  phone: string;
  headline?: string;
  profilePhotoUrl?: string;
  skills: string[];
  education: Education[];
  experience: WorkExperience[];
  quizScores: CVQuizScore[];
  badges?: {
    skill: string;
    tier: string;
    score: number;
    verifyCode: string;
    jobTitle: string;
  }[];
  generatedAt: string;       // ISO 8601
}

export interface GeneratedCV {
  _id: string;
  applicantId: string;
  pdfUrl: string;            // Firebase Storage signed URL
  version: number;
  generatedAt: string;
  expiresAt: string;         // Signed URL expiry
}

export interface CVResponse {
  downloadUrl: string;
  generatedAt: string;
  expiresAt: string;
}
