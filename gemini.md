# gemini.md — SkillVerify Project Constitution
> **AUTHORITATIVE DOCUMENT — DO NOT MODIFY WITHOUT TEAM REVIEW**
> All TypeScript interfaces defined here govern the entire codebase.
> Backend schemas and Frontend types must mirror these definitions exactly.
> Updated: 2026-10-03 | Version: 1.2.0 | Governed by: Lead Developer System Pilot

---

## Architectural Mandate

> The "Data-First" Rule: No React component or NestJS controller may be written
> until the relevant interface in this document is confirmed and locked.
> All PRs that touch shared types require review from at least one other team member.

---

## Part 1: Enumerations

```typescript
// shared/types/enums.ts

export enum Role {
  APPLICANT = 'applicant',
  EMPLOYER  = 'employer',
  ADMIN     = 'admin',
}

export enum QuizAttemptState {
  NOT_STARTED        = 'not_started',
  ATTEMPTED          = 'attempted',
  PASSED             = 'passed',
  FAILED             = 'failed',
  GROOMING_REQUIRED  = 'grooming_required',
  GROOMING_COMPLETE  = 'grooming_complete',
  FINAL_ATTEMPTED    = 'final_attempted',
  FINAL_PASSED       = 'final_passed',
  FINAL_FAILED       = 'final_failed',
  LOCKED             = 'locked',
}

export enum CourseModuleType {
  VIDEO    = 'video',
  TEXT     = 'text',
  FILE     = 'file',
}

export enum JobStatus {
  ACTIVE    = 'active',
  SUSPENDED = 'suspended',
  CLOSED    = 'closed',
}

export enum UserStatus {
  ACTIVE    = 'active',
  SUSPENDED = 'suspended',
  DELETED   = 'deleted',
}

export enum ApplicationStatus {
  NEW         = 'new',
  REVIEWED    = 'reviewed',
  SHORTLISTED = 'shortlisted',
  INTERVIEW   = 'interview',
  OFFERED     = 'offered',
  REJECTED    = 'rejected',
}

export enum NotificationType {
  QUIZ_RESULT         = 'quiz_result',
  GROOMING_UNLOCKED   = 'grooming_unlocked',
  STATUS_CHANGED      = 'status_changed',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  OFFER_SENT          = 'offer_sent',
  NEW_TOP_PERFORMER   = 'new_top_performer',
  INTEGRITY_ALERT     = 'integrity_alert',
  MESSAGE_RECEIVED    = 'message_received',
  BADGE_EARNED        = 'badge_earned',
}

export enum IntegrityEventType {
  TAB_SWITCH      = 'tab_switch',
  WINDOW_BLUR     = 'window_blur',
  FULLSCREEN_EXIT = 'fullscreen_exit',
  COPY_PASTE      = 'copy_paste',
  CONTEXT_MENU    = 'context_menu',
}

export enum BadgeTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD   = 'gold',
}
```

---

## Part 2: Auth & User Profiles

```typescript
// shared/types/auth.ts

export interface TokenPayload {
  sub: string;          // userId (MongoDB ObjectId as string)
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterApplicantDto {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

export interface RegisterEmployerDto {
  email: string;
  password: string;
  companyName: string;
  companyWebsite?: string;
  contactPerson: string;
  phone: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
```

```typescript
// shared/types/user.ts

export interface BaseUser {
  _id: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;   // ISO 8601
  updatedAt: string;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number;
  isCurrent: boolean;
}

export interface WorkExperience {
  company: string;
  title: string;
  description?: string;
  startDate: string;   // ISO 8601
  endDate?: string;
  isCurrent: boolean;
}

export interface ApplicantProfile extends BaseUser {
  role: Role.APPLICANT;
  fullName: string;
  phone: string;
  profilePhotoUrl?: string;
  headline?: string;
  skills: string[];
  education: Education[];
  experience: WorkExperience[];
  isPublic?: boolean;
  publicSlug?: string;
}

export interface UpdateApplicantProfileDto {
  fullName?: string;
  phone?: string;
  headline?: string;
  skills?: string[];
  education?: Education[];
  experience?: WorkExperience[];
  profilePhotoUrl?: string;
  isPublic?: boolean;
  publicSlug?: string;
}

export interface EmployerProfile extends BaseUser {
  role: Role.EMPLOYER;
  companyName: string;
  companyWebsite?: string;
  contactPerson: string;
  phone: string;
  logoUrl?: string;
}

export interface UpdateEmployerProfileDto {
  companyName?: string;
  companyWebsite?: string;
  contactPerson?: string;
  phone?: string;
  logoUrl?: string;
}

export interface AdminProfile extends BaseUser {
  role: Role.ADMIN;
  fullName: string;
}
```

