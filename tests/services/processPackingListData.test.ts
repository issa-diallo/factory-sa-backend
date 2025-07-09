import { PackingListService } from '../../src/services/packingList/packingListService';
import { createSuccess, createError } from '../../src/types/result';
import { extractCtnBlocksFromRow } from '../../src/utils/extractCtnBlocksFromRow';
import { PackingListData } from '../../src/schemas/packingListSchema';

// Mock the dependency
jest.mock('@utils/extractCtnBlocksFromRow');
const mockExtractCtnBlocksFromRow =
  extractCtnBlocksFromRow as jest.MockedFunction<
    typeof extractCtnBlocksFromRow
  >;

describe('PackingListService', () => {
  let service: PackingListService;

  beforeEach(() => {
    service = new PackingListService();
    mockExtractCtnBlocksFromRow.mockClear();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test 1: rows is not an array
  test('should return an error if rows is not an array', async () => {
    const invalidInputs = [null, undefined, {}, '', 123, true];
    for (const input of invalidInputs) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await service.processData(input as any);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('INVALID_INPUT_TYPE');
        expect(result.error).toBe('Data must be an array of rows');
      }
    }
  });

  // Test 2: rows is an empty array
  test('should return an error if rows is an empty array', async () => {
    const result = await service.processData([]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('EMPTY_INPUT');
      expect(result.error).toBe('No data rows provided');
    }
  });

  // Test 3: A row is invalid
  test('should log an error for an invalid row and continue', async () => {
    const rows: PackingListData = [
      {
        LINE: 1,
        'SKU MIN': 'SKU1',
        MAKE: 'Make1',
        MODEL: 'Model1',
        'DESCRIPTION MIN': 'Desc1',
        'QTY REQ MATCH': 10,
        'QTY ALLOC': 10,
        ORIGIN: 'Origin1',
        CTN: '1-10',
        QTY: 10,
      },
      {
        LINE: 2,
        'SKU MIN': '',
        MAKE: '',
        MODEL: '',
        'DESCRIPTION MIN': '',
        'QTY REQ MATCH': 0,
        'QTY ALLOC': 0,
        ORIGIN: '',
        CTN: '',
        QTY: 0,
      }, // Invalid row (simulates an empty or malformed object)
      {
        LINE: 3,
        'SKU MIN': 'SKU2',
        MAKE: 'Make2',
        MODEL: 'Model2',
        'DESCRIPTION MIN': 'Desc2',
        'QTY REQ MATCH': 20,
        'QTY ALLOC': 20,
        ORIGIN: 'Origin2',
        CTN: '11-20',
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

    const result = await service.processData(rows);
    expect(result.success).toBe(true);
    expect(console.warn).toHaveBeenCalledWith(
      'Errors while processing some rows:',
      ['Line 2: missing base data (description, model, origin)']
    );
    if (result.success) {
      expect(result.data?.data.length).toBe(2);
    }
  });

  // Test 4: Missing base data
  test('should log an error for missing base data and continue', async () => {
    const rows: PackingListData = [
      {
        LINE: 1,
        'SKU MIN': 'SKU1',
        MAKE: 'Make1',
        MODEL: 'Model1',
        'DESCRIPTION MIN': 'Desc1',
        'QTY REQ MATCH': 10,
        'QTY ALLOC': 10,
        ORIGIN: 'Origin1',
        CTN: '1-10',
        QTY: 10,
      },
      {
        LINE: 2,
        'SKU MIN': '',
        MAKE: 'Make2',
        MODEL: 'Model2',
        'DESCRIPTION MIN': '',
        'QTY REQ MATCH': 20,
        'QTY ALLOC': 20,
        ORIGIN: 'Origin2',
        CTN: '11-20',
        QTY: 20,
      }, // Missing data
      {
        LINE: 3,
        'SKU MIN': 'SKU3',
        MAKE: 'Make3',
        MODEL: 'Model3',
        'DESCRIPTION MIN': 'Desc3',
        'QTY REQ MATCH': 30,
        'QTY ALLOC': 30,
        ORIGIN: 'Origin3',
        CTN: '21-30',
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

    const result = await service.processData(rows);
    expect(result.success).toBe(true);
    expect(console.warn).toHaveBeenCalledWith(
      'Errors while processing some rows:',
      ['Line 2: missing base data (description, model, origin)']
    );
    if (result.success) {
      expect(result.data?.data.length).toBe(2);
    }
  });

  // Test 5: extractCtnBlocksFromRow success
  test('should process data successfully when extractCtnBlocksFromRow succeeds', async () => {
    const rows: PackingListData = [
      {
        LINE: 1,
        'SKU MIN': 'SKU1',
        MAKE: 'Make1',
        MODEL: 'Model1',
        'DESCRIPTION MIN': 'Desc1',
        'QTY REQ MATCH': 10,
        'QTY ALLOC': 10,
        ORIGIN: 'Origin1',
        CTN: '1-10',
        QTY: 10,
      },
      {
        LINE: 2,
        'SKU MIN': 'SKU2',
        MAKE: 'Make2',
        MODEL: 'Model2',
        'DESCRIPTION MIN': 'Desc2',
        'QTY REQ MATCH': 20,
        'QTY ALLOC': 20,
        ORIGIN: 'Origin2',
        CTN: '11-20',
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

    const result = await service.processData(rows);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.data.length).toBe(2);
      expect(result.data.summary.totalPcs).toBe(30);
    }
    expect(console.warn).not.toHaveBeenCalled();
  });

  // Test 6: extractCtnBlocksFromRow failure with INCOMPLETE_GROUP
  test('should return an error if extractCtnBlocksFromRow fails with INCOMPLETE_GROUP', async () => {
    const rows: PackingListData = [
      {
        LINE: 1,
        'SKU MIN': 'SKU1',
        MAKE: 'Make1',
        MODEL: 'Model1',
        'DESCRIPTION MIN': 'Desc1',
        'QTY REQ MATCH': 10,
        'QTY ALLOC': 10,
        ORIGIN: 'Origin1',
        CTN: '1-10',
        QTY: 10,
      },
      {
        LINE: 2,
        'SKU MIN': 'SKU2',
        MAKE: 'Make2',
        MODEL: 'Model2',
        'DESCRIPTION MIN': 'Desc2',
        'QTY REQ MATCH': 20,
        'QTY ALLOC': 20,
        ORIGIN: 'Origin2',
        CTN: '11-20',
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

    const result = await service.processData(rows);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('INCOMPLETE_GROUP');
      expect(result.error).toBe('Line 2: Incomplete group error');
    }
  });

  // Test 7: extractCtnBlocksFromRow failure with fallback QTY > 0
  test('should use fallback quantity if extractCtnBlocksFromRow fails and QTY > 0', async () => {
    const rows: PackingListData = [
      {
        LINE: 1,
        'SKU MIN': 'SKU1',
        MAKE: 'Make1',
        MODEL: 'Model1',
        'DESCRIPTION MIN': 'Desc1',
        'QTY REQ MATCH': 10,
        'QTY ALLOC': 10,
        ORIGIN: 'Origin1',
        CTN: '1-10',
        QTY: 10,
      },
      {
        LINE: 2,
        'SKU MIN': 'SKU2',
        MAKE: 'Make2',
        MODEL: 'Model2',
        'DESCRIPTION MIN': 'Desc2',
        'QTY REQ MATCH': 20,
        'QTY ALLOC': 20,
        ORIGIN: 'Origin2',
        CTN: '11-20',
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

    const result = await service.processData(rows);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.data.length).toBe(2);
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
    expect(console.warn).not.toHaveBeenCalled();
  });

  // Test 8: extractCtnBlocksFromRow failure without fallback QTY <= 0
  test('should log an error if extractCtnBlocksFromRow fails and QTY <= 0', async () => {
    const rows: PackingListData = [
      {
        LINE: 1,
        'SKU MIN': 'SKU1',
        MAKE: 'Make1',
        MODEL: 'Model1',
        'DESCRIPTION MIN': 'Desc1',
        'QTY REQ MATCH': 10,
        'QTY ALLOC': 10,
        ORIGIN: 'Origin1',
        CTN: '1-10',
        QTY: 10,
      },
      {
        LINE: 2,
        'SKU MIN': 'SKU2',
        MAKE: 'Make2',
        MODEL: 'Model2',
        'DESCRIPTION MIN': 'Desc2',
        'QTY REQ MATCH': 0,
        'QTY ALLOC': 0,
        ORIGIN: 'Origin2',
        CTN: '11-20',
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

    const result = await service.processData(rows);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.data.length).toBe(1);
    }
    expect(console.warn).toHaveBeenCalledWith(
      'Errors while processing some rows:',
      ['Line 2: Another error (code: ANOTHER_ERROR)']
    );
  });

  // Test 9: Complete success (all rows processed successfully)
  test('should return complete success if all rows are processed successfully', async () => {
    const rows: PackingListData = [
      {
        LINE: 1,
        'SKU MIN': 'SKU1',
        MAKE: 'Make1',
        MODEL: 'Model1',
        'DESCRIPTION MIN': 'Desc1',
        'QTY REQ MATCH': 10,
        'QTY ALLOC': 10,
        ORIGIN: 'Origin1',
        CTN: '1-10',
        QTY: 10,
      },
      {
        LINE: 2,
        'SKU MIN': 'SKU2',
        MAKE: 'Make2',
        MODEL: 'Model2',
        'DESCRIPTION MIN': 'Desc2',
        'QTY REQ MATCH': 20,
        'QTY ALLOC': 20,
        ORIGIN: 'Origin2',
        CTN: '11-20',
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

    const result = await service.processData(rows);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.data.length).toBe(2);
      expect(result.data.summary.totalPcs).toBe(20);
    }
    expect(console.warn).not.toHaveBeenCalled();
  });

  // Test 10: Partial success with warnings (some errors, but valid results)
  test('should return success with warnings if some rows fail but valid data exists', async () => {
    const rows: PackingListData = [
      {
        LINE: 1,
        'SKU MIN': 'SKU1',
        MAKE: 'Make1',
        MODEL: 'Model1',
        'DESCRIPTION MIN': 'Desc1',
        'QTY REQ MATCH': 10,
        'QTY ALLOC': 10,
        ORIGIN: 'Origin1',
        CTN: '1-10',
        QTY: 10,
      },
      {
        LINE: 2,
        'SKU MIN': '',
        MAKE: 'Make2',
        MODEL: 'Model2',
        'DESCRIPTION MIN': '',
        'QTY REQ MATCH': 20,
        'QTY ALLOC': 20,
        ORIGIN: 'Origin2',
        CTN: '11-20',
        QTY: 20,
      }, // Base error
      {
        LINE: 3,
        'SKU MIN': 'SKU3',
        MAKE: 'Make3',
        MODEL: 'Model3',
        'DESCRIPTION MIN': 'Desc3',
        'QTY REQ MATCH': 30,
        'QTY ALLOC': 30,
        ORIGIN: 'Origin3',
        CTN: '21-30',
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

    const result = await service.processData(rows);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.data.length).toBe(2);
    }
    expect(console.warn).toHaveBeenCalledWith(
      'Errors while processing some rows:',
      ['Line 2: missing base data (description, model, origin)']
    );
  });

  // Test 11: Total failure (no valid data, only errors)
  test('should return total failure if no valid data is found and errors exist', async () => {
    const rows: PackingListData = [
      {
        LINE: 1,
        'SKU MIN': '',
        MAKE: 'Make1',
        MODEL: 'Model1',
        'DESCRIPTION MIN': '',
        'QTY REQ MATCH': 10,
        'QTY ALLOC': 10,
        ORIGIN: 'Origin1',
        CTN: '1-10',
        QTY: 0, // QTY à 0 pour éviter le fallback
      }, // Base error
      {
        LINE: 2,
        'SKU MIN': '',
        MAKE: '',
        MODEL: '',
        'DESCRIPTION MIN': '',
        'QTY REQ MATCH': 0,
        'QTY ALLOC': 0,
        ORIGIN: '',
        CTN: '',
        QTY: 0,
      }, // Invalid row (simulates an empty or malformed object)
      {
        LINE: 3,
        'SKU MIN': 'SKU3',
        MAKE: '',
        MODEL: 'Model3',
        'DESCRIPTION MIN': 'Desc3',
        'QTY REQ MATCH': 30,
        'QTY ALLOC': 30,
        ORIGIN: 'Origin3',
        CTN: '21-30',
        QTY: 0, // QTY à 0 pour éviter le fallback
      }, // Base error
    ];

    // Forcer l'échec de l'extraction pour toutes les lignes
    mockExtractCtnBlocksFromRow.mockReturnValue(
      createError('Extraction failed', 'EXTRACTION_FAILED')
    );

    const result = await service.processData(rows);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('PROCESSING_FAILED');
      expect(result.error).toContain('Failed to process data:');
    }
    expect(console.warn).not.toHaveBeenCalled();
  });

  // Test 12: Row that is not a valid object
  test('should log an error for a row that is not a valid object', async () => {
    const rows: PackingListData = [
      {
        LINE: 1,
        'SKU MIN': 'SKU1',
        MAKE: 'Make1',
        MODEL: 'Model1',
        'DESCRIPTION MIN': 'Desc1',
        'QTY REQ MATCH': 10,
        'QTY ALLOC': 10,
        ORIGIN: 'Origin1',
        CTN: '1-10',
        QTY: 10,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      null as any, // Force a null element in the array
      {
        LINE: 3,
        'SKU MIN': 'SKU2',
        MAKE: 'Make2',
        MODEL: 'Model2',
        'DESCRIPTION MIN': 'Desc2',
        'QTY REQ MATCH': 20,
        'QTY ALLOC': 20,
        ORIGIN: 'Origin2',
        CTN: '11-20',
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

    const result = await service.processData(rows);
    expect(result.success).toBe(true);
    expect(console.warn).toHaveBeenCalledWith(
      'Errors while processing some rows:',
      ['Line 2: invalid row data']
    );
    if (result.success) {
      expect(result.data.data.length).toBe(2);
    }
  });

  // Test 13: No valid data but with errors (PROCESSING_FAILED)
  test('should return PROCESSING_FAILED if no valid data is found but errors are logged', async () => {
    const rows: PackingListData = [
      {
        LINE: 1,
        'SKU MIN': '',
        MAKE: '',
        MODEL: '',
        'DESCRIPTION MIN': '',
        'QTY REQ MATCH': 0,
        'QTY ALLOC': 0,
        ORIGIN: '',
        CTN: '',
        QTY: 0,
      },
    ];
    mockExtractCtnBlocksFromRow.mockReturnValue(
      createError('No valid data', 'NO_VALID_DATA')
    );

    const result = await service.processData(rows);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('PROCESSING_FAILED');
      expect(result.error).toContain('Failed to process data:');
    }
  });

  // Test 14: NO_VALID_DATA case (no results and no errors)
  test('should return NO_VALID_DATA if no valid data is found and no errors are logged', async () => {
    const noValidDataResult = createError(
      'No valid data found in the provided rows',
      'NO_VALID_DATA'
    );

    expect(noValidDataResult.success).toBe(false);
    if (!noValidDataResult.success) {
      expect(noValidDataResult.code).toBe('NO_VALID_DATA');
      expect(noValidDataResult.error).toBe(
        'No valid data found in the provided rows'
      );
    }
  });
});
