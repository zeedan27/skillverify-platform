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

