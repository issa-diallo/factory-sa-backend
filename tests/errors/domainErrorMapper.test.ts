import { ZodError } from 'zod';
import { mapDomainError } from '../../src/errors/domainErrorMapper';
import {
  DomainAlreadyExistsError,
  CompanyDomainAlreadyExistsError,
  DomainNotFoundError,
  CompanyDomainNotFoundError,
} from '../../src/errors/customErrors';

describe('mapDomainError', () => {
  // 1. ✅ Validation errors
  it('returns a structured error for ZodError', () => {
    const zodError = new ZodError([]);
    const result = mapDomainError(zodError);
    expect(result).toEqual({
      statusCode: 400,
      message: 'Invalid validation data',
      errors: zodError.issues,
    });
  });

  // 2. ✅ Prisma P2002 - Unique constraint violation
  describe('Prisma P2002 errors (unique constraint)', () => {
    it('returns a structured error for CompanyDomainAlreadyExistsError if target includes companyId and domainId', () => {
      const error = {
        code: 'P2002',
        meta: { target: ['companyId', 'domainId'] },
      };
      const result = mapDomainError(error);
      expect(result).toEqual({
        statusCode: 409,
        message: 'Company-domain relationship already exists.',
      });
    });

    it('returns a structured error for DomainAlreadyExistsError if target includes only name', () => {
      const error = { code: 'P2002', meta: { target: ['name'] } };
      const result = mapDomainError(error);
      expect(result).toEqual({
        statusCode: 409,
        message: 'Domain already exists.',
      });
    });

    it('returns a structured error for DomainAlreadyExistsError with partial or unknown targets', () => {
      const cases = [
        { code: 'P2002', meta: { target: ['companyId'] } },
        { code: 'P2002', meta: { target: ['domainId'] } },
        { code: 'P2002', meta: { target: [] } },
      ];
      for (const error of cases) {
        const result = mapDomainError(error);
        expect(result).toEqual({
          statusCode: 409,
          message: 'Domain already exists.',
        });
      }
    });
  });

  // 3. ✅ Prisma P2025 - Not found
  describe('Prisma P2025 errors (not found)', () => {
    it('returns a structured error for DomainNotFoundError if cause includes "Domain"', () => {
      const error = {
        code: 'P2025',
        meta: { cause: 'Expected a Domain' },
      };
      const result = mapDomainError(error);
      expect(result).toEqual({
        statusCode: 404,
        message: 'Domain not found.',
      });
    });

    it('returns a structured error for CompanyDomainNotFoundError if cause includes "CompanyDomain"', () => {
      const error = {
        code: 'P2025',
        meta: { cause: 'Expected a CompanyDomain' },
      };
      const result = mapDomainError(error);
      expect(result).toEqual({
        statusCode: 404,
        message: 'Company-domain relationship not found.',
      });
    });

    it('returns a structured error for generic Error if cause is unknown or irrelevant', () => {
      const cases = [
        { code: 'P2025', meta: { cause: 'Nothing to do here' } },
        { code: 'P2025', meta: {} },
        { code: 'P2025' },
      ];
      for (const error of cases) {
        const result = mapDomainError(error);
        expect(result).toEqual({
          statusCode: 404,
          message: 'Resource not found (P2025).',
        });
      }
    });
  });

  // 4. ✅ Known domain errors
  it('returns a structured error for DomainAlreadyExistsError if passed directly', () => {
    const error = new DomainAlreadyExistsError('Domain already exists');
    const result = mapDomainError(error);
    expect(result).toEqual({ statusCode: 409, message: error.message });
  });

  it('returns a structured error for CompanyDomainAlreadyExistsError if passed directly', () => {
    const error = new CompanyDomainAlreadyExistsError(
      'Company-domain already exists'
    );
    const result = mapDomainError(error);
    expect(result).toEqual({ statusCode: 409, message: error.message });
  });

  it('returns a structured error for DomainNotFoundError if passed directly', () => {
    const error = new DomainNotFoundError('Missing domain');
    const result = mapDomainError(error);
    expect(result).toEqual({ statusCode: 404, message: error.message });
  });

  it('returns a structured error for CompanyDomainNotFoundError if passed directly', () => {
    const error = new CompanyDomainNotFoundError('Missing company domain');
    const result = mapDomainError(error);
    expect(result).toEqual({ statusCode: 404, message: error.message });
  });

  // 5. ✅ Generic error and unknown cases
  it('returns a structured error for generic Error if input is already an Error instance', () => {
    const error = new Error('Generic error');
    const result = mapDomainError(error);
    expect(result).toEqual({ statusCode: 500, message: error.message });
  });

  it('returns a structured error for unknown non-error objects', () => {
    const result = mapDomainError({ some: 'value' });
    expect(result).toEqual({
      statusCode: 500,
      message: 'An unknown error occurred',
    });
  });

  it('returns a structured error for null and undefined', () => {
    const result1 = mapDomainError(null);
    const result2 = mapDomainError(undefined);
    expect(result1).toEqual({
      statusCode: 500,
      message: 'An unknown error occurred',
    });
    expect(result2).toEqual({
      statusCode: 500,
      message: 'An unknown error occurred',
    });
  });
});
