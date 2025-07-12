import { z } from 'zod';

// Schema for the input of expandCtnRange
export const CtnRangeInputSchema = z
  .string()
  .min(1, 'CTN value cannot be empty')
  .trim()
  .refine(
    val => /^[\d\s\->→–to]+$/.test(val),
    'Invalid CTN format - only numbers, spaces, and separators (-,>,→,–,to) are allowed'
  );

// Schema for the output of expandCtnRange
export const CtnRangeOutputSchema = z.array(
  z.number().int().positive('CTN numbers must be positive integers')
);

// Schema for BaseItem
export const BaseItemSchema = z.object({
  description: z.string().min(1, 'Description cannot be empty'),
  model: z.string().min(1, 'Model cannot be empty'),
  origin: z.string().min(1, 'Origin cannot be empty'),
});

// Schema for row data
export const RowDataSchema = z.record(
  z.string(),
  z.union([z.string(), z.number()])
);

// Schema for ProcessedItem
export const ProcessedItemSchema = z.object({
  description: z.string(),
  model: z.string(),
  origin: z.string(),
  ctn: z.number().int().positive(),
  qty: z.number().int().positive(),
  totalQty: z.number().int().positive(),
  pal: z.number().int().positive().optional(),
});

export const ProcessedItemArraySchema = z.array(ProcessedItemSchema);
