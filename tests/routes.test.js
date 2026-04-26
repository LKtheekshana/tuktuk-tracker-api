import request from 'supertest';
import app from '../src/app.js';

describe('Protected Routes - Require Authentication', () => {
  const protectedGetRoutes = [
    '/api/provinces',
    '/api/districts',
    '/api/stations',
    '/api/vehicles',
    '/api/users',
  ];

  protectedGetRoutes.forEach((route) => {
    it(`GET ${route} returns 401 without a token`, async () => {
      const res = await request(app).get(route);
      expect(res.status).toBe(401);
    });
  });

  it('POST /api/vehicles returns 401 without a token', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .send({ registrationNumber: 'ABC-1234', driverName: 'Test Driver' });
    expect(res.status).toBe(401);
  });

  it('POST /api/provinces returns 401 without a token', async () => {
    const res = await request(app)
      .post('/api/provinces')
      .send({ name: 'Test Province', code: 'TP' });
    expect(res.status).toBe(401);
  });
});
