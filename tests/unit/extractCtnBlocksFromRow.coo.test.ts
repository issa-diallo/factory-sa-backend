import { extractCtnBlocksFromRow } from '../../src/utils/extractCtnBlocksFromRow';

describe('extractCtnBlocksFromRow - COO functionality', () => {
  it('should add COO field when ORIGIN is provided and country is found', () => {
    const row = {
      'DESCRIPTION MIN': 'Test product',
      MODEL: 'Test model',
      ORIGIN: 'India',
      CTN: '100',
      QTY: 1,
    };

    const base = {
      description: 'Test product',
      model: 'Test model',
    };

    const result = extractCtnBlocksFromRow(row, base);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].coo).toBe('IN');
    }
  });

  it('should add COO field with "N/A" when ORIGIN is provided but country is not found', () => {
    const row = {
      'DESCRIPTION MIN': 'Test product',
      MODEL: 'Test model',
      ORIGIN: 'UnknownCountry',
      CTN: '100',
      QTY: 1,
    };

    const base = {
      description: 'Test product',
      model: 'Test model',
    };

    const result = extractCtnBlocksFromRow(row, base);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].coo).toBe('N/A');
    }
  });

  it('should not add COO field when ORIGIN is not provided', () => {
    const row = {
      'DESCRIPTION MIN': 'Test product',
      MODEL: 'Test model',
      CTN: '100',
      QTY: 1,
    };

    const base = {
      description: 'Test product',
      model: 'Test model',
    };

    const result = extractCtnBlocksFromRow(row, base);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].coo).toBeUndefined();
    }
  });

  it('should handle French country names correctly', () => {
    const row = {
      'DESCRIPTION MIN': 'Test product',
      MODEL: 'Test model',
      ORIGIN: 'france',
      CTN: '100',
      QTY: 1,
    };

    const base = {
      description: 'Test product',
      model: 'Test model',
    };

    const result = extractCtnBlocksFromRow(row, base);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].coo).toBe('FR');
    }
  });

  it('should handle multiple CTN blocks with same COO', () => {
    const row = {
      'DESCRIPTION MIN': 'Test product',
      MODEL: 'Test model',
      ORIGIN: 'China',
      CTN: '100 to 102',
      QTY: 1,
    };

    const base = {
      description: 'Test product',
      model: 'Test model',
    };

    const result = extractCtnBlocksFromRow(row, base);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(3);
      result.data.forEach(item => {
        expect(item.coo).toBe('CN');
      });
    }
  });

  it('should not add COO field when ORIGIN is empty string', () => {
    const row = {
      'DESCRIPTION MIN': 'Test product',
      MODEL: 'Test model',
      ORIGIN: '',
      CTN: '100',
      QTY: 1,
    };

    const base = {
      description: 'Test product',
      model: 'Test model',
    };

    const result = extractCtnBlocksFromRow(row, base);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].coo).toBeUndefined();
    }
  });
});
