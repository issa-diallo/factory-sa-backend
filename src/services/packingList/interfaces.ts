import { PackingListData } from '../../schemas/packingListSchema';
import { ProcessingResult, Result } from '../../types';

export interface IPackingListService {
  /**
   * Processes packing list data rows and extracts ProcessedItems.
   *
   * @param rows - Array of row data from the packing list
   * @returns Result object with success/error status and data/error details
   */
  processData(rows: PackingListData): Promise<Result<ProcessingResult>>;
}
