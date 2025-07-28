export interface PrismaClientKnownRequestErrorLike {
  code: string;
  name: string;
}

/**
 * Check if the error is a PrismaClientKnownRequestError with a specific code.
 */
export function isPrismaError(
  error: unknown,
  code: string
): error is PrismaClientKnownRequestErrorLike {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'name' in error &&
    (error as Record<string, unknown>).code === code &&
    (error as Record<string, unknown>).name === 'PrismaClientKnownRequestError'
  );
}
