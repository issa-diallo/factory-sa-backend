import { expandCtnRange } from '../../src/utils/expandCtnRange';

describe('expandCtnRange', () => {
  describe('Valid ranges', () => {
    test('should expand simple range with -->', () => {
      const result = expandCtnRange('265-->267');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([265, 266, 267]);
      }
    });

    test('should expand simple range with -', () => {
      const result = expandCtnRange('300-303');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([300, 301, 302, 303]);
      }
    });

    test('should expand range with -> separator', () => {
      const result = expandCtnRange('10->12');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([10, 11, 12]);
      }
    });

    test('should expand range with → separator', () => {
      const result = expandCtnRange('20→22');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([20, 21, 22]);
      }
    });

    test('should expand range with – separator', () => {
      const result = expandCtnRange('30–32');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([30, 31, 32]);
      }
    });

    test('should expand range with to separator', () => {
      const result = expandCtnRange('40to42');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([40, 41, 42]);
      }
    });

    test('should expand range with –> separator', () => {
      const result = expandCtnRange('50–>52');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([50, 51, 52]);
      }
    });

    test('should handle single number', () => {
      const result = expandCtnRange('150');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([150]);
      }
    });

    test('should handle single number with whitespace', () => {
      const result = expandCtnRange('  42  ');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([42]);
      }
    });

    test('should handle range where start and end are the same', () => {
      const result = expandCtnRange('5-5');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([5]);
      }
    });

    test('should handle large ranges', () => {
      const result = expandCtnRange('1000-1005');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([1000, 1001, 1002, 1003, 1004, 1005]);
      }
    });
  });

  describe('Invalid inputs', () => {
    test('should return error for empty string', () => {
      const result = expandCtnRange('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('INVALID_INPUT');
        expect(result.error).toContain('CTN value cannot be empty');
      }
    });

    test('should return error for invalid range (reversed)', () => {
      const result = expandCtnRange('267-->265');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('INVALID_RANGE_ORDER');
        expect(result.error).toContain('is greater than');
      }
    });

    test('should return error for non-numeric values', () => {
      const result = expandCtnRange('abc');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('INVALID_INPUT');
        expect(result.error).toContain('Invalid CTN format');
      }
    });

    test('should return error for invalid range format', () => {
      const result = expandCtnRange('100--200--300');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('INVALID_RANGE_FORMAT');
        expect(result.error).toContain('Invalid range format');
      }
    });

    test('should return error for zero values', () => {
      const result = expandCtnRange('0');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('INVALID_NUMBER_VALUE');
        expect(result.error).toContain('must be a positive integer');
      }
    });

    test('should return error for negative values', () => {
      const result = expandCtnRange('-5');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('INVALID_RANGE_NUMBERS');
        expect(result.error).toContain('must be valid numbers');
      }
    });

    test('should return error for range with zero', () => {
      const result = expandCtnRange('0-5');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('INVALID_RANGE_VALUES');
        expect(result.error).toContain('must be positive integers');
      }
    });

    test('should return error for invalid characters', () => {
      const result = expandCtnRange('100@200');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('INVALID_INPUT');
        expect(result.error).toContain('Invalid CTN format');
      }
    });
  });
});
