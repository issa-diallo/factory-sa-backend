import { injectable } from 'tsyringe';
import { PackingListData } from '../../schemas/packingListSchema';
import {
  createError,
  createSuccess,
  ProcessedItem,
  ProcessingResult,
  Result,
} from '../../types';
import { extractCtnBlocksFromRow } from '../../utils/extractCtnBlocksFromRow';
import { sortPackingListItems } from '../../utils/sortPackingListItems';
import { calculateNumberOfCtns } from '../../utils/calculateNumberOfCtns';

import { IPackingListService } from './interfaces';

@injectable()
export class PackingListService implements IPackingListService {
  /**
   * Processes packing list data rows and extracts ProcessedItems.
   *
   * @param rows - Array of row data from the packing list
   * @returns Result object with success/error status and data/error details
   */
  async processData(rows: PackingListData): Promise<Result<ProcessingResult>> {
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
        category: String(row['MODEL'] || ''),
      };

      if (!base.description.trim() || !base.category.trim()) {
        errors.push(`Line ${i + 1}: missing base data (description, category)`);
        continue;
      }

      const itemsResult = extractCtnBlocksFromRow(row, base);

      if (itemsResult.success) {
        result.push(...itemsResult.data);
      } else {
        const errorMessage = itemsResult.error ?? '';
        const errorCode = itemsResult.code ?? '';
        errors.push(`Line ${i + 1}: ${errorMessage} (code: ${errorCode})`);
      }
    }

    if (result.length > 0) {
      console.warn?.(
        'Errors while processing some rows:',
        errors.length > 0 ? errors : undefined
      );

      const totalPcs = result.reduce((sum, item) => sum + item.qty, 0);

      // Sorting the results using the utility function
      const sortedResult = sortPackingListItems(result);

      // Calculate "Number of Ctns" values
      const resultWithNumberOfCtns = calculateNumberOfCtns(sortedResult);

      return createSuccess({
        data: resultWithNumberOfCtns,
        summary: {
          processedRows: resultWithNumberOfCtns.length,
          totalPcs,
        },
      });
    }

    return createError(
      `Failed to process data: ${errors[0]}`,
      'PROCESSING_FAILED'
    );
  }
}
