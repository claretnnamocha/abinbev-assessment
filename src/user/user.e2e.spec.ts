import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { setupConfig } from '../common/config';
import { User } from '../database/models';

const fakeUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'Test@1234',
};

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    setupConfig();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    // Delete test user immediately after request
    const { email } = fakeUser;
    await User.destroy({ where: { email } });
  });

  it('(POST) /register', async () => {
    const response = await request(app.getHttpServer())
      .post('/register')
      .send(fakeUser);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      statusCode: 201,
      message: ['account created successfully'],
    });
  });

  it('(POST) /login', async () => {
    const { email, password } = fakeUser;
    await User.create(fakeUser);

    const response = await request(app.getHttpServer()).post('/login').send({
      email,
      password,
    });

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe(email);
    expect(response.body.data).toHaveProperty('accessToken');
  });

  it('(GET) /users/:id', async () => {
    const { firstName, lastName, email } = fakeUser;
    const { id } = await User.create(fakeUser);

    const response = await request(app.getHttpServer()).get(`/users/${id}`);

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe(email);
    expect(response.body.data.lastName).toBe(lastName);
    expect(response.body.data.firstName).toBe(firstName);
  });
});
