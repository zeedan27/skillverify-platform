import { BadgeTier } from './enums';

export interface SkillBadge {
  _id: string;
  applicantId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  skill: string;
  tier: BadgeTier;
  score: number;
  issuedAt: string;
  verifyCode: string;
}

export interface VerifyBadgeResponse {
  valid: boolean;
  badge?: SkillBadge;
  applicantName?: string;
}
