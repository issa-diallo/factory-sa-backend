import { ProcessedItem, Result, createSuccess, createError } from '../types';
import { expandCtnRange } from './expandCtnRange';
import {
  BaseItemSchema,
  ProcessedItemArraySchema,
} from '../schemas/utilsSchemas';
import { getCountryAcronym } from './getCountryAcronym';

type BaseItem = Pick<ProcessedItem, 'description' | 'category'>;

/**
 * Extracts CTN blocks from a row of data and creates ProcessedItem array.
 *
 * @param row - The row data containing CTN, QTY, and PAL information
 * @param base - Base item information (description, category, origin)
 * @returns Result object with success/error status and data/error details
 */
export function extractCtnBlocksFromRow(
  row: Record<string, string | number>,
  base: BaseItem
): Result<ProcessedItem[]> {
  // Basic validation for row (already validated by controller, but handle edge cases)
  if (!row || typeof row !== 'object') {
    return createError('Invalid row data', 'INVALID_ROW_DATA');
  }

  // Validate base object with Zod
  const baseValidation = BaseItemSchema.safeParse(base);
  if (!baseValidation.success) {
    return createError(
      'Invalid base object: ' + baseValidation.error.issues[0]?.message,
      'INVALID_BASE_ITEM'
    );
  }

  const validatedRow = row;
  const validatedBase = baseValidation.data;
  const result: ProcessedItem[] = [];

  // Calculate COO from ORIGIN if available
  let coo: string | undefined;
  if (validatedRow.ORIGIN && String(validatedRow.ORIGIN).trim()) {
    const acronym = getCountryAcronym(String(validatedRow.ORIGIN));
    coo = acronym || 'N/A';
  }

  const keys = Object.keys(validatedRow);

  // Check for any CTN data first
  const hasAnyCtn = keys.some(k => k.startsWith('CTN'));
  if (!hasAnyCtn) {
    return createError('No CTN data found in the row', 'NO_CTN_DATA');
  }

  const suffixes = new Set(
    keys
      .filter(k => /^(PAL|CTN|QTY)(_\d+)?$/.test(k))
      .map(k => (k.includes('_') ? (k.split('_').pop() ?? '') : ''))
  );

  for (const suffix of suffixes) {
    const suffixStr = suffix ? `_${suffix}` : '';
    const ctnKey = `CTN${suffixStr}`;
    const qtyKey = `QTY${suffixStr}`;
    const palKey = `PAL${suffixStr}`;

    // A block is valid only if both CTN and QTY are present. PAL is optional.
    if (ctnKey in validatedRow && qtyKey in validatedRow) {
      const ctnRaw = validatedRow[ctnKey];
      const qtyRaw = validatedRow[qtyKey];
      const palRaw = validatedRow[palKey];

      // Validate and parse quantity
      const qty = parseInt(String(qtyRaw), 10);
      if (isNaN(qty) || qty <= 0) {
        return createError(
          `Invalid quantity for ${qtyKey}: must be a positive integer`,
          'INVALID_QUANTITY'
        );
      }

      // Validate and parse pallet (optional)
      let pal: number | undefined;
      if (
        palRaw !== undefined &&
        palRaw !== null &&
        String(palRaw).trim() !== ''
      ) {
        pal = parseInt(String(palRaw), 10);
        if (isNaN(pal) || pal <= 0) {
          return createError(
            `Invalid pallet number for ${palKey}: must be a positive integer`,
            'INVALID_PALLET'
          );
        }
      }

      // Expand CTN range
      const ctnResult = expandCtnRange(String(ctnRaw));
      if (!ctnResult.success) {
        return createError(
          `Error expanding CTN ${ctnKey}: ${ctnResult.error}`,
          'CTN_EXPANSION_ERROR'
        );
      }

      // Create ProcessedItem for each CTN
      for (const ctn of ctnResult.data) {
        result.push({
          ...validatedBase,
          coo,
          ctns: ctn,
          qty,
          totalQty: qty,
          pal,
        } as ProcessedItem);
      }
    } else if (
      (ctnKey in validatedRow || qtyKey in validatedRow) &&
      !(ctnKey in validatedRow && qtyKey in validatedRow)
    ) {
      // This is an incomplete group, we just skip it as per test requirements
      continue;
    }
  }

  if (result.length === 0) {
    // This can happen if all blocks are incomplete or the row is invalid
    return createError(
      'No processed items generated from the data',
      'NO_PROCESSED_ITEMS'
    );
  }

  // Validate output
  const outputValidation = ProcessedItemArraySchema.safeParse(result);
  if (!outputValidation.success) {
    return createError(
      'Error validating processed items: ' +
        outputValidation.error.issues[0]?.message,
      'OUTPUT_VALIDATION_ERROR'
    );
  }

  return createSuccess(outputValidation.data);
}
