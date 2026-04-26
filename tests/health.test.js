import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../src/app.js';

describe('Health & 404', () => {
  it('GET /health returns 200 with status OK and timestamp', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /api/unknown-route returns 404', async () => {
    const res = await request(app).get('/api/this-route-does-not-exist');
    expect(res.status).toBe(404);
  });

  it('GET /unknown-top-level returns 404', async () => {
    const res = await request(app).get('/xyz-not-a-route');
    expect(res.status).toBe(404);
  });

  it('GET /health returns 304 when If-None-Match matches current ETag', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const first = await request(app).get('/health');
    expect(first.status).toBe(200);
    expect(first.headers.etag).toBeDefined();

    const second = await request(app)
      .get('/health')
      .set('If-None-Match', first.headers.etag);

    expect(second.status).toBe(304);
    expect(second.text).toBe('');

    jest.useRealTimers();
  });
});
