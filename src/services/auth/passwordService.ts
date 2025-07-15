import bcrypt from 'bcrypt';

import { IPasswordService } from './interfaces';

export class PasswordService implements IPasswordService {
  private SALT_ROUNDS: number;

  constructor(saltRounds: number = 10) {
    this.SALT_ROUNDS = saltRounds;
  }

  /**
   * Hashes a plain password
   */
  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.SALT_ROUNDS);
  }

  /**
   * Verifies if a plain password matches a hash
   */
  async verify(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
