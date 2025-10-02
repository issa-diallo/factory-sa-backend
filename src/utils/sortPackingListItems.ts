import { ProcessedItem } from '../types';

/**
 * Sorts packing list items according to the specified rules:
 * - ascending order by `ctn` by default
 * - if `pal` exists, ascending order by `pal` (takes priority over `ctn`)
 *
 * @param items - Array of `ProcessedItem` elements to sort
 * @returns A new sorted array (does not modify the original)
 */
export function sortPackingListItems(items: ProcessedItem[]): ProcessedItem[] {
  // Create a copy to avoid modifying the original array
  return [...items].sort((a, b) => {
    // If both items have a `pal` value, sort by `pal`
    if (a.pal !== undefined && b.pal !== undefined) {
      return a.pal - b.pal;
    }

    // If neither has a `pal`, sort by `ctn`
    if (a.pal === undefined && b.pal === undefined) {
      return a.ctns - b.ctns;
    }

    // Prioritize items with `pal` (they come first)
    return a.pal !== undefined ? -1 : 1;
  });
}
