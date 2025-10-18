import { Request, Response } from 'express';
import { PackingListController } from '../../src/controllers/packingListController';
import { IPackingListService } from '../../src/services/packingList/interfaces';
import { createSuccess, createError } from '../../src/types/result';
import { generateValidPackingList } from '../fixtures/packingList/generatePackingListFixtures';
import { ProcessingResult } from '../../src/types';

describe('PackingListController', () => {
  let controller: PackingListController;
  let mockService: jest.Mocked<IPackingListService>;
  let res: Partial<Response>;

  beforeEach(() => {
    mockService = {
      processData: jest.fn(),
    };

    controller = new PackingListController(mockService);

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should return 200 with processed data when input is valid', async () => {
    const fixture = generateValidPackingList(2);

    const internalProcessed = fixture.map(item => ({
      ctns: Number(item.CTN),
      qty: item.QTY,
      totalQty: item.QTY,
      category: item.MODEL,
      description: item['DESCRIPTION MIN'],
    }));

    const apiResponseProcessed = internalProcessed.map(item => ({
      Ctns: item.ctns,
      Category: item.category,
      Description: item.description,
      'Qty Per Box': item.qty,
      'Number of Ctns': '1',
      'Total Qty': item.totalQty,
      COO: undefined,
      Pal: undefined,
    }));

    const req: Partial<Request> = { body: fixture };

    const result: ProcessingResult = {
      data: internalProcessed,
      summary: {
        processedRows: fixture.length,
        totalPcs: fixture.reduce((acc, item) => acc + item.QTY, 0),
      },
    };

    mockService.processData.mockResolvedValue(createSuccess(result));

    await controller.handlePackingList(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: apiResponseProcessed,
      summary: {
        boxes: {
          total: 1,
          highest: 42,
        },
        pallets: {
          total: 0,
          highest: null,
        },
        totalPcs: fixture.reduce((acc, item) => acc + item.QTY, 0),
      },
    });
  });

  it('should return 400 with validation errors when input is invalid', async () => {
    const req: Partial<Request> = {
      body: [{ invalid: 'data' }],
    };

    await controller.handlePackingList(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Validation error',
        errors: expect.any(Array),
        summary: expect.any(Object),
      })
    );
  });

  it('should return 400 if service fails', async () => {
    const fixture = generateValidPackingList(1);
    const req: Partial<Request> = { body: fixture };

    mockService.processData.mockResolvedValue(
      createError('Process failed', 'PROCESSING_FAILED')
    );

    await controller.handlePackingList(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Process failed',
      code: 'PROCESSING_FAILED',
    });
  });

  it('should return 500 if unexpected error occurs', async () => {
    const fixture = generateValidPackingList(1);
    const req: Partial<Request> = { body: fixture };

    mockService.processData.mockRejectedValue(new Error('Unexpected crash'));

    await controller.handlePackingList(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unexpected crash',
    });
  });

  it('should return 500 with "Unknown error" if thrown error is not instance of Error', async () => {
    const fixture = generateValidPackingList(1);
    const req: Partial<Request> = { body: fixture };

    mockService.processData.mockRejectedValue('Unexpected string error');

    await controller.handlePackingList(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Internal server error',
    });
  });

  it('should return properties in the correct order: Pal (if exists), Ctns, Category, Description, Qty Per Box, Number of Ctns, Total Qty, COO', async () => {
    const fixture = generateValidPackingList(1);
    const req: Partial<Request> = { body: fixture };

    const internalProcessed = fixture.map(item => ({
      ctns: Number(item.CTN),
      qty: item.QTY,
      totalQty: item.QTY,
      category: item.MODEL,
      description: item['DESCRIPTION MIN'],
      coo: 'FR',
      pal: 123,
    }));

    const result: ProcessingResult = {
      data: internalProcessed,
      summary: {
        processedRows: fixture.length,
        totalPcs: fixture.reduce((acc, item) => acc + item.QTY, 0),
      },
    };

    mockService.processData.mockResolvedValue(createSuccess(result));

    await controller.handlePackingList(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);

    // Verify the exact order of properties
    const responseData = (res.json as jest.Mock).mock.calls[0][0].data[0];
    const propertyKeys = Object.keys(responseData);

    expect(propertyKeys).toEqual([
      'Pal',
      'Ctns',
      'Category',
      'Description',
      'Qty Per Box',
      'Number of Ctns',
      'Total Qty',
      'COO',
    ]);
  });
});
