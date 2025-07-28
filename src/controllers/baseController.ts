import { Response } from 'express';
import { handleError as handleGenericError } from '../utils/handleError';
import { ZodError } from 'zod';
import { isPrismaError } from '../utils/isPrismaError';

export interface ErrorMapper {
  (err: unknown): { statusCode: number; message: string; errors?: unknown };
}

export abstract class BaseController {
  protected handleError(
    res: Response,
    error: unknown,
    errorMapper?: ErrorMapper
  ): Response {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Invalid validation data',
        errors: error.issues,
      });
    }

    if (isPrismaError(error, 'P2002')) {
      return res.status(409).json({ message: 'Resource already exists.' });
    }

    if (errorMapper) {
      return handleGenericError(res, errorMapper(error));
    }

    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
