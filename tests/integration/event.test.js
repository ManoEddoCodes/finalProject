const request = require('supertest');
const { connect, closeDatabase, clearDatabase } = require('../setup.js');

let app;
let Category;
let adminToken;
let categoryId;

beforeAll(async () => {
  await connect();
  app = require('../../app.js');
  Category = require('../../models/categoryModel.js');
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

const registerAndPromoteAdmin = async () => {
  await request(app).post('/api/auth/register').send({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
  });

  const User = require('../../models/userModel.js');
  await User.updateOne({ email: 'admin@test.com' }, { role: 'admin' });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'password123' });

  return loginRes.body.token;
};

beforeEach(async () => {
  adminToken = await registerAndPromoteAdmin();
  const category = await Category.create({ name: 'Technology' });
  categoryId = category._id.toString();
});

describe('Events API', () => {
  it('creates an event as admin', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Tech Conference',
        description: 'A great tech conference',
        date: new Date(Date.now() + 86400000).toISOString(),
        city: 'Cairo',
        capacity: 50,
        category: categoryId,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.name).toBe('Tech Conference');
    expect(res.body.data.category.name).toBe('Technology');
  });

  it('rejects event creation without authentication', async () => {
    const res = await request(app).post('/api/events').send({
      name: 'No Auth Event',
      date: new Date().toISOString(),
      city: 'Cairo',
      capacity: 10,
      category: categoryId,
    });

    expect(res.statusCode).toBe(401);
  });

  it('lists events', async () => {
    await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Event One',
        date: new Date(Date.now() + 86400000).toISOString(),
        city: 'Cairo',
        capacity: 10,
        category: categoryId,
      });

    const res = await request(app).get('/api/events');

    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBe(1);
    expect(res.body.data[0].name).toBe('Event One');
  });

  it('filters events by city', async () => {
    await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Cairo Event',
        date: new Date(Date.now() + 86400000).toISOString(),
        city: 'Cairo',
        capacity: 10,
        category: categoryId,
      });

    await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Alex Event',
        date: new Date(Date.now() + 86400000).toISOString(),
        city: 'Alexandria',
        capacity: 10,
        category: categoryId,
      });

    const res = await request(app).get('/api/events').query({ city: 'Cairo' });

    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBe(1);
    expect(res.body.data[0].city).toBe('Cairo');
  });

  it('combines filters (city + search) correctly', async () => {
    await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'React Summit',
        description: 'Frontend event',
        date: new Date(Date.now() + 86400000).toISOString(),
        city: 'Cairo',
        capacity: 10,
        category: categoryId,
      });

    await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'React Summit',
        description: 'Frontend event',
        date: new Date(Date.now() + 86400000).toISOString(),
        city: 'Alexandria',
        capacity: 10,
        category: categoryId,
      });

    const res = await request(app)
      .get('/api/events')
      .query({ city: 'Cairo', search: 'React' });

    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBe(1);
    expect(res.body.data[0].city).toBe('Cairo');
  });

  it('returns 404 for a non-existent event', async () => {
    const res = await request(app).get('/api/events/507f1f77bcf86cd799439011');
    expect(res.statusCode).toBe(404);
  });

  it('returns 422 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Incomplete Event' });

    expect(res.statusCode).toBe(422);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('allows a partial PATCH update with only one valid field', async () => {
    const created = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Update Me',
        date: new Date(Date.now() + 86400000).toISOString(),
        city: 'Cairo',
        capacity: 20,
        category: categoryId,
      });

    const res = await request(app)
      .patch(`/api/events/${created.body.data._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ capacity: 40 });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.capacity).toBe(40);
  });

  it('rejects a PATCH update with an invalid field value (422)', async () => {
    const created = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Bad Update',
        date: new Date(Date.now() + 86400000).toISOString(),
        city: 'Cairo',
        capacity: 20,
        category: categoryId,
      });

    const res = await request(app)
      .patch(`/api/events/${created.body.data._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ capacity: -5 });

    expect(res.statusCode).toBe(422);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});