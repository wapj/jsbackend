import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import { AppModule } from './../src/app.module';

describe('Authentication and user flow (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    );
    app.use(cookieParser());
    app.use(
      session({
        secret: 'e2e-session-secret',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 60_000 },
      }),
    );
    app.use(passport.initialize());
    app.use(passport.session());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers, authenticates, updates, and deletes a user', async () => {
    const server = app.getHttpServer();
    const credentials = {
      email: 'wapj@example.com',
      password: 'initial-password',
      username: 'wapj',
    };

    await request(server).get('/').expect(200).expect('Hello World!');
    await request(server)
      .post('/auth/register')
      .send({ email: 'not-an-email', password: 'x', username: 'wapj' })
      .expect(400);
    await request(server)
      .post('/auth/register')
      .send({ ...credentials, email: 'attacker@example.com', id: 1 })
      .expect(400);
    await request(server).post('/user/create').send(credentials).expect(404);

    const registered = await request(server)
      .post('/auth/register')
      .send(credentials)
      .expect(201);
    expect(registered.body).toMatchObject({
      email: credentials.email,
      username: credentials.username,
    });
    expect(registered.body.password).toBeUndefined();
    await request(server).post('/auth/register').send(credentials).expect(400);

    await request(server).get('/auth/test-guard').expect(403);
    const wrongLogin = await request(server)
      .post('/auth/login')
      .send({ email: credentials.email, password: 'wrong-password' })
      .expect(201);
    expect(wrongLogin.headers['set-cookie']).toBeUndefined();

    const cookieLogin = await request(server)
      .post('/auth/login')
      .send(credentials)
      .expect(201);
    const loginCookie = cookieLogin.headers['set-cookie'];
    expect(loginCookie).toBeDefined();
    await request(server)
      .get('/auth/test-guard')
      .set(
        'Cookie',
        loginCookie.map((cookie) => cookie.split(';')[0]).join('; '),
      )
      .expect(200);

    const guardedLogin = await request(server)
      .post('/auth/login2')
      .send(credentials)
      .expect(201);
    expect(guardedLogin.headers['set-cookie']).toBeDefined();

    const agent = request.agent(server);
    await agent.post('/auth/login3').send(credentials).expect(201);
    const sessionUser = await agent.get('/auth/test-guard2').expect(200);
    expect(sessionUser.body.email).toBe(credentials.email);

    await request(server)
      .get(`/user/getUser/${encodeURIComponent(credentials.email)}`)
      .expect(403);
    const found = await agent
      .get(`/user/getUser/${encodeURIComponent(credentials.email)}`)
      .expect(200);
    expect(found.body.username).toBe('wapj');
    expect(found.body.password).toBeUndefined();

    await request(server)
      .put(`/user/update/${encodeURIComponent(credentials.email)}`)
      .send({ username: 'wapj-updated', password: 'updated-password' })
      .expect(403);
    await agent
      .put('/user/update/someone-else@example.com')
      .send({ username: 'attacker', password: 'attacker-password' })
      .expect(403);
    const updated = await agent
      .put(`/user/update/${encodeURIComponent(credentials.email)}`)
      .send({ username: 'wapj-updated', password: 'updated-password' })
      .expect(200);
    expect(updated.body.username).toBe('wapj-updated');
    expect(updated.body.password).toBeUndefined();

    const oldPassword = await request(server)
      .post('/auth/login')
      .send(credentials)
      .expect(201);
    expect(oldPassword.headers['set-cookie']).toBeUndefined();
    const newPassword = await request(server)
      .post('/auth/login')
      .send({ email: credentials.email, password: 'updated-password' })
      .expect(201);
    expect(newPassword.headers['set-cookie']).toBeDefined();

    await request(server)
      .delete(`/user/delete/${encodeURIComponent(credentials.email)}`)
      .expect(403);
    const deleted = await agent
      .delete(`/user/delete/${encodeURIComponent(credentials.email)}`)
      .expect(200);
    expect(deleted.body.affected).toBe(1);
    await agent
      .get(`/user/getUser/${encodeURIComponent(credentials.email)}`)
      .expect(403);
  });
});
