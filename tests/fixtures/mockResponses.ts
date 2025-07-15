/**
 * Mock response fixtures
 * Service responses and expected HTTP responses for tests
 */

import { ProcessedItem } from '../../src/types/index';

// Mock responses from processPackingListData service
export const mockServiceResponses = {
  success: {
    success: true as const,
    data: {
      data: [
        {
          description: '128186-1552, SPINNER 55/20 TSA, 88G*41001',
          model: 'Luggage',
          origin: 'Inde',
          ctn: 6,
          qty: 1,
          totalQty: 6,
          pal: 1,
        },
        {
          description: '128186-1552, SPINNER 55/20 TSA, 88G*41001',
          model: 'Luggage',
          origin: 'Inde',
          ctn: 7,
          qty: 1,
          totalQty: 6,
          pal: 1,
        },
      ] as ProcessedItem[],
      summary: {
        processedRows: 2,
        totalPcs: 2,
      },
    },
  },

  failure: {
    success: false as const,
    error:
      'Failed to process data: Line 1: missing base data (description, model, origin)',
    code: 'PROCESSING_FAILED',
  },

  emptyInput: {
    success: false as const,
    error: 'No data rows provided',
    code: 'EMPTY_INPUT',
  },

  invalidInputType: {
    success: false as const,
    error: 'Data must be an array of rows',
    code: 'INVALID_INPUT_TYPE',
  },

  noValidData: {
    success: false as const,
    error: 'No valid data found in provided rows',
    code: 'NO_VALID_DATA',
  },
};

// Expected HTTP responses from controller
export const expectedHttpResponses = {
  // Success response (200)
  success200: {
    success: true,
    message: 'Packing list data processed successfully',
    data: mockServiceResponses.success.data.data,
    summary: {
      totalRows: 2,
      processedRows: 2,
      totalPcs: 2,
    },
  },

  // Validation error (400)
  validationError400: {
    error: 'Invalid data format',
    message: 'The provided data does not meet the expected format',
    errors: [
      {
        field: 'LINE',
        error: 'The line number (LINE) must be a number',
        line: 4,
        code: 'invalid_type',
      },
      {
        field: 'CTN',
        error: 'The container (CTN) must be a string',
        line: 4,
        code: 'invalid_type',
      },
    ],
    summary: {
      errorCount: 2,
      errorLines: [4],
    },
  },

  // Processing error (400)
  processingError400: {
    error: 'Processing failed',
    message: 'Data processing failed: missing base data',
    code: 'PROCESSING_FAILED',
  },

  // Server error (500)
  serverError500: {
    error: 'Internal server error',
    message: 'An unexpected error occurred during processing',
  },
};

// Formatted validation errors for different cases
export const mockValidationErrors = {
  missingFields: [
    {
      field: 'MAKE',
      error: 'The brand (MAKE) is required',
      line: 4,
      code: 'invalid_type',
    },
    {
      field: 'MODEL',
      error: 'The model (MODEL) is required',
      line: 4,
      code: 'invalid_type',
    },
    {
      field: 'DESCRIPTION MIN',
      error: 'The minimum description (DESCRIPTION MIN) is required',
      line: 4,
      code: 'invalid_type',
    },
  ],

  wrongTypes: [
    {
      field: 'LINE',
      error: 'The line number (LINE) must be a number',
      line: 4,
      code: 'invalid_type',
    },
    {
      field: 'CTN',
      error: 'The container (CTN) must be a string',
      line: 4,
      code: 'invalid_type',
    },
    {
      field: 'QTY',
      error: 'The quantity (QTY) must be a number',
      line: 4,
      code: 'invalid_type',
    },
  ],

  notAnArray: [
    {
      field: 'root',
      error: 'Data must be an array',
      line: 'N/A',
      code: 'invalid_type',
    },
  ],
};

// Request and Response mock objects for Express
export const mockExpressObjects = {
  // Request mock with valid data
  validRequest: {
    body: [
      {
        LINE: 4,
        'SKU MIN': 'hj27',
        MAKE: 'American Tourister',
        MODEL: 'Luggage',
        'DESCRIPTION MIN': '128186-1552, SPINNER 55/20 TSA, 88G*41001',
        'QTY REQ MATCH': 6,
        'QTY ALLOC': 6,
        ORIGIN: 'Inde',
        EAN: 5400520017178,
        PAL: 1,
        CTN: '6 to 11',
        QTY: 1,
      },
      {
        LINE: 4,
        'SKU MIN': 'hj27',
        MAKE: 'American Tourister',
        MODEL: 'Luggage',
        'DESCRIPTION MIN': '128186-1552, SPINNER 55/20 TSA, 88G*41001',
        'QTY REQ MATCH': 6,
        ORIGIN: 'Inde',
        CTN: '11',
        QTY: 1,
      },
    ],
  },

  // Request mock with invalid data
  invalidRequest: {
    body: [
      {
        LINE: '4', // Incorrect type
        'SKU MIN': 'hj27',
        CTN: 123, // Incorrect type
        QTY: 'invalid', // Incorrect type
      },
    ],
  },

  // Request mock with empty data
  emptyRequest: {
    body: [],
  },

  // Request mock with non-array data
  nonArrayRequest: {
    body: {
      LINE: 4,
      'SKU MIN': 'test',
    },
  },

  // Response mock with Jest methods
  createMockResponse: () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  }),
};

// Data for testing system error scenarios
export const systemErrorScenarios = {
  // Error during validation
  validationThrows: new Error('Unexpected validation error'),

  // Error during processing
  processingThrows: new Error('Unexpected processing error'),

  // Generic error
  genericError: new Error('Generic system error'),
};
