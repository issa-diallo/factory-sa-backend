export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

import { ZodError } from 'zod';

export interface TokenPayload {
  userId: string;
  companyId: string;
  roleId: string;
  roleName: string;
  permissions: string[];
  isSystemAdmin: boolean;
}

export interface AppError extends Error {
  name: string;
  message: string;
}

export type AuthError = AppError | ZodError;
