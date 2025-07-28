import { Request, Response } from 'express';
import {
  formatValidationErrors,
  PackingListData,
  validatePackingListData,
} from '../schemas/packingListSchema';
import { inject, injectable } from 'tsyringe';
import { IPackingListService } from '../services/packingList/interfaces';
import { BaseController } from './baseController';

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

      return res.status(200).json({
        success: true,
        data: processResult.data.data,
        summary: {
          totalRows: cleanedData.length,
          processedRows: processResult.data.summary.processedRows,
          totalPcs: processResult.data.summary.totalPcs,
        },
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}
