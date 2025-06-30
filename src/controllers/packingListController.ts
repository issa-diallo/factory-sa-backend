import { Request, Response } from 'express';
import {
  validatePackingListData,
  PackingListData,
  formatValidationErrors,
} from '@schemas/packingListSchema';
import { processPackingListData } from '@services/processPackingListData';

/**
 * Controller for handling packing list data.
 *
 * Responsibilities (SRP - Single Responsibility Principle):
 * - Receive and validate the HTTP request
 * - Call the appropriate business services
 * - Format and return the HTTP response
 */

/**
 * Handles the upload and processing of packing list data.
 *
 * @param req - Express request containing the data in req.body
 * @param res - Express response to return the result
 */
export const handlePackingList = (req: Request, res: Response): void => {
  try {
    // Step 1: Validate data with Zod
    const validationResult = validatePackingListData(req.body);

    if (!validationResult.success) {
      // Format errors with line numbers
      const formattedErrors = formatValidationErrors(
        validationResult.error,
        req.body
      );

      res.status(400).json({
        error: 'Validation error',
        errors: formattedErrors,
        summary: {
          errorCount: formattedErrors.length,
          errorLines: [...new Set(formattedErrors.map(e => e.line))],
        },
      });
      return;
    }

    // Step 2: Data is now validated and typed
    const cleanedData: PackingListData = validationResult.data;

    // Step 3: Process data with the new Result pattern
    const processResult = processPackingListData(cleanedData);

    if (!processResult.success) {
      // If processing fails, return an error with details
      res.status(400).json({
        error: processResult.error,
        code: processResult.code,
      });
      return;
    }

    // Step 4: Return the response with the processed data
    res.status(200).json({
      success: true,
      data: processResult.data.data,
      summary: {
        totalRows: cleanedData.length,
        processedRows: processResult.data.summary.processedRows,
        totalPcs: processResult.data.summary.totalPcs,
      },
    });
  } catch (error) {
    // Handle unexpected errors
    console.error('Error processing packing list:', error);

    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
