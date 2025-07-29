import 'reflect-metadata';
import { container } from '../../src/container';
import { extractCtnBlocksFromRow } from '../../src/utils/extractCtnBlocksFromRow';
import { createSuccess, createError, Result } from '../../src/types/result';
import { IPackingListService } from '../../src/services/packingList/interfaces';
import { PackingListData } from '../../src/schemas/packingListSchema';

jest.mock('../../src/utils/extractCtnBlocksFromRow');
const mockExtractCtnBlocksFromRow =
  extractCtnBlocksFromRow as jest.MockedFunction<
    typeof extractCtnBlocksFromRow
  >;

describe('PackingListService', () => {
  let service: IPackingListService;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    service = container.resolve<IPackingListService>('PackingListService');
    jest.clearAllMocks();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('rejects non-array input', async () => {
    const inputs = [null, undefined, {}, '', 123];
    for (const input of inputs) {
      const result = await service.processData(input as never);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('INVALID_INPUT_TYPE');
      }
    }
  });

  test('covers fallback when extractCtnBlocksFromRow returns no error and no code', async () => {
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
        CTN: 'some-invalid-range',
        QTY: 10,
      },
    ];

    const fakeResult: Result<unknown> = {
      success: false,
      error: '',
      code: '',
    };
    mockExtractCtnBlocksFromRow.mockReturnValueOnce(fakeResult);

    const result = await service.processData(rows);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('PROCESSING_FAILED');
      expect(result.error).toContain(
        'Failed to process data: Line 1: Error expanding CTN CTN: Invalid CTN format - only numbers, spaces, and separators (-->, –>, ->, →, to, TO, –, -) are allowed (code: CTN_EXPANSION_ERROR)'
      );
    }
  });

  test('handles non-object row value', async () => {
    const rows = [
      {
        LINE: 1,
        'SKU MIN': 'valid',
        MAKE: 'M1',
        MODEL: 'Model1',
        'DESCRIPTION MIN': 'Desc1',
        'QTY REQ MATCH': 10,
        'QTY ALLOC': 10,
        ORIGIN: 'O',
        CTN: '1-2',
        QTY: 10,
      },
      42 as unknown as PackingListData[number], // Invalid row
      {
        LINE: 3,
        'SKU MIN': 'valid',
        MAKE: 'M2',
        MODEL: 'Model2',
        'DESCRIPTION MIN': 'Desc2',
        'QTY REQ MATCH': 20,
        'QTY ALLOC': 20,
        ORIGIN: 'O',
        CTN: '3-4',
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
            origin: 'O',
          },
          {
            ctn: 2,
            qty: 10,
            totalQty: 10,
            description: 'Desc1',
            model: 'Model1',
            origin: 'O',
          },
        ])
      )
      .mockReturnValueOnce(
        createSuccess([
          {
            ctn: 3,
            qty: 20,
            totalQty: 20,
            description: 'Desc2',
            model: 'Model2',
            origin: 'O',
          },
          {
            ctn: 4,
            qty: 20,
            totalQty: 20,
            description: 'Desc2',
            model: 'Model2',
            origin: 'O',
          },
        ])
      );

    const result = await service.processData(rows);
    expect(result.success).toBe(true);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Errors while processing some rows:',
      ['Line 2: invalid row data']
    );
    if (result.success) {
      expect(result.data.summary.totalPcs).toBe(60);
      expect(result.data.data.length).toBe(4);
    }
  });

  test('rejects empty array', async () => {
    const result = await service.processData([]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });

  test('handles row with missing base data', async () => {
    const rows: PackingListData = [
      {
        LINE: 1,
        'SKU MIN': 'SKU1',
        MAKE: 'Make1',
        MODEL: '',
        'DESCRIPTION MIN': '   ',
        'QTY REQ MATCH': 10,
        'QTY ALLOC': 10,
        ORIGIN: 'Origin1',
        CTN: '1-10',
        QTY: 10,
      },
    ];
    const result = await service.processData(rows);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('PROCESSING_FAILED');
      expect(result.error).toMatch(/missing base data/);
    }
  });

  test('handles extractCtnBlocksFromRow error', async () => {
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
        CTN: 'bad-range',
        QTY: 10,
      },
    ];

    mockExtractCtnBlocksFromRow.mockReturnValueOnce(
      createError(
        'Failed to process data: Line 1: Error expanding CTN CTN: Invalid CTN format',
        'CTN_EXPANSION_ERROR'
      )
    );

    const result = await service.processData(rows);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('PROCESSING_FAILED');
      expect(result.error).toContain('CTN_EXPANSION_ERROR');
    }
  });

  test('handles valid row successfully', async () => {
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
        CTN: '1-3',
        QTY: 10,
      },
    ];

    mockExtractCtnBlocksFromRow.mockReturnValueOnce(
      createSuccess([
        {
          ctn: 1,
          qty: 10,
          totalQty: 10,
          description: 'Desc1',
          model: 'Model1',
          origin: 'Origin1',
        },
        {
          ctn: 2,
          qty: 10,
          totalQty: 10,
          description: 'Desc1',
          model: 'Model1',
          origin: 'Origin1',
        },
        {
          ctn: 3,
          qty: 10,
          totalQty: 10,
          description: 'Desc1',
          model: 'Model1',
          origin: 'Origin1',
        },
      ])
    );

    const result = await service.processData(rows);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.data.length).toBe(3);
      expect(result.data.summary.totalPcs).toBe(30);
    }
  });

  test('warns if some rows fail but others succeed', async () => {
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
      {
        LINE: 2,
        'SKU MIN': 'SKU2',
        MAKE: 'Make2',
        MODEL: 'Model2',
        'DESCRIPTION MIN': 'Desc2',
        'QTY REQ MATCH': 20,
        'QTY ALLOC': 20,
        ORIGIN: 'Origin2',
        CTN: '1-2',
        QTY: 20,
      },
    ];

    mockExtractCtnBlocksFromRow.mockReturnValueOnce(
      createSuccess([
        {
          ctn: 1,
          qty: 20,
          totalQty: 20,
          description: 'Desc2',
          model: 'Model2',
          origin: 'Origin2',
        },
        {
          ctn: 2,
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
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Errors while processing some rows:',
      ['Line 1: missing base data (description, model)']
    );
    if (result.success) {
      expect(result.data.data.length).toBe(2);
      expect(result.data.summary.totalPcs).toBe(40);
    }
  });
});