---

## Part 3: Job Circulars

```typescript
// shared/types/job.ts

export interface JobCircular {
  _id: string;
  employerId: string;
  companyName: string;
  title: string;
  description: string;
  requiredSkills: string[];
  location: string;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  deadline: string;        // ISO 8601
  status: JobStatus;
  quizId?: string;         // Populated after quiz is attached
  courseId?: string;       // Populated after grooming course is attached
  passingScore: number;    // 0-100, default 70
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobDto {
  title: string;
  description: string;
  requiredSkills: string[];
  location: string;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  deadline: string;
  passingScore?: number;
}

export interface UpdateJobDto extends Partial<CreateJobDto> {
  status?: JobStatus;
}
```

---

## Part 4: Quiz Engine

```typescript
// shared/types/quiz.ts

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
```

---

## Part 5: Course & Progress Tracking

```typescript
// shared/types/course.ts

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
```

```typescript
// shared/types/progress.ts

export interface ModuleProgress {
  moduleId: string;
  completed: boolean;
  checkpointPassed?: boolean;
  completedAt?: string;
}

export interface CourseProgress {
  _id: string;
  applicantId: string;
  courseId: string;
  jobId: string;
  moduleProgress: ModuleProgress[];
  completed: boolean;        // true when ALL modules are completed
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarkModuleCompleteDto {
  courseId: string;
  moduleId: string;
  checkpointAnswers?: (number | number[])[];
}
```

---

## Part 6: CV Generation

```typescript
// shared/types/cv.ts

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
```

---

## Part 7: Leaderboard

```typescript
// shared/types/leaderboard.ts

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
```

```typescript
// shared/types/pipeline.ts

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
```

---

## Part 8: Skill Badges & Verification

```typescript
// shared/types/badge.ts

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
```

---

## Part 9: Notification Center

```typescript
// shared/types/notification.ts

export interface AppNotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export type Notification = AppNotification;
```

---

## Part 10: Career Intelligence & AI Generation

```typescript
// shared/types/public.ts

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
```

---

## Part 11: Admin Operations

```typescript
// shared/types/admin.ts

export interface AuditLog {
  _id: string;
  adminId: string;
  action: AdminAction;
  targetType: 'user' | 'job' | 'company' | 'course' | 'quiz';
  targetId: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export type AdminAction =
  | 'SUSPEND_USER'
  | 'DELETE_USER'
  | 'RESTORE_USER'
  | 'SUSPEND_JOB'
  | 'DELETE_JOB'
  | 'RESTORE_JOB'
  | 'SUSPEND_COMPANY'
  | 'DELETE_COMPANY'
  | 'DELETE_COURSE'
  | 'DELETE_QUIZ'
  | 'OVERRIDE_QUIZ_STATE';

export interface AdminActionDto {
  targetType: 'user' | 'job' | 'company' | 'course' | 'quiz';
  targetId: string;
  reason?: string;
}
```

---

## Part 12: API Response Envelope

```typescript
// shared/types/api.ts

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}
```

---

## Part 13: Business Rules (Non-Negotiable)

