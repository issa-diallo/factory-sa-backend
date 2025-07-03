import request from 'supertest';
import { appPromise } from '../src/index';
import { Application } from 'express';

// Import mocks
import './mocks/prismaMock';
import './mocks/adminJsMock';

// Set NODE_ENV as 'test' to use mocks
process.env.NODE_ENV = 'test';

describe('Express Application', () => {
  let app: Application;

  beforeAll(async () => {
    // Wait for the application to be initialized
    app = await appPromise;
  });

  it('should respond to a GET request on /', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ message: 'Factory Backend API' });
  });

  it('should respond to a POST request on /api/v1/packing-list with a valid body', async () => {
    const validPayload = {
      data: 'some data',
    };
    const res = await request(app)
      .post('/api/v1/packing-list')
      .send(validPayload);

    expect(res.statusCode).toEqual(400);
  });
});
