import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import './src/container';

// Complete mock for @faker-js/faker v10 (ES modules)
jest.mock('@faker-js/faker', () => ({
  faker: {
    company: {
      name: () => 'Test Company',
    },
    person: {
      fullName: () => 'John Doe',
      firstName: () => 'John',
      lastName: () => 'Doe',
      email: () => 'john.doe@example.com',
    },
    location: {
      city: () => 'Paris',
      country: () => 'France',
    },
    internet: {
      domainName: () => 'example.com',
      userName: () => 'johndoe',
      email: () => 'john.doe@example.com',
    },
    commerce: {
      productName: () => 'Test Product',
      productDescription: () => 'Test Product Description',
    },
    string: {
      alpha: () => 'abc',
      numeric: () => '123',
      alphanumeric: (length = 6) => 'abc123'.slice(0, length),
      uuid: () => '123e4567-e89b-12d3-a456-426614174000',
    },
    number: {
      int: (options: { min?: number; max?: number } = {}) =>
        options.min || options.max ? 42 : 42,
    },
    date: {
      past: () => new Date('2023-01-01'),
      future: () => new Date('2025-01-01'),
      recent: () => new Date('2024-01-01'),
    },
    lorem: {
      sentence: () => 'This is a test sentence.',
      words: () => ['test', 'words'],
    },
    datatype: {
      boolean: () => true,
      number: (options: { min?: number; max?: number } = {}) =>
        options.min || options.max ? 42 : 42,
    },
    helpers: {
      arrayElement: <T>(array: T[]) => array[0],
    },
  },
}));
