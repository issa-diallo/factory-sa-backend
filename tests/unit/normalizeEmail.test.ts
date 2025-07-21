import { normalizeEmail } from '../../src/utils/normalizeEmail';

describe('normalizeEmail', () => {
  it('should trim, lowercase, and remove accents from email', () => {
    expect(normalizeEmail(' Élise.Dupont@Email.FR ')).toBe(
      'elise.dupont@email.fr'
    );
    expect(normalizeEmail(' ÇAmille@Gmail.Com ')).toBe('camille@gmail.com');
    expect(normalizeEmail('jOão.silva@Exemplo.BR')).toBe(
      'joao.silva@exemplo.br'
    );
    expect(normalizeEmail('  jean.dupé@YAHOO.fr  ')).toBe('jean.dupe@yahoo.fr');
  });

  it('should return the same result if email is already normalized', () => {
    expect(normalizeEmail('test@example.com')).toBe('test@example.com');
  });

  it('should handle empty string', () => {
    expect(normalizeEmail('')).toBe('');
  });
});
