import bcrypt from 'bcrypt';
import { PasswordService } from '../../src/services/auth/passwordService';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('PasswordService', () => {
  let passwordService: PasswordService;
  const SALT_ROUNDS = 10;

  beforeEach(() => {
    passwordService = new PasswordService(SALT_ROUNDS);
    jest.clearAllMocks();
  });

  describe('hash', () => {
    it('should hash the plain password', async () => {
      const plainPassword = 'mysecretpassword';
      const hashedPassword = 'hashedpassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await passwordService.hash(plainPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, SALT_ROUNDS);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('verify', () => {
    it('should return true if the plain password matches the hashed password', async () => {
      const plainPassword = 'mysecretpassword';
      const hashedPassword = 'hashedpassword123';
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await passwordService.verify(
        plainPassword,
        hashedPassword
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        plainPassword,
        hashedPassword
      );
      expect(result).toBe(true);
    });

    it('should return false if the plain password does not match the hashed password', async () => {
      const plainPassword = 'wrongpassword';
      const hashedPassword = 'hashedpassword123';
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await passwordService.verify(
        plainPassword,
        hashedPassword
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        plainPassword,
        hashedPassword
      );
      expect(result).toBe(false);
    });
  });
});
