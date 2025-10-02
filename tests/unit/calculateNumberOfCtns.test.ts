import { calculateNumberOfCtns } from '../../src/utils/calculateNumberOfCtns';
import { ProcessedItem } from '../../src/types';

describe('calculateNumberOfCtns', () => {
  it('should assign "1" to first occurrence of each CTN and "*" to subsequent ones', () => {
    const items: ProcessedItem[] = [
      {
        description: 'Produit A',
        category: 'Category A',
        ctns: 1,
        qty: 50,
        totalQty: 50,
        pal: 1,
      },
      {
        description: 'Produit B',
        category: 'Category B',
        ctns: 1,
        qty: 30,
        totalQty: 30,
        pal: 1,
      },
      {
        description: 'Produit C',
        category: 'Category C',
        ctns: 2,
        qty: 100,
        totalQty: 100,
        pal: 2,
      },
      {
        description: 'Produit A',
        category: 'Category A',
        ctns: 3,
        qty: 50,
        totalQty: 50,
        pal: 3,
      },
      {
        description: 'Produit D',
        category: 'Category D',
        ctns: 3,
        qty: 20,
        totalQty: 20,
        pal: 3,
      },
    ];

    const result = calculateNumberOfCtns(items);

    expect(result).toHaveLength(5);

    // CTN 1 - First occurrence
    expect(result[0].numberOfCtns).toBe('1');
    expect(result[0].ctns).toBe(1);
    expect(result[0].description).toBe('Produit A');

    // CTN 1 - Second occurrence
    expect(result[1].numberOfCtns).toBe('*');
    expect(result[1].ctns).toBe(1);
    expect(result[1].description).toBe('Produit B');

    // CTN 2 - First occurrence
    expect(result[2].numberOfCtns).toBe('1');
    expect(result[2].ctns).toBe(2);
    expect(result[2].description).toBe('Produit C');

    // CTN 3 - First occurrence
    expect(result[3].numberOfCtns).toBe('1');
    expect(result[3].ctns).toBe(3);
    expect(result[3].description).toBe('Produit A');

    // CTN 3 - Second occurrence
    expect(result[4].numberOfCtns).toBe('*');
    expect(result[4].ctns).toBe(3);
    expect(result[4].description).toBe('Produit D');
  });

  it('should handle items already sorted by CTN', () => {
    const items: ProcessedItem[] = [
      {
        description: 'Produit A',
        category: 'Category A',
        ctns: 1,
        qty: 50,
        totalQty: 50,
        pal: 1,
      },
      {
        description: 'Produit B',
        category: 'Category B',
        ctns: 1,
        qty: 30,
        totalQty: 30,
        pal: 1,
      },
    ];

    const result = calculateNumberOfCtns(items);

    expect(result[0].numberOfCtns).toBe('1');
    expect(result[1].numberOfCtns).toBe('*');
  });

  it('should handle items not sorted by CTN', () => {
    const items: ProcessedItem[] = [
      {
        description: 'Produit C',
        category: 'Category C',
        ctns: 2,
        qty: 100,
        totalQty: 100,
        pal: 2,
      },
      {
        description: 'Produit A',
        category: 'Category A',
        ctns: 1,
        qty: 50,
        totalQty: 50,
        pal: 1,
      },
      {
        description: 'Produit B',
        category: 'Category B',
        ctns: 1,
        qty: 30,
        totalQty: 30,
        pal: 1,
      },
    ];

    const result = calculateNumberOfCtns(items);

    // Should be sorted by CTN first
    expect(result[0].ctns).toBe(1);
    expect(result[0].numberOfCtns).toBe('1');
    expect(result[0].description).toBe('Produit A');

    expect(result[1].ctns).toBe(1);
    expect(result[1].numberOfCtns).toBe('*');
    expect(result[1].description).toBe('Produit B');

    expect(result[2].ctns).toBe(2);
    expect(result[2].numberOfCtns).toBe('1');
    expect(result[2].description).toBe('Produit C');
  });

  it('should handle single item', () => {
    const items: ProcessedItem[] = [
      {
        description: 'Produit A',
        category: 'Category A',
        ctns: 1,
        qty: 50,
        totalQty: 50,
        pal: 1,
      },
    ];

    const result = calculateNumberOfCtns(items);

    expect(result).toHaveLength(1);
    expect(result[0].numberOfCtns).toBe('1');
  });

  it('should handle empty array', () => {
    const items: ProcessedItem[] = [];

    const result = calculateNumberOfCtns(items);

    expect(result).toHaveLength(0);
  });
});
