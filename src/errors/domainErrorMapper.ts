import { ZodError } from 'zod';
import { DomainAlreadyExistsError } from './customErrors';

export function mapDomainError(error: unknown): Error {
  if (error instanceof ZodError) {
    return error;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  ) {
    return new DomainAlreadyExistsError();
  }

  // If it's an instance of Error, return it as is.
  // This includes ZodError, DomainAlreadyExistsError, DomainNotFoundError, etc.
  if (error instanceof Error) {
    return error;
  }

  // If it's a plain object with a 'code' property (like some Prisma errors not handled above),
  // or any other unknown object, return a generic unknown error.
  // This ensures that non-Error objects are still caught and wrapped.
  if (typeof error === 'object' && error !== null) {
    return new Error('An unknown error occurred');
  }

  // For primitive types or truly unknown errors
  return new Error('An unknown error occurred');
}
