const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');
const User = require('../models/User');

describe('POST /api/auth/login', () => {
  let mongo;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test_jwt_secret';
    process.env.NODE_ENV = 'test';

    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());

    await User.create({
      firstname: 'Admin',
      lastname: 'User',
      email: 'admin@test.com',
      password: 'Admin123!',
      role: 'admin',
      status: 'approved'
    });

    await User.create({
      firstname: 'Citizen',
      lastname: 'User',
      email: 'citoyen@test.com',
      password: 'Citizen123!',
      role: 'citoyen',
      status: 'approved'
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongo) await mongo.stop();
  });

  test('Connexion admin valide', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: '  ADMIN@TEST.COM  ', password: 'Admin123!' })
      .expect(200);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data.token');
    expect(res.body.data).toHaveProperty('role', 'admin');
  });

  test('Connexion citoyen valide', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'citoyen@test.com', password: 'Citizen123!' })
      .expect(200);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('role', 'citoyen');
    expect(res.body.data).toHaveProperty('token');
  });

  test('Email inexistant', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'absent@test.com', password: 'Whatever123!' })
      .expect(401);

    expect(res.body).toHaveProperty('message');
  });

  test('Mauvais mot de passe', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Wrong123!' })
      .expect(401);

    expect(res.body).toHaveProperty('message');
  });

  test('JWT valide', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Admin123!' })
      .expect(200);

    const token = res.body.data.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded).toHaveProperty('id');
    expect(decoded).toHaveProperty('iat');
    expect(decoded).toHaveProperty('exp');
    expect(decoded.exp - decoded.iat).toBeGreaterThanOrEqual(60 * 60 * 24 * 29);
  });
});
