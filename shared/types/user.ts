import { Role, UserStatus } from './enums';

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
