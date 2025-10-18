import { Request, Response } from 'express';
import {
  formatValidationErrors,
  PackingListData,
  validatePackingListData,
} from '../schemas/packingListSchema';
import { inject, injectable } from 'tsyringe';
import { IPackingListService } from '../services/packingList/interfaces';
import { BaseController } from './baseController';
import { ProcessedItem, ProcessedItemResponse } from '../types';

function transformProcessedItemForAPI(
  item: ProcessedItem
): ProcessedItemResponse {
  const response: ProcessedItemResponse = {
    Ctns: item.ctns,
    Category: item.category,
    Description: item.description,
    'Qty Per Box': item.qty,
    'Number of Ctns': item.numberOfCtns || '1',
    'Total Qty': item.totalQty,
    COO: item.coo,
  };

  // Add Pal as the first property if it exists
  if (item.pal !== undefined) {
    return {
      Pal: item.pal,
      ...response,
    };
  }

  return response;
}

@injectable()
export class PackingListController extends BaseController {
  constructor(
    @inject('PackingListService')
    private packingListService: IPackingListService
  ) {
    super();
  }
  /**
   * Handles the upload and processing of packing list data.
   *
   * @param req - Express request containing the data in req.body
   * @param res - Express response to return the result
   */
  handlePackingList = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      // Step 1: Validate data with Zod
      const validationResult = validatePackingListData(req.body);

      if (!validationResult.success) {
        // Format errors with line numbers
        const formattedErrors = formatValidationErrors(
          validationResult.error,
          req.body
        );

        return res.status(400).json({
          error: 'Validation error',
          errors: formattedErrors,
          summary: {
            errorCount: formattedErrors.length,
            errorLines: [...new Set(formattedErrors.map(e => e.line))],
          },
        });
      }

      // Step 2: Data is now validated and typed
      const cleanedData: PackingListData = validationResult.data;

      // Step 3: Process data with the service
      const processResult =
        await this.packingListService.processData(cleanedData);

      if (!processResult.success) {
        return res.status(400).json({
          error: processResult.error,
          code: processResult.code,
        });
      }

      // Calculate boxes statistics (unique cartons and highest carton number)
      const uniqueCtns = new Set(
        processResult.data.data.map(item => item.ctns)
      );
      const highestCtn = Math.max(...uniqueCtns);

      // Calculate pallets statistics (unique pallets and highest pallet number, if any)
      const palletsWithValue = processResult.data.data
        .map(item => item.pal)
        .filter((pal): pal is number => pal !== undefined);
      const uniquePals = new Set(palletsWithValue);
      const totalPals = uniquePals.size;
      const highestPal = totalPals > 0 ? Math.max(...uniquePals) : null;

      return res.status(200).json({
        success: true,
        data: processResult.data.data.map(transformProcessedItemForAPI),
        summary: {
          boxes: {
            total: uniqueCtns.size,
            highest: highestCtn,
          },
          pallets: {
            total: totalPals,
            highest: highestPal,
          },
          totalPcs: processResult.data.summary.totalPcs,
        },
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}
