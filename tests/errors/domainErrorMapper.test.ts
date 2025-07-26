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
  it('returns ZodError directly', () => {
    const zodError = new ZodError([]);
    const result = mapDomainError(zodError);
    expect(result).toBe(zodError);
  });

  // 2. ✅ Prisma P2002 - Unique constraint violation
  describe('Prisma P2002 errors (unique constraint)', () => {
    it('returns CompanyDomainAlreadyExistsError if target includes companyId and domainId', () => {
      const error = {
        code: 'P2002',
        meta: { target: ['companyId', 'domainId'] },
      };
      const result = mapDomainError(error);
      expect(result).toBeInstanceOf(CompanyDomainAlreadyExistsError);
      expect(result.message).toBe(
        'Company-domain relationship already exists.'
      );
    });

    it('returns DomainAlreadyExistsError if target includes only name', () => {
      const error = { code: 'P2002', meta: { target: ['name'] } };
      const result = mapDomainError(error);
      expect(result).toBeInstanceOf(DomainAlreadyExistsError);
    });

    it('returns DomainAlreadyExistsError with partial or unknown targets', () => {
      const cases = [
        { code: 'P2002', meta: { target: ['companyId'] } },
        { code: 'P2002', meta: { target: ['domainId'] } },
        { code: 'P2002', meta: { target: [] } },
      ];
      for (const error of cases) {
        const result = mapDomainError(error);
        expect(result).toBeInstanceOf(DomainAlreadyExistsError);
      }
    });
  });

  // 3. ✅ Prisma P2025 - Not found
  describe('Prisma P2025 errors (not found)', () => {
    it('returns DomainNotFoundError if cause includes "Domain"', () => {
      const error = {
        code: 'P2025',
        meta: { cause: 'Expected a Domain' },
      };
      const result = mapDomainError(error);
      expect(result).toBeInstanceOf(DomainNotFoundError);
      expect(result.message).toBe('Domain not found.');
    });

    it('returns CompanyDomainNotFoundError if cause includes "CompanyDomain"', () => {
      const error = {
        code: 'P2025',
        meta: { cause: 'Expected a CompanyDomain' },
      };
      const result = mapDomainError(error);
      expect(result).toBeInstanceOf(CompanyDomainNotFoundError);
      expect(result.message).toBe('Company-domain relationship not found.');
    });

    it('returns generic Error if cause is unknown or irrelevant', () => {
      const cases = [
        { code: 'P2025', meta: { cause: 'Nothing to do here' } },
        { code: 'P2025', meta: {} },
        { code: 'P2025' },
      ];
      for (const error of cases) {
        const result = mapDomainError(error);
        expect(result).toBeInstanceOf(Error);
        expect(result.message).toBe('Resource not found (P2025).');
      }
    });
  });

  // 4. ✅ Known domain errors
  it('returns DomainNotFoundError if passed directly', () => {
    const error = new DomainNotFoundError('Missing domain');
    const result = mapDomainError(error);
    expect(result).toBe(error);
  });

  it('returns CompanyDomainNotFoundError if passed directly', () => {
    const error = new CompanyDomainNotFoundError('Missing company domain');
    const result = mapDomainError(error);
    expect(result).toBe(error);
  });

  // 5. ✅ Generic error and unknown cases
  it('returns generic Error if input is already an Error instance', () => {
    const error = new Error('Generic error');
    const result = mapDomainError(error);
    expect(result).toBe(error);
  });

  it('returns unknown Error for non-error objects', () => {
    const result = mapDomainError({ some: 'value' });
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('An unknown error occurred');
  });

  it('returns unknown Error for null and undefined', () => {
    const result1 = mapDomainError(null);
    const result2 = mapDomainError(undefined);
    expect(result1.message).toBe('An unknown error occurred');
    expect(result2.message).toBe('An unknown error occurred');
  });
});
