import { faker } from '@faker-js/faker';
import supertest from 'supertest';
import app from '../../dist/app';
import { User } from '../../dist/models/user.model';
import config from '../config';

let accessToken: string;
let refreshToken: string;
let request: supertest.SuperAgentTest;

beforeAll(async () => {
  request = supertest.agent(app);
});

describe('Authentication routes', () => {
  describe('POST /auth/v1/register', () => {
    // should error if email, password, firstName, or lastName is not provided
    it('should error if email, password, firstName, or lastName is not provided', async () => {
      const response = await request.post('/auth/v1/register').send();

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
      expect(response.body).toMatchObject({
        error: true,
      });
    });

    it('should error if first or last name has symbols in it', async () => {
      const response = await request.post('/auth/v1/register').send({
        email: faker.internet.email(),
        password: 'password',
        firstName: 'John!',
        lastName: 'Doe!',
      });

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        error: true,
      });
    });

    it('should create a new user', async () => {
      const response = await request.post('/auth/v1/register').send({
        email: config.verifiedAWSEmail,
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        error: false,
        message: expect.any(String),
        accessToken: expect.any(String),
      });

      // expect a "jwt" cookie to be set
      expect(response.header['set-cookie']).toEqual(
        expect.arrayContaining([expect.stringContaining('jwt=')])
      );

      accessToken = response.body.accessToken;
      refreshToken = response.header['set-cookie'][0].split('=')[1];
    });

    it('should error if the email is already in use', async () => {
      const response = await request.post('/auth/v1/register').send({
        email: config.verifiedAWSEmail,
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        error: true,
      });
    });
  });

  describe('POST /auth/v1/login', () => {
    it('should error if email or password is not provided', async () => {
      const response = await request.post('/auth/v1/login').send();

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: true,
        message: 'Missing required fields',
      });
    });

    it('should error if the email is not found', async () => {
      const response = await request.post('/auth/v1/login').send({
        email: faker.internet.email(),
        password: 'password',
      });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        error: true,
      });
    });

    it('should error if the password is incorrect', async () => {
      const response = await request.post('/auth/v1/login').send({
        email: config.verifiedAWSEmail,
        password: 'incorrectPassword',
      });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: true,
      });
    });

    it('should login the user', async () => {
      const response = await request.post('/auth/v1/login').send({
        email: config.verifiedAWSEmail,
        password: 'password',
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        error: false,
        message: expect.any(String),
        accessToken: expect.any(String),
      });

      // expect a "jwt" cookie to be set
      expect(response.header['set-cookie']).toEqual(
        expect.arrayContaining([expect.stringContaining('jwt=')])
      );

      accessToken = response.body.accessToken;
      // set refresh token from the cookie
      refreshToken = response.header['set-cookie'][0].split('=')[1];
    });
  });

  describe('POST /auth/v1/refresh', () => {
    it('should error if there is no refresh token cookie', async () => {
      const response = await request.post('/auth/v1/refresh').send();

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: true,
      });
    });

    it('should error if the refresh token is invalid', async () => {
      const response = await request
        .post('/auth/v1/refresh')
        .set('Cookie', ['jwt=invalidRefreshToken'])
        .send();

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: true,
      });
    });

    it('should refresh the access token', async () => {
      const response = await request
        .post('/auth/v1/refresh')
        .set('Cookie', [`jwt=${refreshToken}`])
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        error: false,
        message: expect.any(String),
        accessToken: expect.any(String),
      });

      accessToken = response.body.accessToken;
    });
  });

  describe('POST /auth/v1/logout', () => {
    it('should error if there is no access token', async () => {
      const response = await request.post('/auth/v1/logout').send();

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: true,
      });
    });

    it('should error if the access token is invalid', async () => {
      const response = await request
        .post('/auth/v1/logout')
        .set('Authorization', 'Bearer invalidAccessToken')
        .send();

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: true,
      });
    });

    it('should logout the user', async () => {
      const response = await request
        .post('/auth/v1/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        error: false,
        message: expect.any(String),
      });

      // expect a "jwt" cookie to be set with an empty value
      expect(response.header['set-cookie']).toEqual(
        expect.arrayContaining([expect.stringContaining('jwt=')])
      );
    });
  });

  describe('POST /auth/v1/verify', () => {
    it('should error if there is no access token', async () => {
      const response = await request.post('/auth/v1/verify').send();

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: true,
      });
    });

    it('should error if the access token is invalid', async () => {
      const response = await request
        .post('/auth/v1/verify')
        .set('Authorization', 'Bearer invalidAccessToken')
        .send();

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: true,
      });
    });

    it('should error if the verification code is not provided', async () => {
      const response = await request
        .post('/auth/v1/verify')
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: true,
        message: 'Missing required fields',
      });
    });

    it('should error if the verification code is invalid', async () => {
      const response = await request
        .post('/auth/v1/verify')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          code: 'invalidCode',
        });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: true,
      });
    });

    it('should verify the user', async () => {
      // get the verification code from the database
      const user = await User.findOne({ email: config.verifiedAWSEmail });
      const code = user.verificationToken;

      const response = await request
        .post('/auth/v1/verify')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          verificationToken: code,
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        error: false,
        message: expect.any(String),
      });
    });

    it('should error if the user is already verified', async () => {
      const response = await request
        .post('/auth/v1/verify')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          verificationToken: 'invalidCode',
        });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: true,
      });
    });
  });
});
