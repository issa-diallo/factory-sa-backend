import { sortPackingListItems } from '../../src/utils/sortPackingListItems';
import { ProcessedItem } from '../../src/types';

describe('sortPackingListItems', () => {
  it('should return empty array when input is empty', () => {
    const result = sortPackingListItems([]);
    expect(result).toEqual([]);
  });

  it('should sort by ctn when no items have pal', () => {
    const items: ProcessedItem[] = [
      { description: 'Item A', model: 'Model A', ctn: 3, qty: 1, totalQty: 1 },
      { description: 'Item B', model: 'Model B', ctn: 1, qty: 2, totalQty: 2 },
      { description: 'Item C', model: 'Model C', ctn: 2, qty: 3, totalQty: 3 },
    ];

    const result = sortPackingListItems(items);

    expect(result).toEqual([
      { description: 'Item B', model: 'Model B', ctn: 1, qty: 2, totalQty: 2 },
      { description: 'Item C', model: 'Model C', ctn: 2, qty: 3, totalQty: 3 },
      { description: 'Item A', model: 'Model A', ctn: 3, qty: 1, totalQty: 1 },
    ]);
  });

  it('should sort by pal when all items have pal', () => {
    const items: ProcessedItem[] = [
      {
        description: 'Item A',
        model: 'Model A',
        ctn: 3,
        pal: 2,
        qty: 1,
        totalQty: 1,
      },
      {
        description: 'Item B',
        model: 'Model B',
        ctn: 1,
        pal: 3,
        qty: 2,
        totalQty: 2,
      },
      {
        description: 'Item C',
        model: 'Model C',
        ctn: 2,
        pal: 1,
        qty: 3,
        totalQty: 3,
      },
    ];

    const result = sortPackingListItems(items);

    expect(result).toEqual([
      {
        description: 'Item C',
        model: 'Model C',
        ctn: 2,
        pal: 1,
        qty: 3,
        totalQty: 3,
      },
      {
        description: 'Item A',
        model: 'Model A',
        ctn: 3,
        pal: 2,
        qty: 1,
        totalQty: 1,
      },
      {
        description: 'Item B',
        model: 'Model B',
        ctn: 1,
        pal: 3,
        qty: 2,
        totalQty: 2,
      },
    ]);
  });

  it('should prioritize items with pal over items without pal', () => {
    const items: ProcessedItem[] = [
      { description: 'Item A', model: 'Model A', ctn: 3, qty: 1, totalQty: 1 },
      {
        description: 'Item B',
        model: 'Model B',
        ctn: 1,
        pal: 2,
        qty: 2,
        totalQty: 2,
      },
      { description: 'Item C', model: 'Model C', ctn: 2, qty: 3, totalQty: 3 },
    ];

    const result = sortPackingListItems(items);

    expect(result).toEqual([
      {
        description: 'Item B',
        model: 'Model B',
        ctn: 1,
        pal: 2,
        qty: 2,
        totalQty: 2,
      },
      { description: 'Item C', model: 'Model C', ctn: 2, qty: 3, totalQty: 3 },
      { description: 'Item A', model: 'Model A', ctn: 3, qty: 1, totalQty: 1 },
    ]);
  });

  it('should sort mixed items correctly (pal priority + ctn sorting)', () => {
    const items: ProcessedItem[] = [
      { description: 'Item A', model: 'Model A', ctn: 5, qty: 1, totalQty: 1 },
      {
        description: 'Item B',
        model: 'Model B',
        ctn: 2,
        pal: 3,
        qty: 2,
        totalQty: 2,
      },
      {
        description: 'Item C',
        model: 'Model C',
        ctn: 3,
        pal: 1,
        qty: 3,
        totalQty: 3,
      },
      { description: 'Item D', model: 'Model D', ctn: 1, qty: 4, totalQty: 4 },
      {
        description: 'Item E',
        model: 'Model E',
        ctn: 4,
        pal: 2,
        qty: 5,
        totalQty: 5,
      },
    ];

    const result = sortPackingListItems(items);

    expect(result).toEqual([
      {
        description: 'Item C',
        model: 'Model C',
        ctn: 3,
        pal: 1,
        qty: 3,
        totalQty: 3,
      },
      {
        description: 'Item E',
        model: 'Model E',
        ctn: 4,
        pal: 2,
        qty: 5,
        totalQty: 5,
      },
      {
        description: 'Item B',
        model: 'Model B',
        ctn: 2,
        pal: 3,
        qty: 2,
        totalQty: 2,
      },
      { description: 'Item D', model: 'Model D', ctn: 1, qty: 4, totalQty: 4 },
      { description: 'Item A', model: 'Model A', ctn: 5, qty: 1, totalQty: 1 },
    ]);
  });

  it('should not mutate the original array', () => {
    const originalItems: ProcessedItem[] = [
      { description: 'Item A', model: 'Model A', ctn: 3, qty: 1, totalQty: 1 },
      { description: 'Item B', model: 'Model B', ctn: 1, qty: 2, totalQty: 2 },
    ];

    const itemsCopy = [...originalItems];
    const result = sortPackingListItems(originalItems);

    expect(originalItems).toEqual(itemsCopy); // Original array not modified
    expect(result).not.toBe(originalItems); // New array returned
  });
});
