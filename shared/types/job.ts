import { JobStatus } from './enums';

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
