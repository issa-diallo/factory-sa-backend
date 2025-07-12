import bcrypt from 'bcrypt';

import { IPasswordService } from './interfaces';

export class PasswordService implements IPasswordService {
  private SALT_ROUNDS: number;

  constructor(saltRounds: number = 10) {
    this.SALT_ROUNDS = saltRounds;
  }

  /**
   * Hache un mot de passe en clair
   */
  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.SALT_ROUNDS);
  }

  /**
   * Vérifie si un mot de passe en clair correspond à un hachage
   */
  async verify(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
