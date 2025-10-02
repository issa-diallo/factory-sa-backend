export interface PackingListItem {
  LINE: number;
  'SKU MIN': string;
  MAKE: string;
  MODEL: string;
  'DESCRIPTION MIN': string;
  'QTY REQ MATCH': number;
  'QTY ALLOC'?: number | null;
  ORIGIN: string;
  EAN?: number;
  PAL?: number;
  CTN: string | number;
  QTY: number;
  [key: string]: string | number | undefined | null;
}

export interface ProcessedItem {
  description: string;
  category: string;
  coo?: string;
  ctns: number;
  qty: number;
  totalQty: number;
  pal?: number;
}

export interface ProcessingSummary {
  processedRows: number;
  totalPcs: number;
}

export interface ProcessingResult {
  data: ProcessedItem[];
  summary: ProcessingSummary;
}

export * from './result';
