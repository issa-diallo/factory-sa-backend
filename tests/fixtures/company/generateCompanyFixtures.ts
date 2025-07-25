import { faker } from '@faker-js/faker';

export function generateValidCompany(count: number = 1) {
  return Array.from({ length: count }, () => ({
    name: faker.company.name(),
    description: faker.lorem.sentence(),
    isActive: faker.datatype.boolean(),
  }));
}
