import { faker } from '@faker-js/faker';
import { PackingListData } from '../../../src/schemas/packingListSchema';

export function generateValidPackingList(count: number = 2): PackingListData {
  return Array.from({ length: count }, (_, i) => {
    const dynamicFields: Record<string, string | number> = {};
    const dynamicCount = faker.number.int({ min: 1, max: 3 });

    for (let j = 0; j < dynamicCount; j++) {
      dynamicFields[`CTN_${j}`] = faker.number.int({ min: 1, max: 5 });
      dynamicFields[`QTY_${j}`] = faker.number.int({ min: 1, max: 50 });
    }

    return {
      LINE: i + 1,
      'SKU MIN': faker.string.alphanumeric(6),
      MAKE: faker.company.name(),
      MODEL: `Model-${faker.string.alpha(3)}`,
      'DESCRIPTION MIN': faker.commerce.productName(),
      'QTY REQ MATCH': faker.number.int({ min: 1, max: 100 }),
      'QTY ALLOC': faker.number.int({ min: 1, max: 100 }),
      ORIGIN: faker.location.country(),
      EAN: faker.number.int({ min: 1000000000000, max: 9999999999999 }),
      PAL: faker.number.int({ min: 1, max: 2 }),
      CTN: faker.number.int({ min: 1, max: 10 }),
      QTY: faker.number.int({ min: 1, max: 100 }),
      ...dynamicFields,
    };
  });
}
