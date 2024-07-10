import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import Redis from 'ioredis';

describe('Registry API (e2e)', () => {
  let app: INestApplication;
  let redisClient: Redis;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    redisClient = new Redis({
      host: 'localhost',
      port: 6379,
    });

    await redisClient.flushdb();
  });

  afterAll(async () => {
    await redisClient.flushdb();
    redisClient.disconnect();
    await app.close();
  });

  it('/registry/add (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/registry/add')
      .send({ item: 'red' })
      .expect(201);

    expect(response.text).toBe('OK');
  });

  it('/registry/check (GET)', async () => {
    await request(app.getHttpServer())
      .post('/registry/add')
      .send({ item: 'blue' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/registry/check?item=blue')
      .expect(200);

    expect(response.text).toBe('OK');

    const notFoundResponse = await request(app.getHttpServer())
      .get('/registry/check?item=green')
      .expect(200);

    expect(notFoundResponse.text).toBe('NOT OK');
  });

  it('/registry/remove (POST)', async () => {
    await request(app.getHttpServer())
      .post('/registry/add')
      .send({ item: 'red' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/registry/remove')
      .send({ item: 'red' })
      .expect(201);

    expect(response.text).toBe('OK');

    const checkResponse = await request(app.getHttpServer())
      .get('/registry/check?item=red')
      .expect(200);

    expect(checkResponse.text).toBe('NOT OK');
  });

  it('/registry/diff (POST)', async () => {
    await request(app.getHttpServer())
      .post('/registry/add')
      .send({ item: 'yellow' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/registry/add')
      .send({ item: 'blue' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/registry/diff')
      .send({ items: ['red', 'blue', 'green', 'yellow'] })
      .expect(201);

    expect(response.body).toEqual(['red', 'green']);
  });

  it('/registry/invert (POST)', async () => {
    await request(app.getHttpServer())
      .post('/registry/add')
      .send({ item: 'brown' })
      .expect(201);

    const invertResponse1 = await request(app.getHttpServer())
      .post('/registry/invert')
      .expect(201);

    expect(invertResponse1.text).toBe('OK');

    const checkResponse1 = await request(app.getHttpServer())
      .get('/registry/check?item=brown')
      .expect(200);

    expect(checkResponse1.text).toBe('NOT OK');

    const invertResponse2 = await request(app.getHttpServer())
      .post('/registry/invert')
      .expect(201);

    expect(invertResponse2.text).toBe('OK');

    const checkResponse2 = await request(app.getHttpServer())
      .get('/registry/check?item=brown')
      .expect(200);

    expect(checkResponse2.text).toBe('OK');
  });
});
