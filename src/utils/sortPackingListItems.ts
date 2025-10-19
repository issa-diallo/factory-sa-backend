import { ProcessedItem } from '../types';

/**
 * Sorts packing list items according to the specified rules:
 * - ascending order by `pal` if it exists, treating undefined `pal` as a higher value (so elements with `pal` come first)
 * - if `pal` values are equal or both undefined, then sort by `ctns` ascending order
 *
 * @param items - Array of `ProcessedItem` elements to sort
 * @returns A new sorted array (does not modify the original)
 */
export function sortPackingListItems(items: ProcessedItem[]): ProcessedItem[] {
  return [...items].sort((a, b) => {
    const aPal = a.pal === undefined ? Infinity : Number(a.pal);
    const bPal = b.pal === undefined ? Infinity : Number(b.pal);

    const aCtns = Number(a.ctns);
    const bCtns = Number(b.ctns);

    // Sort by Pal first
    if (aPal !== bPal) {
      return aPal - bPal;
    }

    // If Pal values are equal (or both undefined/Infinity), then sort by Ctns
    return aCtns - bCtns;
  });
}
