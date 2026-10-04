import { Role } from './enums';

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
