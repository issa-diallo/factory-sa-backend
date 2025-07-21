export type Result<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      code: string;
    };

export const createSuccess = <T>(data: T): Result<T> => ({
  success: true,
  data,
});

export const createError = <T>(error: string, code: string): Result<T> => ({
  success: false,
  error,
  code,
});

export const isErrorResult = <T>(
  result: Result<T>
): result is { success: false; error: string; code: string } => !result.success;
