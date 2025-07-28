import { Response } from 'express';
import { ZodError } from 'zod';
import {
  DomainAlreadyExistsError,
  DomainNotFoundError,
  CompanyDomainNotFoundError,
  CompanyAlreadyExistsError,
  CompanyDomainAlreadyExistsError,
} from '../errors/customErrors';

export interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: unknown;
}

export function handleError(
  res: Response,
  error: unknown | ErrorResponse
): Response {
  // If the error is already a structured ErrorResponse, use it directly.
  if (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    'message' in error
  ) {
    const structuredError = error as ErrorResponse;
    return res.status(structuredError.statusCode).json({
      message: structuredError.message,
      errors: structuredError.errors,
    });
  }

  // Existing logic for unstructured errors (will mainly be used by mappers)
  // Zod error (validation) - This part will be used less often because it is managed in BaseController
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Invalid validation data',
      errors: error.issues,
    });
  }

  // Already exists errors (custom errors or Prisma P2002)
  if (
    error instanceof DomainAlreadyExistsError ||
    error instanceof CompanyAlreadyExistsError ||
    error instanceof CompanyDomainAlreadyExistsError
  ) {
    return res.status(409).json({ message: error.message });
  }

  // Handle Prisma P2002 unique constraint violation
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  ) {
    return res.status(409).json({ message: 'Resource already exists.' });
  }

  // Not found errors
  if (
    error instanceof DomainNotFoundError ||
    error instanceof CompanyDomainNotFoundError
  ) {
    return res.status(404).json({ message: error.message });
  }

  // Default (500)
  const appError =
    error instanceof Error ? error : new Error('An unknown error occurred');

  return res.status(500).json({ message: appError.message });
}