```
RULE-001: An applicant MUST NOT see the Apply button unless QuizAttempt.state === PASSED or FINAL_PASSED
RULE-002: A QuizAttempt allows a maximum of 2 attempts per (applicantId, jobId) pair
RULE-003: The FINAL_ATTEMPT is only unlocked when CourseProgress.completed === true
RULE-004: CVs are NEVER manually uploaded; they are always generated from ApplicantProfile data
RULE-005: Leaderboard scope is strictly per (companyId, jobId); cross-job or cross-company ranking is FORBIDDEN
RULE-006: Applicants viewing the leaderboard see ONLY their own rank and score
RULE-007: All admin destructive actions MUST produce an AuditLog entry
RULE-008: Quiz question count MUST be between 10 and 20 (inclusive)
RULE-009: Passing score threshold MUST be between 50 and 100 (employer-configurable, default: 70)
RULE-010: The LOCKED state may only be reversed by an Admin via AdminAction.OVERRIDE_QUIZ_STATE
RULE-011: Server enforces quiz time limit using server timestamp (startedAt) with a 15-second network grace window
RULE-012: An applicant may only view question-level correct answers and explanations after passing or after final attempt, never after attempt 1 failure
RULE-013: Employers can access a candidate's CV and hiring pipeline only for jobs they own where the candidate is PASSED or FINAL_PASSED
RULE-014: An admin override that reopens an attempt archives previous attempts into AuditLog metadata and resets the attempt counter
RULE-015: For multi-select questions (isMultiple === true), full credit requires all correct options and no incorrect options selected
RULE-016: Notifications are strictly private; only readable and markable by their owner (userId)
RULE-017: If deliverCount is set on a Quiz, served questions must be a random subset of the question pool; grading evaluates against servedQuestionIds only; deliverCount must be between 10 and 20; pool size must not exceed 40
RULE-018: Exam integrity events (tab switch, window blur, fullscreen exit) never automatically fail an attempt; they are recorded as audit events advisory to employers and admins
RULE-019: A grooming course module with a checkpoint micro-quiz is marked completed only when checkpointPassed === true (reinforces RULE-003)
RULE-020: Skill badges are generated server-side only upon PASSED or FINAL_PASSED status, with a unique 12-character cryptographic verifyCode, limited to one badge per (applicantId, jobId) pair
RULE-021: Direct messaging is strictly restricted between an employer and applicants who have attained PASSED or FINAL_PASSED for that specific employer's job
RULE-022: Interview scheduling and offer issuance may only be initiated by the owning employer for candidates currently in an active pipeline stage
RULE-023: Public portfolio view (/verify/:slug) only reveals opt-in verified credentials (skills, badges, quiz scores) and MUST NEVER expose private applicant contact details (email, phone)
RULE-024: AI-generated quiz questions are always saved as unattached drafts; employers or admins must review, verify answer keys, and explicitly confirm attachment before the quiz goes live
```

---

## Part 14: Architecture SOPs (Self-Annealing Procedures)

### SOP-001: NestJS Circular Dependency
**Symptom:** `Nest cannot create the X instance. The module at index [Y] of the Z "imports" array is undefined.`
**Fix:** Use `forwardRef(() => ModuleName)` in both modules' imports array. Prefer restructuring to avoid the circular dependency entirely.

### SOP-002: PDF Generation Failure (Puppeteer)
**Symptom:** `Error: Failed to launch the browser process` or memory OOM
**Fix:** Ensure `--no-sandbox --disable-setuid-sandbox` flags in Puppeteer launch config. If persists, switch to `pdfmake` fallback. Update this SOP with resolution.

### SOP-003: Firebase Storage Upload Failure
**Symptom:** `403 Forbidden` or `storage/unauthorized`
**Fix:** Check Firebase Storage Rules allow authenticated writes to `/grooming/` and `/cvs/`. Verify service account has `Storage Admin` role. Check FIREBASE_PRIVATE_KEY newline escaping in .env.

### SOP-004: Quiz State Corruption
**Symptom:** Applicant stuck in wrong state or able to take >2 attempts
**Fix:** Query QuizAttempt document, verify `attempts[]` length. Use MongoDB transactions for state transitions. Trigger admin override if needed. Add integration test covering the full state machine.

### SOP-005: JWT Expiry Issues
**Symptom:** `401 Unauthorized` on valid sessions
**Fix:** Verify `JWT_EXPIRES_IN` and `JWT_REFRESH_EXPIRES_IN` in .env. Ensure frontend Axios interceptor handles 401 by calling `/auth/refresh` before retrying.

---

## Changelog

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0.0 | 2026-09-01 | Antigravity (Lead Pilot) | Initial constitution created; all interfaces locked for Week 1 |
| 1.1.0 | 2026-10-03 | Antigravity (Lead Pilot) | Added ApplicationStatus, Pipeline management, Password reset DTOs, Profile update DTOs, Multi-answer quiz support, Server timer & integrity flags, Rules 011-015 |
| 1.2.0 | 2026-10-03 | Antigravity (Lead Pilot) | Added Notification center, Anti-cheat integrity events & question pools, Checkpoint micro-quizzes, Skill badges, Hiring pipeline scheduling/offers/messaging, Public portfolios & AI generation contracts, Rules 016-024 |
