import { faker } from '@faker-js/faker';
// Importez le type Domain si nécessaire, par exemple:
// import { Domain } from '../../../src/generated/prisma'; // ou depuis src/types/domain.ts

export function generateValidDomain(count: number = 1) {
  return Array.from({ length: count }, () => ({
    name: faker.internet.domainName(),
    isActive: faker.datatype.boolean(),
  }));
}
