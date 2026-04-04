import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { App } from 'supertest/types';
import request from 'supertest';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // Case: Signup
  it('/users/signup (POST)', async () => {
    const _email = 'liem@gmail.com';

    const res = await request(app.getHttpServer())
      .post('/users/signup')
      .send({
        email: _email,
        password: 'password123',
      })
      .expect(201);

    // Check cookie
    const cookie = res.get('Set-Cookie');
    expect(cookie).toBeDefined();

    // Whoami
    await request(app.getHttpServer())
      .get('/users/whoami')
      .set('Cookie', cookie!)
      .expect(200)
      .expect({
        id: 1,
        name: '',
        email: _email,
      });
  });

  // Case: Signin
  // it('/users/signin (POST)', () => {
  //   const _email = 'liem@gmail.com';
  //   return request(app.getHttpServer())
  //     .post('/users/signin')
  //     .send({
  //       email: _email,
  //       password: 'password123',
  //     })
  //     .then((res) => {
  //       const { id, email } = res.body;

  //       expect(res.statusCode).toBe(201);
  //       expect(email).toEqual(_email);
  //     });
  // });
});
