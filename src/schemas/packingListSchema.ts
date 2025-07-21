import { z, ZodError } from 'zod';

/**
 * Zod schema for a packing list row.
 *
 * This schema validates the structure of an Excel data row with:
 * - Mandatory fields with specific types
 * - Optional PAL field (may not exist)
 * - Dynamic fields (PAL_1, CTN_2, QTY_3, etc.) via catchall
 */
const packingListRowSchema = z
  .object({
    LINE: z.number(),
    'SKU MIN': z.string(),
    MAKE: z.string(),
    MODEL: z.string(),
    'DESCRIPTION MIN': z.string(),
    'QTY REQ MATCH': z.number(),
    'QTY ALLOC': z
      .number()
      .nullish()
      .transform(val => (val === undefined ? null : val)),
    ORIGIN: z.string().optional(),
    EAN: z.number().optional(),
    PAL: z.number().optional(),
    CTN: z.union([z.string(), z.number()]),
    QTY: z.number(),
  })
  .catchall(z.union([z.string(), z.number()]));

/**
 * Schema for a complete array of packing list rows.
 * Validates that req.body is an array of objects respecting packingListRowSchema.
 */
export const packingListSchema = z.array(packingListRowSchema);

/**
 * TypeScript types automatically inferred from Zod schemas.
 * These types are synchronized with validation - if the schema changes, the types also change.
 */
export type PackingListRow = z.infer<typeof packingListRowSchema>;
export type PackingListData = z.infer<typeof packingListSchema>;

/**
 * Interface for formatted errors with line information.
 */
export interface FormattedValidationError {
  line: number | string;
  field: string;
  error: string;
  receivedValue?: string;
  expectedValue?: string;
  code: string;
}

/**
 * Formats Zod validation errors with line numbers
 * for precise problem identification.
 */
export const formatValidationErrors = (
  error: ZodError,
  data: unknown
): FormattedValidationError[] => {
  return error.issues.map(issue => {
    const rowIndex = issue.path[0] as number;
    const fieldName = issue.path[1] as string;

    // Get the line number from the data
    const lineNumber =
      Array.isArray(data) && data[rowIndex]?.LINE
        ? data[rowIndex].LINE
        : `Index ${rowIndex}`;

    // Map invalid_union to invalid_type for consistent error codes
    const errorCode =
      issue.code === 'invalid_union' ? 'invalid_type' : issue.code;

    return {
      line: lineNumber,
      field: fieldName,
      error: issue.message,
      receivedValue: 'received' in issue ? String(issue.received) : undefined,
      expectedValue: 'expected' in issue ? String(issue.expected) : undefined,
      code: errorCode,
    };
  });
};

/**
 * Utility function to validate packing list data.
 * Returns an object with success/error for clean error handling.
 */
export const validatePackingListData = (data: unknown) => {
  return packingListSchema.safeParse(data);
};
