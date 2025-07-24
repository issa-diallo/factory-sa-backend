import { ZodError } from 'zod';
import { mapCompanyError } from '../../src/errors/companyErrorMapper';
import { CompanyAlreadyExistsError } from '../../src/errors/customErrors';

describe('mapCompanyError', () => {
  it('should return ZodError if the error is an instance of ZodError', () => {
    const zodError = new ZodError([]);
    const result = mapCompanyError(zodError);
    expect(result).toBeInstanceOf(ZodError);
  });

  it('should return CompanyAlreadyExistsError if the error is a Prisma P2002 unique constraint error', () => {
    const prismaError = {
      code: 'P2002',
      meta: { target: ['name'] },
    };
    const result = mapCompanyError(prismaError);
    expect(result).toBeInstanceOf(CompanyAlreadyExistsError);
  });

  it('should return the original Error instance if it is not a ZodError or Prisma P2002', () => {
    const genericError = new Error('Something went wrong');
    const result = mapCompanyError(genericError);
    expect(result).toBe(genericError);
  });

  it('should return an "An unknown error occurred" Error for unknown object errors', () => {
    const unknownObjectError = { someProp: 'someValue' };
    const result = mapCompanyError(unknownObjectError);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('An unknown error occurred');
  });

  it('should return an "An unknown error occurred" Error for primitive type errors', () => {
    const stringError = 'This is an error string';
    const result = mapCompanyError(stringError);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('An unknown error occurred');
  });

  it('should return an "An unknown error occurred" Error for null or undefined errors', () => {
    const nullError = null;
    const undefinedError = undefined;

    let result = mapCompanyError(nullError);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('An unknown error occurred');

    result = mapCompanyError(undefinedError);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('An unknown error occurred');
  });
});
