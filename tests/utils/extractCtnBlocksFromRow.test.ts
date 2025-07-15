import { extractCtnBlocksFromRow } from '../../src/utils/extractCtnBlocksFromRow';
import { RANGE_SEPARATORS } from '../../src/constants';

describe('extractCtnBlocksFromRow', () => {
  const validBase = {
    description: 'Test Product',
    model: 'MODEL-123',
    origin: 'China',
  };

  describe('Valid inputs', () => {
    test('should extract single CTN block', () => {
      const row = {
        CTN: '100',
        QTY: '50',
        PAL: '1',
      };

      const result = extractCtnBlocksFromRow(row, validBase);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toEqual({
          ...validBase,
          ctn: 100,
          qty: 50,
          totalQty: 50,
          pal: 1,
        });
      }
    });

    test('should extract CTN range', () => {
      const row = {
        CTN: '100-102',
        QTY: '25',
        PAL: '2',
      };

      const result = extractCtnBlocksFromRow(row, validBase);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(3);
        expect(result.data[0].ctn).toBe(100);
        expect(result.data[1].ctn).toBe(101);
        expect(result.data[2].ctn).toBe(102);
        expect(result.data[0].qty).toBe(25);
        expect(result.data[0].pal).toBe(2);
      }
    });

    test('should extract multiple CTN blocks', () => {
      const row = {
        CTN: '100',
        QTY: '50',
        PAL: '1',
        CTN_2: '200-201',
        QTY_2: '30',
        PAL_2: '2',
      };

      const result = extractCtnBlocksFromRow(row, validBase);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(3);

        // First block
        expect(result.data[0]).toEqual({
          ...validBase,
          ctn: 100,
          qty: 50,
          totalQty: 50,
          pal: 1,
        });

        // Second block
        expect(result.data[1].ctn).toBe(200);
        expect(result.data[1].qty).toBe(30);
        expect(result.data[1].pal).toBe(2);

        expect(result.data[2].ctn).toBe(201);
        expect(result.data[2].qty).toBe(30);
        expect(result.data[2].pal).toBe(2);
      }
    });

    test('should handle missing PAL (optional)', () => {
      const row = {
        CTN: '100',
        QTY: '50',
      };

      const result = extractCtnBlocksFromRow(row, validBase);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].pal).toBeUndefined();
      }
    });

    test('should handle numeric values', () => {
      const row = {
        CTN: 100,
        QTY: 50,
        PAL: 1,
      };

      const result = extractCtnBlocksFromRow(row, validBase);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].ctn).toBe(100);
        expect(result.data[0].qty).toBe(50);
        expect(result.data[0].pal).toBe(1);
      }
    });
  });

  describe('Invalid inputs', () => {
    test('should return error for invalid row data', () => {
      const result = extractCtnBlocksFromRow(
        null as unknown as Record<string, string | number>,
        validBase
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('INVALID_ROW_DATA');
      }
    });

    test('should return error for invalid base item', () => {
      const row = { CTN: '100', QTY: '50' };
      const invalidBase = {
        description: '',
        model: 'MODEL-123',
        origin: 'China',
      };

      const result = extractCtnBlocksFromRow(row, invalidBase);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('INVALID_BASE_ITEM');
      }
    });

    test('should return error for no CTN data', () => {
      const row = { DESCRIPTION: 'Test', MODEL: 'MODEL-123' };

      const result = extractCtnBlocksFromRow(row, validBase);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('NO_CTN_DATA');
      }
    });

    test('should return error for invalid quantity', () => {
      const row = {
        CTN: '100',
        QTY: 'invalid',
      };

      const result = extractCtnBlocksFromRow(row, validBase);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('INVALID_QUANTITY');
        expect(result.error).toContain(
          'Invalid quantity for QTY: must be a positive integer'
        );
      }
    });

    test('should return error for zero quantity', () => {
      const row = {
        CTN: '100',
        QTY: '0',
      };

      const result = extractCtnBlocksFromRow(row, validBase);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('INVALID_QUANTITY');
      }
    });

    test('should return error for invalid pallet', () => {
      const row = {
        CTN: '100',
        QTY: '50',
        PAL: 'invalid',
      };

      const result = extractCtnBlocksFromRow(row, validBase);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('INVALID_PALLET');
        expect(result.error).toContain('Invalid pallet number');
      }
    });

    test('should return error for zero pallet', () => {
      const row = {
        CTN: '100',
        QTY: '50',
        PAL: '0',
      };

      const result = extractCtnBlocksFromRow(row, validBase);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('INVALID_PALLET');
        expect(result.error).toContain('Invalid pallet number');
      }
    });

    test('should return error for invalid CTN range', () => {
      const row = {
        CTN: 'invalid-range',
        QTY: '50',
      };

      const result = extractCtnBlocksFromRow(row, validBase);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('CTN_EXPANSION_ERROR');
        expect(result.error).toContain(
          `Error expanding CTN CTN: Invalid CTN format - only numbers, spaces, and separators (${RANGE_SEPARATORS.join(', ')}) are allowed`
        );
      }
    });
  });

  describe('Edge cases', () => {
    test('should skip incomplete blocks and process valid ones', () => {
      const row = {
        CTN: '100',
        QTY: '50',
        CTN_2: '200', // Missing QTY_2
        CTN_3: '300',
        QTY_3: '25',
      };

      const result = extractCtnBlocksFromRow(row, validBase);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2); // Only CTN and CTN_3 blocks
        expect(result.data[0].ctn).toBe(100);
        expect(result.data[1].ctn).toBe(300);
      }
    });

    test('should return error when no valid blocks are processed', () => {
      const row = {
        CTN: '100', // Missing QTY
        CTN_2: '200', // Missing QTY_2
      };

      const result = extractCtnBlocksFromRow(row, validBase);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('NO_PROCESSED_ITEMS');
      }
    });
  });
});
