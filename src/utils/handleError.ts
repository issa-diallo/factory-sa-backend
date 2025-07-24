import { Response } from 'express';
import { ZodError } from 'zod';
import {
  DomainAlreadyExistsError,
  DomainNotFoundError,
  CompanyDomainNotFoundError,
  CompanyAlreadyExistsError, // Import CompanyAlreadyExistsError
} from '../errors/customErrors';

export function handleError(res: Response, error: unknown): Response {
  // Zod error (validation)
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Invalid validation data',
      errors: error.issues,
    });
  }

  // Already exists errors
  if (
    error instanceof DomainAlreadyExistsError ||
    error instanceof CompanyAlreadyExistsError // Add CompanyAlreadyExistsError here
  ) {
    return res.status(409).json({ message: error.message });
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
