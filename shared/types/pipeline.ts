import { ApplicationStatus } from './enums';

export interface CandidateReview {
  _id: string;
  jobId: string;
  applicantId: string;
  employerId: string;
  status: ApplicationStatus;
  note?: string;
  history: {
    status: ApplicationStatus;
    changedAt: string;
    note?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCandidateStatusDto {
  status: ApplicationStatus;
  note?: string;
  messageToCandidate?: string;
}

export interface InterviewSchedule {
  jobId: string;
  applicantId: string;
  employerId: string;
  scheduledAt: string;     // ISO 8601
  durationMins: number;
  meetingLink: string;
  notes?: string;
  createdAt: string;
}

export interface ScheduleInterviewDto {
  scheduledAt: string;
  durationMins: number;
  meetingLink: string;
  notes?: string;
}

export interface OfferLetter {
  jobId: string;
  applicantId: string;
  employerId: string;
  salary: {
    amount: number;
    currency: string;
  };
  startDate: string;        // ISO 8601
  terms?: string;
  pdfUrl?: string;
  createdAt: string;
}

export interface SendOfferDto {
  salary: {
    amount: number;
    currency: string;
  };
  startDate: string;
  terms?: string;
}

export interface Message {
  _id: string;
  jobId: string;
  senderId: string;
  recipientId: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface SendMessageDto {
  jobId: string;
  recipientId: string;
  body: string;
}

