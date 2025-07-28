import { isPrismaError } from '../../src/utils/isPrismaError';

describe('isPrismaError', () => {
  it('should return true for PrismaClientKnownRequestError with matching code', () => {
    const error = {
      code: 'P2002',
      name: 'PrismaClientKnownRequestError',
    };

    expect(isPrismaError(error, 'P2002')).toBe(true);
  });

  it('should return false for error with wrong code', () => {
    const error = {
      code: 'P2025',
      name: 'PrismaClientKnownRequestError',
    };

    expect(isPrismaError(error, 'P2002')).toBe(false);
  });

  it('should return false for error with missing code or name', () => {
    const error = {
      message: 'Some error',
    };

    expect(isPrismaError(error, 'P2002')).toBe(false);
  });

  it('should return false for non-object values', () => {
    expect(isPrismaError(null, 'P2002')).toBe(false);
    expect(isPrismaError('error', 'P2002')).toBe(false);
    expect(isPrismaError(42, 'P2002')).toBe(false);
  });
});
