import { ZodError } from 'zod';
import { CompanyAlreadyExistsError } from './customErrors';
import { ErrorResponse } from '../utils/handleError';

export function mapCompanyError(error: unknown): ErrorResponse {
  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      message: 'Invalid validation data',
      errors: error.issues,
    };
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  ) {
    // Handle Prisma unique constraint error for the company name
    return { statusCode: 409, message: 'Resource already exists.' };
  }

  if (error instanceof CompanyAlreadyExistsError) {
    return { statusCode: 409, message: error.message };
  }

  if (error instanceof Error) {
    return { statusCode: 500, message: error.message };
  }

  return { statusCode: 500, message: 'An unknown error occurred' };
}
