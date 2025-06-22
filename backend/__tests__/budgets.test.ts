import dotenv from 'dotenv';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { Budget, Client } from '../src/models';

dotenv.config();

let mongoServer: MongoMemoryServer;
let adminToken: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  adminToken = jwt.sign(
    { userId: new mongoose.Types.ObjectId().toString(), roles: ['CEO'] },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Budget.deleteMany({});
  await Client.deleteMany({});
});

describe('Budgets CRUD /api/budgets', () => {
  it('should return empty list initially', async () => {
    const res = await request(app)
      .get('/api/budgets')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  it('should create a new budget', async () => {
    const client = await Client.create({ name: 'Client A' });
    const payload = { client: client.id, title: 'Budget A', amount: 500, items: [], notes: 'Note' };
    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.budget.title).toBe('Budget A');
  });

  it('should get budget by id', async () => {
    const client = await Client.create({ name: 'Client B' });
    const budget = await Budget.create({ client: client._id, title: 'Budget B', amount: 200, items: [], history: [], createdBy: new mongoose.Types.ObjectId(), notes: 'Desc' });
    const res = await request(app)
      .get(`/api/budgets/${budget.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Budget B');
  });

  it('should update budget', async () => {
    const client = await Client.create({ name: 'Client C' });
    const budget = await Budget.create({ client: client._id, title: 'Budget C', amount: 300, items: [], history: [], createdBy: new mongoose.Types.ObjectId() });
    const res = await request(app)
      .put(`/api/budgets/${budget._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Budget C Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.budget.title).toBe('Budget C Updated');
  });

  it('should delete budget', async () => {
    const client = await Client.create({ name: 'Client D' });
    const budget = await Budget.create({ client: client._id, title: 'Budget D', amount: 400, items: [], history: [], createdBy: new mongoose.Types.ObjectId() });
    const res = await request(app)
      .delete(`/api/budgets/${budget.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Budget deleted');
    const found = await Budget.findById(budget._id);
    expect(found).toBeNull();
  });

  it('should return 404 for non-existent budget', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .get(`/api/budgets/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });
});
