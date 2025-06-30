import { Request } from 'express';

export const handlePackingList = (req: Request) => {
  console.log('Packing list request received:', req.body);
};
