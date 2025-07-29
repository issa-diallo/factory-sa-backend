import { ZodError } from 'zod';
import { mapCompanyError } from '../../src/errors/companyErrorMapper';
import { CompanyAlreadyExistsError } from '../../src/errors/customErrors';

describe('mapCompanyError', () => {
  it('should return a structured error for ZodError', () => {
    const zodError = new ZodError([]);
    const result = mapCompanyError(zodError);
    expect(result).toEqual({
      statusCode: 400,
      message: 'Invalid validation data',
      errors: zodError.issues,
    });
  });

  it('should return a structured error for Prisma P2002 unique constraint error', () => {
    const prismaError = {
      code: 'P2002',
      meta: { target: ['name'] },
    };
    const result = mapCompanyError(prismaError);
    expect(result).toEqual({
      statusCode: 409,
      message: 'Resource already exists.',
    });
  });

  it('should return a structured error for CompanyAlreadyExistsError', () => {
    const companyExistsError = new CompanyAlreadyExistsError();
    const result = mapCompanyError(companyExistsError);
    expect(result).toEqual({
      statusCode: 409,
      message: companyExistsError.message,
    });
  });

  it('should return a structured error for a generic Error instance', () => {
    const genericError = new Error('Something went wrong');
    const result = mapCompanyError(genericError);
    expect(result).toEqual({
      statusCode: 500,
      message: genericError.message,
    });
  });

  it('should return a structured error for unknown object errors', () => {
    const unknownObjectError = { someProp: 'someValue' };
    const result = mapCompanyError(unknownObjectError);
    expect(result).toEqual({
      statusCode: 500,
      message: 'An unknown error occurred',
    });
  });

  it('should return a structured error for primitive type errors', () => {
    const stringError = 'This is an error string';
    const result = mapCompanyError(stringError);
    expect(result).toEqual({
      statusCode: 500,
      message: 'An unknown error occurred',
    });
  });

  it('should return a structured error for null or undefined errors', () => {
    const nullError = null;
    const undefinedError = undefined;

    let result = mapCompanyError(nullError);
    expect(result).toEqual({
      statusCode: 500,
      message: 'An unknown error occurred',
    });

    result = mapCompanyError(undefinedError);
    expect(result).toEqual({
      statusCode: 500,
      message: 'An unknown error occurred',
    });
  });
});
