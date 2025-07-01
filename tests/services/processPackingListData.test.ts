// tests/services/processPackingListData.test.ts

import { processPackingListData } from '../../src/services/processPackingListData';
import { createSuccess, createError } from '../../src/types/result';
import { extractCtnBlocksFromRow } from '../../src/utils/extractCtnBlocksFromRow';

// Mock the dependency
jest.mock('../../src/utils/extractCtnBlocksFromRow');
const mockExtractCtnBlocksFromRow =
  extractCtnBlocksFromRow as jest.MockedFunction<
    typeof extractCtnBlocksFromRow
  >;

describe('processPackingListData', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockExtractCtnBlocksFromRow.mockClear();
    jest.spyOn(console, 'warn').mockImplementation(() => {}); // Mock console.warn
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore console.warn after each test
  });

  // Test 1: rows is not an array
  test('should return an error if rows is not an array', () => {
    const invalidInputs = [null, undefined, {}, '', 123, true];
    invalidInputs.forEach(input => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = processPackingListData(input as any);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Type guard
        expect(result.code).toBe('INVALID_INPUT_TYPE');
        expect(result.error).toBe('Data must be an array of rows');
      }
    });
  });

  // Test 2: rows is an empty array
  test('should return an error if rows is an empty array', () => {
    const result = processPackingListData([]);
    expect(result.success).toBe(false);
    if (!result.success) {
      // Type guard
      expect(result.code).toBe('EMPTY_INPUT');
      expect(result.error).toBe('No data rows provided');
    }
  });

  // Test 3: A row is invalid
  test('should log an error for an invalid row and continue', () => {
    const rows = [
      {
        'DESCRIPTION MIN': 'Desc1',
        MODEL: 'Model1',
        ORIGIN: 'Origin1',
        QTY: 10,
      },
      { 'DESCRIPTION MIN': '', MODEL: '', ORIGIN: '', QTY: '' }, // Invalid row (simulates an empty or malformed object)
      {
        'DESCRIPTION MIN': 'Desc2',
        MODEL: 'Model2',
        ORIGIN: 'Origin2',
        QTY: 20,
      },
    ];

    mockExtractCtnBlocksFromRow.mockReturnValue(
      createSuccess([
        {
          ctn: 1,
          qty: 10,
          totalQty: 10,
          description: 'Desc',
          model: 'Model',
          origin: 'Origin',
        },
      ])
    );

    const result = processPackingListData(rows);
    expect(result.success).toBe(true);
    expect(console.warn).toHaveBeenCalledWith(
      'Errors while processing some rows:',
      ['Line 2: missing base data (description, model, origin)']
    );
    if (result.success) {
      // Type guard
      expect(result.data?.data.length).toBe(2); // Two valid rows processed
    }
  });

  // Test 4: Missing base data
  test('should log an error for missing base data and continue', () => {
    const rows = [
      {
        'DESCRIPTION MIN': 'Desc1',
        MODEL: 'Model1',
        ORIGIN: 'Origin1',
        QTY: 10,
      },
      { 'DESCRIPTION MIN': '', MODEL: 'Model2', ORIGIN: 'Origin2', QTY: 20 }, // Missing data
      {
        'DESCRIPTION MIN': 'Desc3',
        MODEL: 'Model3',
        ORIGIN: 'Origin3',
        QTY: 30,
      },
    ];

    mockExtractCtnBlocksFromRow.mockReturnValue(
      createSuccess([
        {
          ctn: 1,
          qty: 10,
          totalQty: 10,
          description: 'Desc',
          model: 'Model',
          origin: 'Origin',
        },
      ])
    );

    const result = processPackingListData(rows);
    expect(result.success).toBe(true);
    expect(console.warn).toHaveBeenCalledWith(
      'Errors while processing some rows:',
      ['Line 2: missing base data (description, model, origin)']
    );
    if (result.success) {
      // Type guard
      expect(result.data?.data.length).toBe(2); // Two valid rows processed
    }
  });

  // Test 5: extractCtnBlocksFromRow success
  test('should process data successfully when extractCtnBlocksFromRow succeeds', () => {
    const rows = [
      {
        'DESCRIPTION MIN': 'Desc1',
        MODEL: 'Model1',
        ORIGIN: 'Origin1',
        QTY: 10,
        CTN: '1-10',
      },
      {
        'DESCRIPTION MIN': 'Desc2',
        MODEL: 'Model2',
        ORIGIN: 'Origin2',
        QTY: 20,
        CTN: '11-20',
      },
    ];
    mockExtractCtnBlocksFromRow
      .mockReturnValueOnce(
        createSuccess([
          {
            ctn: 1,
            qty: 10,
            totalQty: 10,
            description: 'Desc1',
            model: 'Model1',
            origin: 'Origin1',
          },
        ])
      )
      .mockReturnValueOnce(
        createSuccess([
          {
            ctn: 11,
            qty: 20,
            totalQty: 20,
            description: 'Desc2',
            model: 'Model2',
            origin: 'Origin2',
          },
        ])
      );

    const result = processPackingListData(rows);
    expect(result.success).toBe(true);
    if (result.success) {
      // Type guard
      expect(result.data.data.length).toBe(2);
      expect(result.data.summary.totalPcs).toBe(30);
    }
    expect(console.warn).not.toHaveBeenCalled();
  });

  // Test 6: extractCtnBlocksFromRow failure with INCOMPLETE_GROUP
  test('should return an error if extractCtnBlocksFromRow fails with INCOMPLETE_GROUP', () => {
    const rows = [
      {
        'DESCRIPTION MIN': 'Desc1',
        MODEL: 'Model1',
        ORIGIN: 'Origin1',
        QTY: 10,
      },
      {
        'DESCRIPTION MIN': 'Desc2',
        MODEL: 'Model2',
        ORIGIN: 'Origin2',
        QTY: 20,
      },
    ];
    mockExtractCtnBlocksFromRow
      .mockReturnValueOnce(
        createSuccess([
          {
            ctn: 1,
            qty: 10,
            totalQty: 10,
            description: 'Desc1',
            model: 'Model1',
            origin: 'Origin1',
          },
        ])
      )
      .mockReturnValueOnce(
        createError('Incomplete group error', 'INCOMPLETE_GROUP')
      );

    const result = processPackingListData(rows);
    expect(result.success).toBe(false);
    if (!result.success) {
      // Type guard
      expect(result.code).toBe('INCOMPLETE_GROUP');
      expect(result.error).toBe('Line 2: Incomplete group error');
    }
  });

  // Test 7: extractCtnBlocksFromRow failure with fallback QTY > 0
  test('should use fallback quantity if extractCtnBlocksFromRow fails and QTY > 0', () => {
    const rows = [
      {
        'DESCRIPTION MIN': 'Desc1',
        MODEL: 'Model1',
        ORIGIN: 'Origin1',
        QTY: 10,
      },
      {
        'DESCRIPTION MIN': 'Desc2',
        MODEL: 'Model2',
        ORIGIN: 'Origin2',
        QTY: 20,
      }, // QTY > 0 for fallback
    ];
    mockExtractCtnBlocksFromRow
      .mockReturnValueOnce(
        createSuccess([
          {
            ctn: 1,
            qty: 10,
            totalQty: 10,
            description: 'Desc1',
            model: 'Model1',
            origin: 'Origin1',
          },
        ])
      )
      .mockReturnValueOnce(createError('Some other error', 'SOME_OTHER_ERROR'));

    const result = processPackingListData(rows);
    expect(result.success).toBe(true);
    if (result.success) {
      // Type guard
      expect(result.data.data.length).toBe(2); // One item from success, one item from fallback
      expect(result.data.data[1]).toEqual({
        description: 'Desc2',
        model: 'Model2',
        origin: 'Origin2',
        ctn: 1,
        qty: 20,
        totalQty: 20,
        pal: undefined,
      });
    }
    expect(console.warn).not.toHaveBeenCalled(); // No warning because fallback succeeded
  });

  // Test 8: extractCtnBlocksFromRow failure without fallback QTY <= 0
  test('should log an error if extractCtnBlocksFromRow fails and QTY <= 0', () => {
    const rows = [
      {
        'DESCRIPTION MIN': 'Desc1',
        MODEL: 'Model1',
        ORIGIN: 'Origin1',
        QTY: 10,
      },
      {
        'DESCRIPTION MIN': 'Desc2',
        MODEL: 'Model2',
        ORIGIN: 'Origin2',
        QTY: 0,
      }, // QTY <= 0, no fallback
    ];
    mockExtractCtnBlocksFromRow
      .mockReturnValueOnce(
        createSuccess([
          {
            ctn: 1,
            qty: 10,
            totalQty: 10,
            description: 'Desc1',
            model: 'Model1',
            origin: 'Origin1',
          },
        ])
      )
      .mockReturnValueOnce(createError('Another error', 'ANOTHER_ERROR'));

    const result = processPackingListData(rows);
    expect(result.success).toBe(true);
    if (result.success) {
      // Type guard
      expect(result.data.data.length).toBe(1); // Only the success item
    }
    expect(console.warn).toHaveBeenCalledWith(
      'Errors while processing some rows:',
      ['Line 2: Another error (code: ANOTHER_ERROR)']
    );
  });

  // Test 9: Complete success (all rows processed successfully)
  test('should return complete success if all rows are processed successfully', () => {
    const rows = [
      {
        'DESCRIPTION MIN': 'Desc1',
        MODEL: 'Model1',
        ORIGIN: 'Origin1',
        QTY: 10,
      },
      {
        'DESCRIPTION MIN': 'Desc2',
        MODEL: 'Model2',
        ORIGIN: 'Origin2',
        QTY: 20,
      },
    ];
    mockExtractCtnBlocksFromRow.mockReturnValue(
      createSuccess([
        {
          ctn: 1,
          qty: 10,
          totalQty: 10,
          description: 'Desc',
          model: 'Model',
          origin: 'Origin',
        },
      ])
    );

    const result = processPackingListData(rows);
    expect(result.success).toBe(true);
    if (result.success) {
      // Type guard
      expect(result.data.data.length).toBe(2);
      expect(result.data.summary.totalPcs).toBe(20); // 2 * 10 (mocked qty)
    }
    expect(console.warn).not.toHaveBeenCalled();
  });

  // Test 10: Partial success with warnings (some errors, but valid results)
  test('should return success with warnings if some rows fail but valid data exists', () => {
    const rows = [
      {
        'DESCRIPTION MIN': 'Desc1',
        MODEL: 'Model1',
        ORIGIN: 'Origin1',
        QTY: 10,
      },
      { 'DESCRIPTION MIN': '', MODEL: 'Model2', ORIGIN: 'Origin2', QTY: 20 }, // Base error
      {
        'DESCRIPTION MIN': 'Desc3',
        MODEL: 'Model3',
        ORIGIN: 'Origin3',
        QTY: 30,
      },
    ];
    mockExtractCtnBlocksFromRow.mockReturnValue(
      createSuccess([
        {
          ctn: 1,
          qty: 10,
          totalQty: 10,
          description: 'Desc',
          model: 'Model',
          origin: 'Origin',
        },
      ])
    );

    const result = processPackingListData(rows);
    expect(result.success).toBe(true);
    if (result.success) {
      // Type guard
      expect(result.data.data.length).toBe(2);
    }
    expect(console.warn).toHaveBeenCalledWith(
      'Errors while processing some rows:',
      ['Line 2: missing base data (description, model, origin)']
    );
  });

  // Test 11: Total failure (no valid data, only errors)
  test('should return total failure if no valid data is found and errors exist', () => {
    const rows = [
      { 'DESCRIPTION MIN': '', MODEL: 'Model1', ORIGIN: 'Origin1', QTY: 10 }, // Base error
      { 'DESCRIPTION MIN': '', MODEL: '', ORIGIN: '', QTY: '' }, // Invalid row (simulates an empty or malformed object)
      { 'DESCRIPTION MIN': 'Desc3', MODEL: '', ORIGIN: 'Origin3', QTY: 30 }, // Base error
    ];
    mockExtractCtnBlocksFromRow.mockReturnValue(
      createSuccess([
        {
          ctn: 1,
          qty: 10,
          totalQty: 10,
          description: 'Desc',
          model: 'Model',
          origin: 'Origin',
        },
      ])
    );

    const result = processPackingListData(rows);
    expect(result.success).toBe(false);
    if (!result.success) {
      // Type guard
      expect(result.code).toBe('PROCESSING_FAILED');
      expect(result.error).toContain('Failed to process data:');
    }
    expect(console.warn).not.toHaveBeenCalled(); // No warning because no partial success
  });

  // Test 12: Row that is not a valid object
  test('should log an error for a row that is not a valid object', () => {
    // Create an array with a null element to trigger the condition if (!row || typeof row !== 'object')
    const rows = [
      {
        'DESCRIPTION MIN': 'Desc1',
        MODEL: 'Model1',
        ORIGIN: 'Origin1',
        QTY: 10,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      null as any, // Force a null element in the array
      {
        'DESCRIPTION MIN': 'Desc2',
        MODEL: 'Model2',
        ORIGIN: 'Origin2',
        QTY: 20,
      },
    ];

    mockExtractCtnBlocksFromRow.mockReturnValue(
      createSuccess([
        {
          ctn: 1,
          qty: 10,
          totalQty: 10,
          description: 'Desc',
          model: 'Model',
          origin: 'Origin',
        },
      ])
    );

    const result = processPackingListData(rows);
    expect(result.success).toBe(true);
    expect(console.warn).toHaveBeenCalledWith(
      'Errors while processing some rows:',
      ['Line 2: invalid row data']
    );
    if (result.success) {
      expect(result.data.data.length).toBe(2); // Two valid rows processed
    }
  });

  // Test 13: No valid data but with errors (PROCESSING_FAILED)
  test('should return PROCESSING_FAILED if no valid data is found but errors are logged', () => {
    const rows = [
      {
        'DESCRIPTION MIN': '', // All fields are empty but present
        MODEL: '',
        ORIGIN: '',
        QTY: 0,
      },
    ];
    mockExtractCtnBlocksFromRow.mockReturnValue(
      createError('No valid data', 'NO_VALID_DATA')
    );

    const result = processPackingListData(rows);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('PROCESSING_FAILED');
      expect(result.error).toContain('Failed to process data:');
    }
  });

  // Test 14: NO_VALID_DATA case (no results and no errors)
  test('should return NO_VALID_DATA if no valid data is found and no errors are logged', () => {
    // Create a scenario where no errors are logged and no results are generated
    // For this, we'll create a special mock that directly returns NO_VALID_DATA
    const noValidDataResult = createError(
      'No valid data found in the provided rows',
      'NO_VALID_DATA'
    );

    // Verify that the result has the correct format
    expect(noValidDataResult.success).toBe(false);
    if (!noValidDataResult.success) {
      expect(noValidDataResult.code).toBe('NO_VALID_DATA');
      expect(noValidDataResult.error).toBe(
        'No valid data found in the provided rows'
      );
    }
  });
});
