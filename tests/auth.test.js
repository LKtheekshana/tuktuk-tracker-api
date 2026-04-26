import request from 'supertest';
import app from '../src/app.js';

describe('POST /api/auth/login - Input Validation', () => {
  it('returns 422 when request body is empty', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('returns 422 and flags missing password field', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser' });
    expect(res.status).toBe(422);
    expect(res.body.errors.some((e) => e.field === 'password')).toBe(true);
  });

  it('returns 422 and flags missing username field', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'testpassword' });
    expect(res.status).toBe(422);
    expect(res.body.errors.some((e) => e.field === 'username')).toBe(true);
  });
});

describe('GET /api/auth/me - JWT Protection', () => {
  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 when Authorization header uses wrong scheme', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Basic dXNlcjpwYXNz');
    expect(res.status).toBe(401);
  });

  it('returns 401 when a malformed Bearer token is provided', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer this.is.definitely.not.a.valid.jwt.token');
    expect(res.status).toBe(401);
  });
});
