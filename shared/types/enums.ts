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

