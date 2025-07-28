import { Response } from 'express';
import { ZodError } from 'zod';
import { handleError } from '../../src/utils/handleError';
import {
  DomainAlreadyExistsError,
  CompanyAlreadyExistsError,
  CompanyDomainAlreadyExistsError,
  CompanyDomainNotFoundError,
} from '../../src/errors/customErrors';

describe('handleError', () => {
  let mockResponse: Response;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;
  });

  it('devrait gérer une ZodError et retourner un statut 400', () => {
    const mockZodError = new ZodError([
      {
        code: 'invalid_type',
        expected: 'string',
        path: ['name'],
        message: 'Expected string, received number',
        input: 123,
      },
    ]);

    handleError(mockResponse, mockZodError);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid validation data',
      errors: mockZodError.issues,
    });
  });

  it('devrait gérer une erreur Prisma P2002 et retourner un statut 409', () => {
    const prismaError = { code: 'P2002', meta: { target: ['name'] } };

    handleError(mockResponse, prismaError);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Resource already exists.',
    });
  });

  it('devrait gérer une DomainAlreadyExistsError et retourner un statut 409', () => {
    const customError = new DomainAlreadyExistsError('Domain already exists.');

    handleError(mockResponse, customError);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Domain already exists.',
    });
  });

  it('devrait gérer une CompanyAlreadyExistsError et retourner un statut 409', () => {
    const customError = new CompanyAlreadyExistsError(
      'Company already exists.'
    );

    handleError(mockResponse, customError);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Company already exists.',
    });
  });

  it('devrait gérer une CompanyDomainAlreadyExistsError et retourner un statut 409', () => {
    const customError = new CompanyDomainAlreadyExistsError(
      'Company domain already exists.'
    );

    handleError(mockResponse, customError);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Company domain already exists.',
    });
  });

  it('devrait gérer une CompanyDomainNotFoundError et retourner un statut 404', () => {
    const customError = new CompanyDomainNotFoundError(
      'Company domain not found.'
    );

    handleError(mockResponse, customError);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Company domain not found.',
    });
  });

  it('devrait gérer une erreur générique (instance de Error) et retourner un statut 500', () => {
    const genericError = new Error('Something went wrong.');

    handleError(mockResponse, genericError);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Something went wrong.',
    });
  });

  it('devrait gérer une erreur inconnue (non-Error) et retourner un statut 500 avec un message générique', () => {
    const unknownError = 'This is not an error object'; // Simuler une erreur qui n'est pas une instance de Error

    handleError(mockResponse, unknownError);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'An unknown error occurred',
    });
  });
});
