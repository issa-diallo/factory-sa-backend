/**
 * Normalize an email by removing accents, trimming spaces, and lowercasing.
 * Ex: "Élise.Dupont@Email.FR " → "elise.dupont@email.fr"
 */
export function normalizeEmail(email: string): string {
  return email
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}
