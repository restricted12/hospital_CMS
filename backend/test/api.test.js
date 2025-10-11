const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Hospital CMS API', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_cms_test');
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  describe('Health Check', () => {
    test('GET /health should return server status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Server is running');
    });
  });

  describe('API Documentation', () => {
    test('GET /api should return API information', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Hospital CMS API');
      expect(response.body.endpoints).toBeDefined();
    });
  });

  describe('Authentication', () => {
    test('POST /api/auth/login with invalid credentials should return 401', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@email.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    test('POST /api/auth/login with missing fields should return 400', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@email.com'
          // missing password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('Protected Routes', () => {
    test('GET /api/users without token should return 401', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Not authorized to access this route');
    });

    test('GET /api/patients without token should return 401', async () => {
      const response = await request(app)
        .get('/api/patients')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Not authorized to access this route');
    });
  });

  describe('404 Handling', () => {
    test('GET /api/nonexistent should return 404', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Route not found');
    });
  });
});
