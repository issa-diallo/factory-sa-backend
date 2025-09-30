import { z } from 'zod';
import { RANGE_SEPARATORS } from '../constants';

const escapedSeparators = RANGE_SEPARATORS.map(s =>
  s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
).join('|');
const ctnRangeRegex = new RegExp(`^(?:\\d|\\s|${escapedSeparators})+$`);

// Schema for the input of expandCtnRange
export const CtnRangeInputSchema = z
  .string()
  .min(1, 'CTN value cannot be empty')
  .trim()
  .refine(
    val => ctnRangeRegex.test(val),
    `Invalid CTN format - only numbers, spaces, and separators (${RANGE_SEPARATORS.join(', ')}) are allowed`
  );

// Schema for the output of expandCtnRange
export const CtnRangeOutputSchema = z.array(
  z.number().int().positive('CTN numbers must be positive integers')
);

// Schema for BaseItem
export const BaseItemSchema = z.object({
  description: z.string().min(1, 'Description cannot be empty'),
  model: z.string().min(1, 'Model cannot be empty'),
});

// Schema for ProcessedItem
export const ProcessedItemSchema = z.object({
  description: z.string(),
  model: z.string(),
  coo: z.string().optional(),
  ctn: z.number().int().positive(),
  qty: z.number().int().positive(),
  totalQty: z.number().int().positive(),
  pal: z.number().int().positive().optional(),
});

export const ProcessedItemArraySchema = z.array(ProcessedItemSchema);
