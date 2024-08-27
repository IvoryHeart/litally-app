import request from 'supertest';
import app from '../app';
import connectDB from '../config/database';
import logger from '../shared/utils/logger';

jest.mock('../config/database');
jest.mock('../shared/utils/logger');

describe('App Configuration', () => {
  beforeAll(() => {
    (connectDB as jest.Mock).mockResolvedValue(undefined);
  });

  it('should have JSON parsing middleware', async () => {
    const response = await request(app)
      .post('/api/test')
      .send({ test: 'data' })
      .set('Accept', 'application/json');
    
    expect(response.status).not.toBe(400); // 400 would indicate failure to parse JSON
  });

  it('should have CORS enabled', async () => {
    const response = await request(app)
      .options('/api/test')
      .set('Origin', 'http://example.com');
    
    expect(response.headers['access-control-allow-origin']).toBe('*');
  });

  it('should serve Swagger UI', async () => {
    const response = await request(app).get('/api-docs');
    expect(response.status).toBe(301); // Redirect to /api-docs/
  });

  it('should serve Swagger JSON', async () => {
    const response = await request(app).get('/swagger.json');
    expect(response.status).toBe(200);
    expect(response.type).toBe('application/json');
  });

  it('should log routes on startup', () => {
    expect(logger.info).toHaveBeenCalled();
  });
});