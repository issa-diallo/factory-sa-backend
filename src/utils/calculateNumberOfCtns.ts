import { ProcessedItem } from '../types';

/**
 * Calculates the "Number of Ctns" value for each item based on the logic:
 * - "1" for the first occurrence of a carton number
 * - "*" for subsequent occurrences of the same carton
 *
 * @param items - Array of ProcessedItem to process
 * @returns Array of items with the numberOfCtns field added
 */
export function calculateNumberOfCtns(items: ProcessedItem[]): ProcessedItem[] {
  // Sort by ascending carton number
  const sortedItems = [...items].sort((a, b) => a.ctns - b.ctns);

  let currentCTN: number | null = null;

  return sortedItems.map(item => {
    if (item.ctns !== currentCTN) {
      currentCTN = item.ctns;
      return { ...item, numberOfCtns: '1' };
    } else {
      return { ...item, numberOfCtns: '*' };
    }
  });
}
