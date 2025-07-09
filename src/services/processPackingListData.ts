import {
  createError,
  createSuccess,
  ProcessedItem,
  ProcessingResult,
  Result,
} from '../types';
import { extractCtnBlocksFromRow } from '../utils/extractCtnBlocksFromRow';

/**
 * Processes packing list data rows and extracts ProcessedItems.
 *
 * @param rows - Array of row data from the packing list
 * @returns Result object with success/error status and data/error details
 */
export function processPackingListData(
  rows: Record<string, string | number>[]
): Result<ProcessingResult> {
  if (!Array.isArray(rows)) {
    return createError('Data must be an array of rows', 'INVALID_INPUT_TYPE');
  }

  if (rows.length === 0) {
    return createError('No data rows provided', 'EMPTY_INPUT');
  }

  const result: ProcessedItem[] = [];
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    if (!row || typeof row !== 'object') {
      errors.push(`Line ${i + 1}: invalid row data`);
      continue;
    }

    const base = {
      description: String(row['DESCRIPTION MIN'] || ''),
      model: String(row['MODEL'] || ''),
      origin: String(row['ORIGIN'] || ''),
    };

    // Validate base data
    if (!base.description.trim() || !base.model.trim() || !base.origin.trim()) {
      errors.push(
        `Line ${i + 1}: missing base data (description, model, origin)`
      );
      continue;
    }

    const itemsResult = extractCtnBlocksFromRow(row, base);

    if (itemsResult.success) {
      result.push(...itemsResult.data);
    } else {
      if (itemsResult.code === 'INCOMPLETE_GROUP') {
        return createError(
          `Line ${i + 1}: ${itemsResult.error}`,
          itemsResult.code
        );
      }
      // Try fallback logic if CTN extraction failed
      const fallbackQty = Number(row['QTY']) || 0;
      if (fallbackQty > 0) {
        result.push({
          ...base,
          ctn: 1,
          qty: fallbackQty,
          totalQty: fallbackQty,
          pal: undefined,
        });
      } else {
        errors.push(
          `Line ${i + 1}: ${itemsResult.error} (code: ${itemsResult.code})`
        );
      }
    }
  }

  // If we have some results but also some errors, we can still return success with a warning
  if (result.length > 0) {
    if (errors.length > 0) {
      // Log errors but still return success since we have some valid data
      console.warn('Errors while processing some rows:', errors);
    }

    // Calculate summary
    const totalPcs = result.reduce((sum, item) => sum + item.qty, 0);

    return createSuccess({
      data: result,
      summary: {
        processedRows: result.length,
        totalPcs,
      },
    });
  }

  // If no results and we have errors, return the first error
  if (errors.length > 0) {
    return createError(
      `Failed to process data: ${errors[0]}`,
      'PROCESSING_FAILED'
    );
  }

  // No results and no errors means empty valid input
  return createError(
    'No valid data found in the provided rows',
    'NO_VALID_DATA'
  );
}
