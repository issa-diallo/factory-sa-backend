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
        model: String(row['MODEL'] || ''),
      };

      if (!base.description.trim() || !base.model.trim()) {
        errors.push(`Line ${i + 1}: missing base data (description, model)`);
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

      return createSuccess({
        data: result,
        summary: {
          processedRows: result.length,
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
