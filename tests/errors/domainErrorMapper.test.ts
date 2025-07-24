import { ZodError } from 'zod';
import { mapDomainError } from '../../src/errors/domainErrorMapper';
import { DomainAlreadyExistsError } from '../../src/errors/customErrors';

describe('mapDomainError', () => {
  it('should return ZodError if the error is an instance of ZodError', () => {
    const zodError = new ZodError([]);
    const result = mapDomainError(zodError);
    expect(result).toBeInstanceOf(ZodError);
    expect(result).toBe(zodError);
  });

  it('should return DomainAlreadyExistsError if the error is a Prisma P2002 code', () => {
    const prismaError = { code: 'P2002', meta: { target: ['name'] } };
    const result = mapDomainError(prismaError);
    expect(result).toBeInstanceOf(DomainAlreadyExistsError);
    expect(result.message).toBe('Domain with this name already exists.');
  });

  it('should return the original Error if it is an instance of Error', () => {
    const genericError = new Error('Something went wrong');
    const result = mapDomainError(genericError);
    expect(result).toBeInstanceOf(Error);
    expect(result).toBe(genericError);
  });

  it('should return a new Error for unknown non-Error objects', () => {
    const unknownError = { some: 'property' };
    const result = mapDomainError(unknownError);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('An unknown error occurred');
  });

  it('should return a new Error for null or undefined', () => {
    const resultNull = mapDomainError(null);
    expect(resultNull).toBeInstanceOf(Error);
    expect(resultNull.message).toBe('An unknown error occurred');

    const resultUndefined = mapDomainError(undefined);
    expect(resultUndefined).toBeInstanceOf(Error);
    expect(resultUndefined.message).toBe('An unknown error occurred');
  });

  it('should return a new Error for Prisma P2025 code (not found) as it is not an instance of Error', () => {
    const prismaNotFoundError = {
      code: 'P2025',
      meta: { cause: 'Record not found' },
    };
    const result = mapDomainError(prismaNotFoundError);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('An unknown error occurred');
  });
});
