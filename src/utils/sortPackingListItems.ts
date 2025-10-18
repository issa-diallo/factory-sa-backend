import { ProcessedItem } from '../types';

/**
 * Sorts packing list items according to the specified rules:
 * - ascending order by `pal` if it exists, otherwise by `ctns`
 * - if `pal` values are equal, then sort by `ctns` ascending order
 *
 * @param items - Array of `ProcessedItem` elements to sort
 * @returns A new sorted array (does not modify the original)
 */
export function sortPackingListItems(items: ProcessedItem[]): ProcessedItem[] {
  return [...items].sort((a, b) => {
    // All items should have Ctns by default as per the schema, ensure it's a number
    const aCtns = Number(a.ctns);
    const bCtns = Number(b.ctns);

    // If both items have 'pal' defined
    if (a.pal !== undefined && b.pal !== undefined) {
      if (a.pal !== b.pal) {
        return Number(a.pal) - Number(b.pal);
      }
      // If 'pal' values are equal, sort by 'ctns'
      return aCtns - bCtns;
    }

    // Only 'a' has 'pal' defined, 'a' comes first
    if (a.pal !== undefined) {
      // b.pal is undefined here
      return -1;
    }

    // Only 'b' has 'pal' defined, 'b' comes first
    if (b.pal !== undefined) {
      // a.pal is undefined here
      return 1;
    }

    // Neither has 'pal' defined, sort by 'ctns'
    return aCtns - bCtns;
  });
}
