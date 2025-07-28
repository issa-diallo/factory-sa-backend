import 'reflect-metadata';
import { PasswordService } from '../../src/services/auth/passwordService';

let mockedBcrypt: {
  hash: jest.Mock<Promise<string>, [string, number]>;
  compare: jest.Mock<Promise<boolean>, [string, string]>;
};

// ✅ Déclare et injecte les mocks dans le scope du mock
jest.mock('bcrypt', () => {
  const hash = jest.fn<Promise<string>, [string, number]>();
  const compare = jest.fn<Promise<boolean>, [string, string]>();

  mockedBcrypt = { hash, compare };

  return {
    __esModule: true,
    hash,
    compare,
    default: { hash, compare },
  };
});

import bcrypt from 'bcrypt'; // ⚠️ après le mock

class TestablePasswordService extends PasswordService {
  constructor(salt: number) {
    super(salt);
    // @ts-expect-error: override private field for test
    this.bcryptLib = bcrypt;
  }
}

describe('PasswordService', () => {
  const SALT_ROUNDS = 10;
  let service: PasswordService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TestablePasswordService(SALT_ROUNDS);
  });

  describe('hash', () => {
    it('should hash a password', async () => {
      mockedBcrypt.hash.mockResolvedValue('hashed123');
      const result = await service.hash('secret');

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('secret', SALT_ROUNDS);
      expect(result).toBe('hashed123');
    });
  });

  describe('verify', () => {
    it('should return true when passwords match', async () => {
      mockedBcrypt.compare.mockResolvedValue(true);
      const result = await service.verify('secret', 'hashed123');

      expect(mockedBcrypt.compare).toHaveBeenCalledWith('secret', 'hashed123');
      expect(result).toBe(true);
    });

    it('should return false when passwords do not match', async () => {
      mockedBcrypt.compare.mockResolvedValue(false);
      const result = await service.verify('wrong', 'hashed123');

      expect(mockedBcrypt.compare).toHaveBeenCalledWith('wrong', 'hashed123');
      expect(result).toBe(false);
    });
  });
});
