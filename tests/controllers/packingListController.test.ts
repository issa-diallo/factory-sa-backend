/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { PackingListController } from '../../src/controllers/packingListController';
import * as packingListSchema from '../../src/schemas/packingListSchema';
import { PackingListService } from '../../src/services/packingList/packingListService';
import { ProcessingResult } from '../../src/types';

jest.mock('@schemas/packingListSchema');

const mockValidatePackingListData =
  packingListSchema.validatePackingListData as jest.MockedFunction<
    typeof packingListSchema.validatePackingListData
  >;
const mockFormatValidationErrors =
  packingListSchema.formatValidationErrors as jest.MockedFunction<
    typeof packingListSchema.formatValidationErrors
  >;

describe('PackingListController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();

    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn().mockReturnThis();

    mockRequest = {};
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Success Cases', () => {
    it('should return 200 with processed data', async () => {
      const input = [{ LINE: 1 }];
      const processedData: { success: true; data: ProcessingResult } = {
        success: true,
        data: {
          data: [
            {
              description: '128186-1552',
              model: 'Luggage',
              origin: 'Inde',
              ctn: 6,
              qty: 1,
              totalQty: 6,
              pal: 1,
            },
          ],
          summary: {
            processedRows: 1,
            totalPcs: 6,
          },
        },
      };

      mockRequest.body = input;

      mockValidatePackingListData.mockReturnValue({
        success: true,
        data: input as any,
      });

      jest
        .spyOn(PackingListService.prototype, 'processData')
        .mockResolvedValue(processedData);

      await PackingListController.handlePackingList(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: processedData.data.data,
        summary: {
          totalRows: input.length,
          processedRows: 1,
          totalPcs: 6,
        },
      });
    });
    it('should return 200 and correct structure when processing succeeds', async () => {
      const input = [{ LINE: 1 }];
      const mockProcessedResult = {
        success: true as const,
        data: {
          data: [
            {
              description: 'Item 1',
              model: 'Model X',
              origin: 'France',
              ctn: 10,
              qty: 2,
              totalQty: 20,
              pal: 1,
            },
          ],
          summary: {
            processedRows: 1,
            totalPcs: 20,
          },
        },
      };

      mockRequest.body = input;

      mockValidatePackingListData.mockReturnValue({
        success: true,
        data: input as any,
      });

      jest
        .spyOn(PackingListService.prototype, 'processData')
        .mockResolvedValue(mockProcessedResult);

      await PackingListController.handlePackingList(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockProcessedResult.data.data,
        summary: {
          totalRows: 1,
          processedRows: 1,
          totalPcs: 20,
        },
      });
    });
  });

  describe('Processing Errors', () => {
    it('should return 400 for invalid input type error from service', async () => {
      const input = [{ LINE: 1 }];
      mockRequest.body = input;

      mockValidatePackingListData.mockReturnValue({
        success: true,
        data: input as any,
      });

      jest
        .spyOn(PackingListService.prototype, 'processData')
        .mockResolvedValue({
          success: false,
          error: 'Data must be an array of rows',
          code: 'INVALID_INPUT_TYPE',
        });

      await PackingListController.handlePackingList(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Data must be an array of rows',
        code: 'INVALID_INPUT_TYPE',
      });
    });

    it('should return 400 for no valid data error from service', async () => {
      const input = [{ LINE: 1, MODEL: '', ORIGIN: '' }];
      mockRequest.body = input;

      mockValidatePackingListData.mockReturnValue({
        success: true,
        data: input as any,
      });

      jest
        .spyOn(PackingListService.prototype, 'processData')
        .mockResolvedValue({
          success: false,
          error: 'No valid data found in provided rows',
          code: 'NO_VALID_DATA',
        });

      await PackingListController.handlePackingList(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'No valid data found in provided rows',
        code: 'NO_VALID_DATA',
      });
    });
  });

  describe('System Errors', () => {
    it('should return 500 when processing service throws unexpected error', async () => {
      const input = [{ LINE: 1 }];
      mockRequest.body = input;

      mockValidatePackingListData.mockReturnValue({
        success: true,
        data: input as any,
      });

      jest
        .spyOn(PackingListService.prototype, 'processData')
        .mockRejectedValue(new Error('Unexpected processing error'));

      await PackingListController.handlePackingList(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(console.error).toHaveBeenCalledWith(
        'Error processing packing list:',
        expect.any(Error)
      );
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Unexpected processing error',
      });
    });
  });
  describe('Validation Errors', () => {
    it('should return 400 if validation fails', async () => {
      const input = [{ LINE: 'not a number' }];
      mockRequest.body = input;

      const zodError = {
        issues: [
          {
            path: ['LINE'],
            message: 'LINE must be a number',
            code: 'invalid_type',
          },
        ],
      };

      mockValidatePackingListData.mockReturnValue({
        success: false,
        error: zodError as any,
      });

      // mock le formatage d'erreurs
      mockFormatValidationErrors.mockReturnValue([
        {
          field: 'LINE',
          error: 'LINE must be a number',
          line: 1,
          code: 'invalid_type',
        },
      ]);

      await PackingListController.handlePackingList(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Validation error',
        errors: [
          {
            field: 'LINE',
            error: 'LINE must be a number',
            line: 1,
            code: 'invalid_type',
          },
        ],
        summary: {
          errorCount: 1,
          errorLines: [1],
        },
      });
    });
  });
});
