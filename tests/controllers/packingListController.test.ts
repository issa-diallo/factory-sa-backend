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
      'Qty Per Box': item.qty,
      'Total Qty': item.totalQty,
      Category: item.category,
      Description: item.description,
      COO: undefined,
      Pal: undefined,
      'Number of Ctns': '1',
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
        totalRows: expect.any(Number),
        processedRows: fixture.length,
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
});
