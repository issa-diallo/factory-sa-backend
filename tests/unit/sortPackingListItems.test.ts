import { sortPackingListItems } from '../../src/utils/sortPackingListItems';
import { calculateNumberOfCtns } from '../../src/utils/calculateNumberOfCtns';
import { ProcessedItem } from '../../src/types';

describe('sortPackingListItems', () => {
  it('should return empty array when input is empty', () => {
    const result = sortPackingListItems([]);
    expect(result).toEqual([]);
  });

  it('should sort by ctn when no items have pal', () => {
    const items: ProcessedItem[] = [
      {
        description: 'Item A',
        category: 'Model A',
        ctns: 3,
        qty: 1,
        totalQty: 1,
      },
      {
        description: 'Item B',
        category: 'Model B',
        ctns: 1,
        qty: 2,
        totalQty: 2,
      },
      {
        description: 'Item C',
        category: 'Model C',
        ctns: 2,
        qty: 3,
        totalQty: 3,
      },
    ];

    const result = sortPackingListItems(items);

    expect(result).toEqual([
      {
        description: 'Item B',
        category: 'Model B',
        ctns: 1,
        qty: 2,
        totalQty: 2,
      },
      {
        description: 'Item C',
        category: 'Model C',
        ctns: 2,
        qty: 3,
        totalQty: 3,
      },
      {
        description: 'Item A',
        category: 'Model A',
        ctns: 3,
        qty: 1,
        totalQty: 1,
      },
    ]);
  });

  it('should sort by pal when all items have pal', () => {
    const items: ProcessedItem[] = [
      {
        description: 'Item A',
        category: 'Model A',
        ctns: 3,
        pal: 2,
        qty: 1,
        totalQty: 1,
      },
      {
        description: 'Item B',
        category: 'Model B',
        ctns: 1,
        pal: 3,
        qty: 2,
        totalQty: 2,
      },
      {
        description: 'Item C',
        category: 'Model C',
        ctns: 2,
        pal: 1,
        qty: 3,
        totalQty: 3,
      },
    ];

    const result = sortPackingListItems(items);

    expect(result).toEqual([
      {
        description: 'Item C',
        category: 'Model C',
        ctns: 2,
        pal: 1,
        qty: 3,
        totalQty: 3,
      },
      {
        description: 'Item A',
        category: 'Model A',
        ctns: 3,
        pal: 2,
        qty: 1,
        totalQty: 1,
      },
      {
        description: 'Item B',
        category: 'Model B',
        ctns: 1,
        pal: 3,
        qty: 2,
        totalQty: 2,
      },
    ]);
  });

  it('should prioritize items with pal over items without pal', () => {
    const items: ProcessedItem[] = [
      {
        description: 'Item A',
        category: 'Model A',
        ctns: 3,
        qty: 1,
        totalQty: 1,
      },
      {
        description: 'Item B',
        category: 'Model B',
        ctns: 1,
        pal: 2,
        qty: 2,
        totalQty: 2,
      },
      {
        description: 'Item C',
        category: 'Model C',
        ctns: 2,
        qty: 3,
        totalQty: 3,
      },
    ];

    const result = sortPackingListItems(items);

    expect(result).toEqual([
      {
        description: 'Item B',
        category: 'Model B',
        ctns: 1,
        pal: 2,
        qty: 2,
        totalQty: 2,
      },
      {
        description: 'Item C',
        category: 'Model C',
        ctns: 2,
        qty: 3,
        totalQty: 3,
      },
      {
        description: 'Item A',
        category: 'Model A',
        ctns: 3,
        qty: 1,
        totalQty: 1,
      },
    ]);
  });

  it('should sort mixed items correctly (pal priority + ctn sorting)', () => {
    const items: ProcessedItem[] = [
      {
        description: 'Item A',
        category: 'Model A',
        ctns: 5,
        qty: 1,
        totalQty: 1,
      },
      {
        description: 'Item B',
        category: 'Model B',
        ctns: 2,
        pal: 3,
        qty: 2,
        totalQty: 2,
      },
      {
        description: 'Item C',
        category: 'Model C',
        ctns: 3,
        pal: 1,
        qty: 3,
        totalQty: 3,
      },
      {
        description: 'Item D',
        category: 'Model D',
        ctns: 1,
        qty: 4,
        totalQty: 4,
      },
      {
        description: 'Item E',
        category: 'Model E',
        ctns: 4,
        pal: 2,
        qty: 5,
        totalQty: 5,
      },
    ];

    const result = sortPackingListItems(items);

    expect(result).toEqual([
      {
        description: 'Item C',
        category: 'Model C',
        ctns: 3,
        pal: 1,
        qty: 3,
        totalQty: 3,
      },
      {
        description: 'Item E',
        category: 'Model E',
        ctns: 4,
        pal: 2,
        qty: 5,
        totalQty: 5,
      },
      {
        description: 'Item B',
        category: 'Model B',
        ctns: 2,
        pal: 3,
        qty: 2,
        totalQty: 2,
      },
      {
        description: 'Item D',
        category: 'Model D',
        ctns: 1,
        qty: 4,
        totalQty: 4,
      },
      {
        description: 'Item A',
        category: 'Model A',
        ctns: 5,
        qty: 1,
        totalQty: 1,
      },
    ]);
  });

  it('should not mutate the original array', () => {
    const originalItems: ProcessedItem[] = [
      {
        description: 'Item A',
        category: 'Model A',
        ctns: 3,
        qty: 1,
        totalQty: 1,
      },
      {
        description: 'Item B',
        category: 'Model B',
        ctns: 1,
        qty: 2,
        totalQty: 2,
      },
    ];

    const itemsCopy = [...originalItems];
    const result = sortPackingListItems(originalItems);

    expect(originalItems).toEqual(itemsCopy); // Original array not modified
    expect(result).not.toBe(originalItems); // New array returned
  });

  it('should produce the same sorting order regardless of calculateNumberOfCtns application', () => {
    const originalItems: ProcessedItem[] = [
      {
        description: 'Item A',
        category: 'Model A',
        ctns: 5,
        qty: 1,
        totalQty: 5,
      },
      {
        description: 'Item B',
        category: 'Model B',
        ctns: 2,
        pal: 3,
        qty: 2,
        totalQty: 4,
      },
      {
        description: 'Item C',
        category: 'Model C',
        ctns: 3,
        pal: 1,
        qty: 3,
        totalQty: 3,
      },
      {
        description: 'Item D',
        category: 'Model D',
        ctns: 2,
        qty: 4,
        totalQty: 8,
      },
      {
        description: 'Item E',
        category: 'Model E',
        ctns: 4,
        pal: 2,
        qty: 5,
        totalQty: 10,
      },
      {
        description: 'Item F',
        category: 'Model F',
        ctns: 1,
        qty: 6,
        totalQty: 6,
      },
    ];
    const directlySorted = sortPackingListItems(originalItems);
    const itemsWithCalculatedCtns = calculateNumberOfCtns(originalItems);
    const sortedAfterCalc = sortPackingListItems(itemsWithCalculatedCtns);
    const mapToComparable = (items: ProcessedItem[]) =>
      items.map(({ numberOfCtns: _numberOfCtns, ...rest }) => rest);

    const directlyComparable = mapToComparable(directlySorted);
    const afterCalcComparable = mapToComparable(sortedAfterCalc);
    expect(afterCalcComparable).toEqual(directlyComparable);
  });

  it('should sort by pal first, then by ctns when pal values are the same', () => {
    const items: ProcessedItem[] = [
      {
        pal: 1,
        ctns: 5,
        description: 'Item A',
        category: 'A',
        qty: 1,
        totalQty: 1,
      },
      {
        pal: 1,
        ctns: 2,
        description: 'Item B',
        category: 'B',
        qty: 1,
        totalQty: 1,
      },
      {
        pal: 2,
        ctns: 3,
        description: 'Item C',
        category: 'C',
        qty: 1,
        totalQty: 1,
      },
      {
        pal: 2,
        ctns: 1,
        description: 'Item D',
        category: 'D',
        qty: 1,
        totalQty: 1,
      },
      {
        pal: 1,
        ctns: 3,
        description: 'Item E',
        category: 'E',
        qty: 1,
        totalQty: 1,
      },
    ];

    const sortedItems = sortPackingListItems(items);

    expect(sortedItems).toEqual([
      {
        pal: 1,
        ctns: 2,
        description: 'Item B',
        category: 'B',
        qty: 1,
        totalQty: 1,
      },
      {
        pal: 1,
        ctns: 3,
        description: 'Item E',
        category: 'E',
        qty: 1,
        totalQty: 1,
      },
      {
        pal: 1,
        ctns: 5,
        description: 'Item A',
        category: 'A',
        qty: 1,
        totalQty: 1,
      },
      {
        pal: 2,
        ctns: 1,
        description: 'Item D',
        category: 'D',
        qty: 1,
        totalQty: 1,
      },
      {
        pal: 2,
        ctns: 3,
        description: 'Item C',
        category: 'C',
        qty: 1,
        totalQty: 1,
      },
    ]);
  });

  it('should sort items with higher pal values properly and keep undefined pal last', () => {
    const items: ProcessedItem[] = [
      {
        pal: 4,
        ctns: 130,
        description: 'Item A',
        category: 'A',
        qty: 1,
        totalQty: 1,
      },
      {
        pal: 7,
        ctns: 131,
        description: 'Item B',
        category: 'B',
        qty: 1,
        totalQty: 1,
      },
      {
        pal: 4,
        ctns: 132,
        description: 'Item C',
        category: 'C',
        qty: 1,
        totalQty: 1,
      },
      { ctns: 133, description: 'Item D', category: 'D', qty: 1, totalQty: 1 },
      {
        pal: 4,
        ctns: 134,
        description: 'Item E',
        category: 'E',
        qty: 1,
        totalQty: 1,
      },
    ];

    const sortedItems = sortPackingListItems(items);

    expect(sortedItems).toEqual([
      {
        pal: 4,
        ctns: 130,
        description: 'Item A',
        category: 'A',
        qty: 1,
        totalQty: 1,
      },
      {
        pal: 4,
        ctns: 132,
        description: 'Item C',
        category: 'C',
        qty: 1,
        totalQty: 1,
      },
      {
        pal: 4,
        ctns: 134,
        description: 'Item E',
        category: 'E',
        qty: 1,
        totalQty: 1,
      },
      {
        pal: 7,
        ctns: 131,
        description: 'Item B',
        category: 'B',
        qty: 1,
        totalQty: 1,
      },
      { ctns: 133, description: 'Item D', category: 'D', qty: 1, totalQty: 1 },
    ]);
  });
});
