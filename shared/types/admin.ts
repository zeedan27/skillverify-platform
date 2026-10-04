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

export interface AuditLog {
  _id: string;
  adminId: string;
  action: AdminAction;
  targetType: 'user' | 'job' | 'company' | 'course' | 'quiz';
  targetId: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface AdminActionDto {
  targetType: 'user' | 'job' | 'company' | 'course' | 'quiz';
  targetId: string;
  reason?: string;
}
