import { inject, injectable } from 'tsyringe';
import bcrypt from 'bcrypt';
import { IPasswordService } from './interfaces';

@injectable()
export class PasswordService implements IPasswordService {
  private readonly bcryptLib = bcrypt;

  constructor(@inject('SALT_ROUNDS') private readonly SALT_ROUNDS: number) {}

  /**
   * Hashes a plain password
   */
  async hash(plainPassword: string): Promise<string> {
    return this.bcryptLib.hash(plainPassword, this.SALT_ROUNDS);
  }

  /**
   * Verifies if a plain password matches a hash
   */
  async verify(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return this.bcryptLib.compare(plainPassword, hashedPassword);
  }
}
