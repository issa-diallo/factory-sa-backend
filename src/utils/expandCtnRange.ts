import { RANGE_SEPARATORS } from '../constants';
import { Result, createSuccess, createError } from '../types/result';
import {
  CtnRangeInputSchema,
  CtnRangeOutputSchema,
} from '../schemas/utilsSchemas';

/**
 * Receives a string of type "265-->267" or "300-303 or 150".
 * and returns all CTNs in the range as an array of numbers.
 * If the value is not a valid range, try to convert it to a simple number.
 *
 * @param ctnRaw - The raw CTN string to expand
 * @returns Result object with success/error status and data/error details
 */
export function expandCtnRange(ctnRaw: string): Result<number[]> {
  // Validate input with Zod
  const inputValidation = CtnRangeInputSchema.safeParse(ctnRaw);
  if (!inputValidation.success) {
    return createError(
      inputValidation.error.errors[0]?.message || 'Invalid input',
      'INVALID_INPUT'
    );
  }

  const raw = inputValidation.data;

  // Try to parse as range first
  for (const sep of RANGE_SEPARATORS) {
    if (raw.includes(sep)) {
      const parts = raw.split(sep).map(part => part.trim());

      if (parts.length !== 2) {
        return createError(
          `Invalid range format - expected: number${sep}number`,
          'INVALID_RANGE_FORMAT'
        );
      }

      const [startStr, endStr] = parts;
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end)) {
        return createError(
          'Start and end values must be valid numbers',
          'INVALID_RANGE_NUMBERS'
        );
      }

      if (start > end) {
        return createError(
          `Invalid range: ${start} is greater than ${end}`,
          'INVALID_RANGE_ORDER'
        );
      }

      if (start <= 0 || end <= 0) {
        return createError(
          'CTN numbers must be positive integers',
          'INVALID_RANGE_VALUES'
        );
      }

      const result = Array.from(
        { length: end - start + 1 },
        (_, i) => start + i
      );

      // Validate output
      const outputValidation = CtnRangeOutputSchema.safeParse(result);
      if (!outputValidation.success) {
        return createError(
          'Error during range generation',
          'RANGE_GENERATION_ERROR'
        );
      }

      return createSuccess(outputValidation.data);
    }
  }

  // Try to parse as single number
  const single = parseInt(raw, 10);
  if (isNaN(single)) {
    return createError(
      'Unrecognized value - must be a number or a range (e.g., 100-105)',
      'INVALID_NUMBER_FORMAT'
    );
  }

  if (single <= 0) {
    return createError(
      'CTN number must be a positive integer',
      'INVALID_NUMBER_VALUE'
    );
  }

  const result = [single];

  // Validate output
  const outputValidation = CtnRangeOutputSchema.safeParse(result);
  if (!outputValidation.success) {
    return createError(
      'Error during number validation',
      'NUMBER_VALIDATION_ERROR'
    );
  }

  return createSuccess(outputValidation.data);
}
