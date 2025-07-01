/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tests for packingListController
 * Complete tests with dependency mocking
 */

import { Request, Response } from 'express';
import { handlePackingList } from '../../src/controllers/packingListController';
import * as packingListSchema from '../../src/schemas/packingListSchema';
import * as processPackingListService from '../../src/services/processPackingListData';

// Fixtures
import {
  validPackingListData,
  invalidPackingListData,
  edgeCaseData,
  serviceTestData,
} from '../fixtures/packingListData';
import {
  mockServiceResponses,
  mockValidationErrors,
  systemErrorScenarios,
} from '../fixtures/mockResponses';

// Mock des dépendances
jest.mock('../../src/schemas/packingListSchema');
jest.mock('../../src/services/processPackingListData');

const mockValidatePackingListData =
  packingListSchema.validatePackingListData as jest.MockedFunction<
    typeof packingListSchema.validatePackingListData
  >;
const mockFormatValidationErrors =
  packingListSchema.formatValidationErrors as jest.MockedFunction<
    typeof packingListSchema.formatValidationErrors
  >;
const mockProcessPackingListData =
  processPackingListService.processPackingListData as jest.MockedFunction<
    typeof processPackingListService.processPackingListData
  >;

describe('PackingListController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Configure Express mocks
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn().mockReturnThis();

    mockRequest = {};
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    // Mock console.error to avoid logs during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console after each test
    jest.restoreAllMocks();
  });

  describe('handlePackingList - Success Cases', () => {
    it('should process valid data successfully and return 200', () => {
      // Arrange
      mockRequest.body = validPackingListData;

      mockValidatePackingListData.mockReturnValue({
        success: true,
        data: validPackingListData as any,
      });

      mockProcessPackingListData.mockReturnValue(mockServiceResponses.success);

      // Act
      handlePackingList(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockValidatePackingListData).toHaveBeenCalledWith(
        validPackingListData
      );
      expect(mockProcessPackingListData).toHaveBeenCalledWith(
        validPackingListData
      );
      expect(mockStatus).toHaveBeenCalledWith(200);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockServiceResponses.success.data.data,
        summary: {
          totalRows: validPackingListData.length,
          processedRows:
            mockServiceResponses.success.data.summary.processedRows,
          totalPcs: mockServiceResponses.success.data.summary.totalPcs,
        },
      });
    });

    it('should handle data with optional fields successfully', () => {
      // Arrange
      mockRequest.body = edgeCaseData.withOptionalFields;

      mockValidatePackingListData.mockReturnValue({
        success: true,
        data: edgeCaseData.withOptionalFields as any,
      });

      mockProcessPackingListData.mockReturnValue(mockServiceResponses.success);

      // Act
      handlePackingList(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });

    it('should handle large datasets successfully', () => {
      // Arrange
      mockRequest.body = edgeCaseData.largeDataset;

      mockValidatePackingListData.mockReturnValue({
        success: true,
        data: edgeCaseData.largeDataset as any,
      });

      mockProcessPackingListData.mockReturnValue({
        success: true,
        data: {
          data: Array.from({ length: 500 }, (_, i) => ({
            description: `Description ${i}`,
            model: `Model ${i}`,
            origin: 'Test',
            ctn: i + 1,
            qty: 1,
            totalQty: 1,
            pal: 1,
          })),
          summary: {
            processedRows: 500,
            totalPcs: 500,
          },
        },
      });

      // Act
      handlePackingList(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          summary: {
            totalRows: edgeCaseData.largeDataset.length,
            processedRows: 500,
            totalPcs: 500,
          },
        })
      );
    });
  });

  describe('handlePackingList - Validation Errors', () => {
    it('should return 400 for validation errors with formatted error messages', () => {
      // Arrange
      mockRequest.body = invalidPackingListData.wrongTypes;

      const mockValidationError = {
        success: false as const,
        error: {
          issues: [
            { path: [0, 'LINE'], code: 'invalid_type' },
            { path: [0, 'CTN'], code: 'invalid_type' },
          ],
        } as any,
      };

      mockValidatePackingListData.mockReturnValue(mockValidationError);
      mockFormatValidationErrors.mockReturnValue(
        mockValidationErrors.wrongTypes
      );

      // Act
      handlePackingList(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockValidatePackingListData).toHaveBeenCalledWith(
        invalidPackingListData.wrongTypes
      );
      expect(mockFormatValidationErrors).toHaveBeenCalledWith(
        mockValidationError.error,
        invalidPackingListData.wrongTypes
      );
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Validation error',
        errors: mockValidationErrors.wrongTypes,
        summary: {
          errorCount: mockValidationErrors.wrongTypes.length,
          errorLines: [4],
        },
      });
    });

    it('should return 400 for missing required fields', () => {
      // Arrange
      mockRequest.body = invalidPackingListData.missingFields;

      const mockValidationError = {
        success: false as const,
        error: {
          issues: [
            { path: [0, 'MAKE'], code: 'invalid_type' },
            { path: [0, 'MODEL'], code: 'invalid_type' },
          ],
        } as any,
      };

      mockValidatePackingListData.mockReturnValue(mockValidationError);
      mockFormatValidationErrors.mockReturnValue(
        mockValidationErrors.missingFields
      );

      // Act
      handlePackingList(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation error',
          errors: mockValidationErrors.missingFields,
        })
      );
    });

    it('should return 400 for non-array data', () => {
      // Arrange
      mockRequest.body = invalidPackingListData.notAnArray;

      const mockValidationError = {
        success: false as const,
        error: {
          issues: [{ path: [], code: 'invalid_type' }],
        } as any,
      };

      mockValidatePackingListData.mockReturnValue(mockValidationError);
      mockFormatValidationErrors.mockReturnValue(
        mockValidationErrors.notAnArray
      );

      // Act
      handlePackingList(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation error',
          errors: mockValidationErrors.notAnArray,
        })
      );
    });

    it('should handle empty array validation', () => {
      // Arrange
      mockRequest.body = invalidPackingListData.emptyArray;

      const mockValidationError = {
        success: false as const,
        error: {
          issues: [{ path: [], code: 'too_small' }],
        } as any,
      };

      mockValidatePackingListData.mockReturnValue(mockValidationError);
      mockFormatValidationErrors.mockReturnValue([
        {
          field: 'root',
          error: 'Array cannot be empty',
          line: 'N/A',
          code: 'too_small',
        },
      ]);

      // Act
      handlePackingList(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation error',
        })
      );
    });
  });

  describe('handlePackingList - Processing Errors', () => {
    it('should return 400 when service processing fails', () => {
      // Arrange
      mockRequest.body = serviceTestData.invalidForService;

      mockValidatePackingListData.mockReturnValue({
        success: true,
        data: serviceTestData.invalidForService as any,
      });

      mockProcessPackingListData.mockReturnValue(mockServiceResponses.failure);

      // Act
      handlePackingList(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockValidatePackingListData).toHaveBeenCalledWith(
        serviceTestData.invalidForService
      );
      expect(mockProcessPackingListData).toHaveBeenCalledWith(
        serviceTestData.invalidForService
      );
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: mockServiceResponses.failure.error,
        code: mockServiceResponses.failure.code,
      });
    });

    it('should return 400 for empty input error from service', () => {
      // Arrange
      mockRequest.body = [];

      mockValidatePackingListData.mockReturnValue({
        success: true,
        data: [] as any,
      });

      mockProcessPackingListData.mockReturnValue(
        mockServiceResponses.emptyInput
      );

      // Act
      handlePackingList(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: mockServiceResponses.emptyInput.error,
        code: mockServiceResponses.emptyInput.code,
      });
    });

    it('should return 400 for invalid input type error from service', () => {
      // Arrange
      mockRequest.body = validPackingListData;

      mockValidatePackingListData.mockReturnValue({
        success: true,
        data: validPackingListData as any,
      });

      mockProcessPackingListData.mockReturnValue(
        mockServiceResponses.invalidInputType
      );

      // Act
      handlePackingList(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: mockServiceResponses.invalidInputType.error,
        code: mockServiceResponses.invalidInputType.code,
      });
    });

    it('should return 400 for no valid data error from service', () => {
      // Arrange
      mockRequest.body = serviceTestData.validSchemaInvalidService;

      mockValidatePackingListData.mockReturnValue({
        success: true,
        data: serviceTestData.validSchemaInvalidService as any,
      });

      mockProcessPackingListData.mockReturnValue(
        mockServiceResponses.noValidData
      );

      // Act
      handlePackingList(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: mockServiceResponses.noValidData.error,
        code: mockServiceResponses.noValidData.code,
      });
    });
  });

  describe('handlePackingList - System Errors', () => {
    it('should return 500 when validation throws unexpected error', () => {
      // Arrange
      mockRequest.body = validPackingListData;
      mockValidatePackingListData.mockImplementation(() => {
        throw systemErrorScenarios.validationThrows;
      });

      // Act
      handlePackingList(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        'Error processing packing list:',
        systemErrorScenarios.validationThrows
      );
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: expect.any(String),
      });
    });

    it('should return 500 when processing service throws unexpected error', () => {
      // Arrange
      mockRequest.body = validPackingListData;

      mockValidatePackingListData.mockReturnValue({
        success: true,
        data: validPackingListData as any,
      });

      mockProcessPackingListData.mockImplementation(() => {
        throw systemErrorScenarios.processingThrows;
      });

      // Act
      handlePackingList(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        'Error processing packing list:',
        systemErrorScenarios.processingThrows
      );
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: expect.any(String),
      });
    });

    it('should return 500 for any other unexpected error', () => {
      // Arrange
      mockRequest.body = validPackingListData;

      // Simulate an error in controller logic
      mockValidatePackingListData.mockImplementation(() => {
        throw systemErrorScenarios.genericError;
      });

      // Act
      handlePackingList(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: expect.any(String),
      });
    });
  });

  describe('handlePackingList - Edge Cases', () => {
    it('should handle data with special characters', () => {
      // Arrange
      mockRequest.body = edgeCaseData.withSpecialCharacters;

      mockValidatePackingListData.mockReturnValue({
        success: true,
        data: edgeCaseData.withSpecialCharacters as any,
      });

      mockProcessPackingListData.mockReturnValue(mockServiceResponses.success);

      // Act
      handlePackingList(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });

    it('should handle data with dynamic fields', () => {
      // Arrange
      mockRequest.body = edgeCaseData.withDynamicFields;

      mockValidatePackingListData.mockReturnValue({
        success: true,
        data: edgeCaseData.withDynamicFields as any,
      });

      mockProcessPackingListData.mockReturnValue(mockServiceResponses.success);

      // Act
      handlePackingList(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockValidatePackingListData).toHaveBeenCalledWith(
        edgeCaseData.withDynamicFields
      );
      expect(mockProcessPackingListData).toHaveBeenCalledWith(
        edgeCaseData.withDynamicFields
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should not call processPackingListData when validation fails', () => {
      // Arrange
      mockRequest.body = invalidPackingListData.wrongTypes;

      mockValidatePackingListData.mockReturnValue({
        success: false,
        error: { issues: [] } as any,
      });

      mockFormatValidationErrors.mockReturnValue([]);

      // Act
      handlePackingList(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockValidatePackingListData).toHaveBeenCalled();
      expect(mockProcessPackingListData).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(400);
    });

    it('should handle validation errors with multiple lines', () => {
      // Arrange
      const multiLineErrors = [
        {
          field: 'LINE',
          error: 'The line number (LINE) must be a number',
          line: 4,
          code: 'invalid_type',
        },
        {
          field: 'CTN',
          error: 'The container (CTN) must be a string',
          line: 5,
          code: 'invalid_type',
        },
      ];

      mockRequest.body = invalidPackingListData.wrongTypes;

      mockValidatePackingListData.mockReturnValue({
        success: false,
        error: { issues: [] } as any,
      });

      mockFormatValidationErrors.mockReturnValue(multiLineErrors);

      // Act
      handlePackingList(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: {
            errorCount: 2,
            errorLines: [4, 5],
          },
        })
      );
    });
  });
});
