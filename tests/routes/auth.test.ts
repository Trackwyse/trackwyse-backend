import { faker } from '@faker-js/faker';
import supertest from 'supertest';
import app from '../../dist/app';

let accessToken: string;
let refreshToken: string;
let request: supertest.SuperAgentTest;

beforeAll(async () => {
  request = supertest.agent(app);
});

describe('Authentication routes', () => {
  describe('POST /auth/v1/register', () => {
    it('should error if no email is provided', async () => {
      const response = await request.post('/auth/v1/register').send({
        password: 'password',
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: true,
        message: 'Missing required fields',
      });
    });

    it('should error if no password is provided', async () => {
      const response = await request.post('/auth/v1/register').send({
        email: faker.internet.email(),
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: true,
        message: 'Missing required fields',
      });
    });

    it('should error if an invalid email is provided', async () => {
      const response = await request.post('/auth/v1/register').send({
        email: 'invalidEmail',
        password: 'password',
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: true,
        message: 'Missing required fields',
      });
    });
  });
});
