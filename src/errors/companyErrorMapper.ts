import { ZodError } from 'zod';
import { CompanyAlreadyExistsError } from './customErrors';

export function mapCompanyError(error: unknown): Error {
  if (error instanceof ZodError) {
    return error;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  ) {
    // Handle Prisma unique constraint error for the company name
    return new CompanyAlreadyExistsError();
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('An unknown error occurred');
}
