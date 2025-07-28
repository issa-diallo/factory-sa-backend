import { ZodError } from 'zod';
import {
  DomainAlreadyExistsError,
  CompanyDomainAlreadyExistsError,
  DomainNotFoundError,
  CompanyDomainNotFoundError,
} from './customErrors';
import { ErrorResponse } from '../utils/handleError';

type PrismaKnownError = {
  code: string;
  meta?: {
    target?: string[];
    cause?: string;
  };
};

export function mapDomainError(error: unknown): ErrorResponse {
  // 1. Zod validation errors
  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      message: 'Invalid validation data',
      errors: error.issues,
    };
  }

  // 2. Prisma known errors
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const prismaError = error as PrismaKnownError;

    switch (prismaError.code) {
      case 'P2002': {
        const target = prismaError.meta?.target ?? [];
        const isCompanyDomainConflict =
          target.includes('companyId') && target.includes('domainId');

        return isCompanyDomainConflict
          ? {
              statusCode: 409,
              message: 'Company-domain relationship already exists.',
            }
          : { statusCode: 409, message: 'Domain already exists.' };
      }

      case 'P2025': {
        const cause = prismaError.meta?.cause ?? '';

        if (cause.includes('CompanyDomain')) {
          return {
            statusCode: 404,
            message: 'Company-domain relationship not found.',
          };
        }

        if (cause.includes('Domain')) {
          return { statusCode: 404, message: 'Domain not found.' };
        }

        return { statusCode: 404, message: 'Resource not found (P2025).' };
      }
    }
  }

  // 3. Custom business errors already thrown
  if (error instanceof DomainAlreadyExistsError) {
    return { statusCode: 409, message: error.message };
  }
  if (error instanceof CompanyDomainAlreadyExistsError) {
    return { statusCode: 409, message: error.message };
  }
  if (error instanceof DomainNotFoundError) {
    return { statusCode: 404, message: error.message };
  }
  if (error instanceof CompanyDomainNotFoundError) {
    return { statusCode: 404, message: error.message };
  }

  // 4. Generic fallback for other error instances
  if (error instanceof Error) {
    return { statusCode: 500, message: error.message };
  }

  // 5. Final fallback for truly unknown error shapes
  return { statusCode: 500, message: 'An unknown error occurred' };
}
