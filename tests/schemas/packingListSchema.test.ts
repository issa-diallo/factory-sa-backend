import { PackingListItem } from '../../src/types';
import {
  validatePackingListData,
  packingListSchema,
  formatValidationErrors,
} from '../../src/schemas/packingListSchema';

describe('PackingList Schema Validation', () => {
  const validData = [
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
      LINE: 4,
      'SKU MIN': 'hj27',
      MAKE: 'American Tourister',
      MODEL: 'Luggage',
      'DESCRIPTION MIN': '128186-1552, SPINNER 55/20 TSA, 88G*41001',
      'QTY REQ MATCH': 6,
      ORIGIN: 'Inde',
      CTN: '6 to 11',
      QTY: 1,
    },
  ];

  describe('validatePackingListData', () => {
    it('should validate correct data successfully', () => {
      const result = validatePackingListData(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        // Check fields individually as Zod adds QTY ALLOC: null
        expect(result.data[0].LINE).toBe(validData[0].LINE);
        expect(result.data[0]['SKU MIN']).toBe(validData[0]['SKU MIN']);
        expect(result.data[0].MAKE).toBe(validData[0].MAKE);
        expect(result.data[0].MODEL).toBe(validData[0].MODEL);
        expect(result.data[0]['DESCRIPTION MIN']).toBe(
          validData[0]['DESCRIPTION MIN']
        );
        expect(result.data[0]['QTY REQ MATCH']).toBe(
          validData[0]['QTY REQ MATCH']
        );
        expect(result.data[0].ORIGIN).toBe(validData[0].ORIGIN);
        expect(result.data[0].CTN).toBe(validData[0].CTN);
        expect(result.data[0].QTY).toBe(validData[0].QTY);
        // QTY ALLOC should match the input value when provided
        expect(result.data[0]['QTY ALLOC']).toBe(validData[0]['QTY ALLOC']);
      }
    });

    it('should handle data without optional PAL field', () => {
      const dataWithoutPAL = [
        {
          ...validData[0],
          PAL: undefined,
        },
      ];
      delete dataWithoutPAL[0].PAL;

      const result = validatePackingListData(dataWithoutPAL);

      expect(result.success).toBe(true);
    });

    it('should handle data without optional EAN field', () => {
      const dataWithoutEAN = [
        {
          ...validData[0],
          EAN: undefined,
        },
      ];
      delete dataWithoutEAN[0].EAN;

      const result = validatePackingListData(dataWithoutEAN);

      expect(result.success).toBe(true);
    });

    it('should handle data without optional ORIGIN field', () => {
      const dataWithoutOrigin = [
        {
          ...validData[0],
          ORIGIN: undefined,
        },
      ];
      delete dataWithoutOrigin[0].ORIGIN;

      const result = validatePackingListData(dataWithoutOrigin);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data[0].ORIGIN).toBeUndefined();
      }
    });

    it('should handle data without QTY ALLOC field in various ways', () => {
      // Test with undefined
      const dataWithUndefined = [
        {
          ...validData[0],
          'QTY ALLOC': undefined,
        },
      ];
      let result = validatePackingListData(dataWithUndefined);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data[0]['QTY ALLOC']).toBe(null);
      }

      // Test with null
      const dataWithNull = [
        {
          ...validData[0],
          'QTY ALLOC': null,
        },
      ];
      result = validatePackingListData(dataWithNull);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data[0]['QTY ALLOC']).toBe(null);
      }

      // Test with field completely absent
      const dataWithoutField = [{ ...validData[0] }] as PackingListItem[];
      delete dataWithoutField[0]['QTY ALLOC'];
      result = validatePackingListData(dataWithoutField);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data[0]['QTY ALLOC']).toBe(null);
      }
    });

    it('should handle data with dynamic fields (PAL_1, CTN_2, etc.)', () => {
      const dataWithDynamicFields = [
        {
          ...validData[0],
          PAL_1: 2,
          CTN_2: '12 to 15',
          QTY_3: 5,
          CUSTOM_FIELD: 'test',
        },
      ];

      const result = validatePackingListData(dataWithDynamicFields);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data[0].PAL_1).toBe(2);
        expect(result.data[0].CTN_2).toBe('12 to 15');
        expect(result.data[0].QTY_3).toBe(5);
        expect(result.data[0].CUSTOM_FIELD).toBe('test');
      }
    });

    it('should reject data with wrong types', () => {
      const invalidData = [
        {
          ...validData[0],
          LINE: '4', // Should be number, not string
        },
      ];

      const result = validatePackingListData(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
        expect(result.error.issues[0].path).toEqual([0, 'LINE']);
        expect(result.error.issues[0].code).toBe('invalid_type');
      }
    });

    it('should reject data with missing required fields', () => {
      const incompleteData = [
        {
          LINE: 4,
          'SKU MIN': 'hj27',
          // Missing other required fields
        },
      ];

      const result = validatePackingListData(incompleteData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should reject non-array data', () => {
      const nonArrayData = {
        LINE: 4,
        'SKU MIN': 'hj27',
      };

      const result = validatePackingListData(nonArrayData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type');
      }
    });
  });

  describe('packingListSchema direct usage', () => {
    it('should parse valid data correctly', () => {
      const result = packingListSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should throw on invalid data when using parse()', () => {
      expect(() => {
        packingListSchema.parse('invalid data');
      }).toThrow();
    });
  });

  describe('formatValidationErrors', () => {
    it('should format errors with line numbers and custom messages', () => {
      const invalidData = [
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
          CTN: true, // Invalid type - should be string or number
          QTY: 'invalid', // Should be number, not string
        },
      ];

      const result = validatePackingListData(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const formattedErrors = formatValidationErrors(
          result.error,
          invalidData
        );

        expect(formattedErrors).toHaveLength(2);

        // Test CTN error
        const ctnError = formattedErrors.find(e => e.field === 'CTN');
        expect(ctnError).toBeDefined();
        expect(ctnError?.line).toBe(4);
        expect(ctnError?.code).toBe('invalid_type');

        // Test QTY error
        const qtyError = formattedErrors.find(e => e.field === 'QTY');
        expect(qtyError).toBeDefined();
        expect(qtyError?.line).toBe(4);
        expect(qtyError?.code).toBe('invalid_type');
      }
    });

    it('should handle missing required fields with line numbers', () => {
      const incompleteData = [
        {
          LINE: 7,
          'SKU MIN': 'test',
          // Missing CTN and QTY
        },
      ];

      const result = validatePackingListData(incompleteData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const formattedErrors = formatValidationErrors(
          result.error,
          incompleteData
        );

        // Find CTN and QTY missing errors
        const ctnError = formattedErrors.find(e => e.field === 'CTN');
        const qtyError = formattedErrors.find(e => e.field === 'QTY');

        expect(ctnError).toBeDefined();
        expect(ctnError?.line).toBe(7);
        expect(ctnError?.code).toBe('invalid_type');

        expect(qtyError).toBeDefined();
        expect(qtyError?.line).toBe(7);
        expect(qtyError?.code).toBe('invalid_type');
      }
    });

    it('should handle data without LINE field using index fallback', () => {
      const dataWithoutLine = [
        {
          'SKU MIN': 'test',
          // Missing LINE field
        },
      ];

      const result = validatePackingListData(dataWithoutLine);

      expect(result.success).toBe(false);
      if (!result.success) {
        const formattedErrors = formatValidationErrors(
          result.error,
          dataWithoutLine
        );

        const lineError = formattedErrors.find(e => e.field === 'LINE');
        expect(lineError).toBeDefined();
        expect(lineError?.line).toBe('Index 0'); // Fallback when LINE is missing
        expect(lineError?.code).toBe('invalid_type');
      }
    });
  });
});
