import { ZodError } from 'zod';
import {
  DomainAlreadyExistsError,
  CompanyDomainAlreadyExistsError,
  DomainNotFoundError,
  CompanyDomainNotFoundError,
} from './customErrors';

type PrismaKnownError = {
  code: string;
  meta?: {
    target?: string[];
    cause?: string;
  };
};

export function mapDomainError(error: unknown): Error {
  // 1. Zod validation errors
  if (error instanceof ZodError) return error;

  // 2. Prisma known errors
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const prismaError = error as PrismaKnownError;

    switch (prismaError.code) {
      case 'P2002': {
        const target = prismaError.meta?.target ?? [];
        const isCompanyDomainConflict =
          target.includes('companyId') && target.includes('domainId');

        return isCompanyDomainConflict
          ? new CompanyDomainAlreadyExistsError()
          : new DomainAlreadyExistsError();
      }

      case 'P2025': {
        const cause = prismaError.meta?.cause ?? '';

        if (cause.includes('CompanyDomain')) {
          return new CompanyDomainNotFoundError(
            'Company-domain relationship not found.'
          );
        }

        if (cause.includes('Domain')) {
          return new DomainNotFoundError('Domain not found.');
        }

        return new Error('Resource not found (P2025).');
      }
    }
  }

  // 3. Custom business errors already thrown
  if (
    error instanceof DomainNotFoundError ||
    error instanceof CompanyDomainNotFoundError
  ) {
    return error;
  }

  // 4. Generic fallback for other error instances
  if (error instanceof Error) return error;

  // 5. Final fallback for truly unknown error shapes
  return new Error('An unknown error occurred');
}
