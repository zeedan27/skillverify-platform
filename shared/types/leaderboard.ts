import { ApplicationStatus, IntegrityEventType } from './enums';

export interface LeaderboardEntry {
  rank: number;
  applicantId: string;
  fullName: string;
  score: number;
  attemptNumber: 1 | 2;
  cvUrl?: string;           // Only visible to employer
  completedGrooming: boolean;
  passedAt: string;
  applicationStatus?: ApplicationStatus;
  integrityFlags?: number;
  integrityEvents?: {
    type: IntegrityEventType;
    at: string;
  }[];
}

export interface LeaderboardResponse {
  jobId: string;
  jobTitle: string;
  companyName: string;
  totalCandidates: number;
  entries: LeaderboardEntry[];
  // Applicant-scoped: own entry only (rank, score, no cvUrl, no other names)
  selfEntry?: Omit<LeaderboardEntry, 'cvUrl'>;
}
