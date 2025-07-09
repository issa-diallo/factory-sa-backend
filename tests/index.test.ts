import request from 'supertest';
import app from '../src/index';

describe('Express Application', () => {
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

    expect(res.statusCode).toEqual(401);
  });
});
