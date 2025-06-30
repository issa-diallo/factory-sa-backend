/**
 * Fixtures for packing list tests
 * Reusable test data for different scenarios
 */

export const validPackingListData = [
  {
    LINE: 4,
    'SKU MIN': 'hj27',
    MAKE: 'American Tourister',
    MODEL: 'Luggage',
    'DESCRIPTION MIN': '128186-1552, SPINNER 55/20 TSA, 88G*41001',
    'QTY REQ MATCH': 6,
    'QTY ALLOC': 6,
    ORIGIN: 'Inde',
    EAN: 5400520017178,
    PAL: 1,
    CTN: '6 to 11',
    QTY: 1,
  },
  {
    LINE: 5,
    'SKU MIN': 'abc123',
    MAKE: 'Samsonite',
    MODEL: 'Backpack',
    'DESCRIPTION MIN': 'Travel backpack with multiple compartments',
    'QTY REQ MATCH': 10,
    'QTY ALLOC': 10,
    ORIGIN: 'Vietnam',
    EAN: 1234567890123,
    PAL: 2,
    CTN: '12-15',
    QTY: 2,
  },
  {
    LINE: 6,
    'SKU MIN': 'abc123',
    MAKE: 'Samsonite',
    MODEL: 'Backpack',
    'DESCRIPTION MIN': 'Travel backpack with multiple compartments',
    'QTY REQ MATCH': 10,
    'QTY ALLOC': 10,
    ORIGIN: 'Vietnam',
    EAN: 1234567890123,
    PAL_1: 3,
    CTN_1: '16-22',
    QTY_1: 3,
    PAL_2: 3,
    CTN_2: '22->30',
    QTY_2: 3,
    PAL_3: 2,
    CTN_3: '30-35',
    QTY_3: 4,
    PAL_4: 1,
    CTN_4: '35-40',
    QTY_4: 2,
    PAL_5: 4,
    CTN_5: '40-45',
    QTY_5: 5,
    PAL_6: 2,
    CTN_6: '45-50',
    QTY_6: 1,
  },
];

export const invalidPackingListData = {
  // Data with missing fields
  missingFields: [
    {
      LINE: 4,
      'SKU MIN': 'hj27',
      // Missing MAKE, MODEL, etc.
    },
  ],

  // Data with incorrect types
  wrongTypes: [
    {
      LINE: '4', // Should be number
      'SKU MIN': 'hj27',
      MAKE: 'American Tourister',
      MODEL: 'Luggage',
      'DESCRIPTION MIN': '128186-1552, SPINNER 55/20 TSA, 88G*41001',
      'QTY REQ MATCH': 6,
      'QTY ALLOC': 6,
      ORIGIN: 'Inde',
      EAN: 5400520017178,
      PAL: 1,
      CTN: 123, // Should be string
      QTY: 'invalid', // Should be number
    },
  ],

  // Empty array
  emptyArray: [],

  // Not an array
  notAnArray: {
    LINE: 4,
    'SKU MIN': 'hj27',
    MAKE: 'American Tourister',
  },

  // Data with null/undefined values
  nullValues: [
    {
      LINE: 4,
      'SKU MIN': null,
      MAKE: undefined,
      MODEL: 'Luggage',
      'DESCRIPTION MIN': '',
      'QTY REQ MATCH': 6,
      'QTY ALLOC': 6,
      ORIGIN: 'Inde',
      EAN: 5400520017178,
      PAL: 1,
      CTN: '6 to 11',
      QTY: 1,
    },
  ],
};

export const edgeCaseData = {
  // Data with optional fields
  withOptionalFields: [
    {
      LINE: 10,
      'SKU MIN': 'opt123',
      MAKE: 'TestMake',
      MODEL: 'TestModel',
      'DESCRIPTION MIN': 'Test description',
      'QTY REQ MATCH': 5,
      'QTY ALLOC': 5,
      ORIGIN: 'France',
      EAN: 9876543210987,
      // PAL is optional
      CTN: '1-3',
      QTY: 3,
    },
  ],

  // Data with dynamic fields
  withDynamicFields: [
    {
      LINE: 15,
      'SKU MIN': 'dyn456',
      MAKE: 'DynamicMake',
      MODEL: 'DynamicModel',
      'DESCRIPTION MIN': 'Dynamic description',
      'QTY REQ MATCH': 8,
      'QTY ALLOC': 8,
      ORIGIN: 'Chine',
      EAN: 1111222233334,
      PAL: 3,
      PAL_1: 2,
      CTN: '20-25',
      CTN_2: '30-35',
      QTY: 4,
      QTY_3: 6,
      CUSTOM_FIELD: 'test value',
    },
  ],

  // Larger dataset for performance testing
  largeDataset: Array.from({ length: 100 }, (_, index) => ({
    LINE: index + 1,
    'SKU MIN': `sku${index}`,
    MAKE: `Make${index}`,
    MODEL: `Model${index}`,
    'DESCRIPTION MIN': `Description for item ${index}`,
    'QTY REQ MATCH': index + 1,
    'QTY ALLOC': index + 1,
    ORIGIN: index % 2 === 0 ? 'Inde' : 'Chine',
    EAN: 1000000000000 + index,
    PAL: Math.floor(index / 10) + 1,
    CTN: `${index * 10}-${index * 10 + 5}`,
    QTY: (index % 5) + 1,
  })),

  // Data with special characters
  withSpecialCharacters: [
    {
      LINE: 20,
      'SKU MIN': 'spé-cial_123',
      MAKE: 'Marque avec espaces & caractères',
      MODEL: 'Modèle avec accents éàü',
      'DESCRIPTION MIN': 'Description avec "guillemets" et symboles @#$%',
      'QTY REQ MATCH': 3,
      'QTY ALLOC': 3,
      ORIGIN: "Côte d'Ivoire",
      EAN: 5555666677778,
      PAL: 1,
      CTN: '100→105',
      QTY: 2,
    },
  ],
};

// Data for testing specific service cases
export const serviceTestData = {
  // Data that should fail at the service level
  invalidForService: [
    {
      LINE: 1,
      'SKU MIN': 'test',
      MAKE: 'Test',
      MODEL: '', // Empty - should fail at service level
      'DESCRIPTION MIN': '',
      'QTY REQ MATCH': 1,
      'QTY ALLOC': 1,
      ORIGIN: '',
      EAN: 123,
      CTN: 'invalid-ctn-format',
      QTY: 0,
    },
  ],

  // Data valid for schema but problematic for service
  validSchemaInvalidService: [
    {
      LINE: 1,
      'SKU MIN': 'test',
      MAKE: 'Test',
      MODEL: 'TestModel',
      'DESCRIPTION MIN': 'Test Description',
      'QTY REQ MATCH': 1,
      'QTY ALLOC': 1,
      ORIGIN: 'Test Origin',
      EAN: 123456789,
      CTN: '999999999999999999999', // CTN too large
      QTY: 1,
    },
  ],
};
