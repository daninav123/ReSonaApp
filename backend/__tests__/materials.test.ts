import dotenv from 'dotenv';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { Material } from '../src/models';

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
  await Material.deleteMany({});
});

describe('Materials CRUD /api/materials', () => {
  it('should return empty list initially', async () => {
    const res = await request(app)
      .get('/api/materials')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  it('should create a new material', async () => {
    const payload = { name: 'Material A', description: 'Desc', status: 'available', quantityTotal: 10, quantityReserved: 2 };
    const res = await request(app)
      .post('/api/materials')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.material.name).toBe('Material A');
  });

  it('should get material by id', async () => {
    const material = await Material.create({ name: 'Material B', description: 'Desc', status: 'available', quantityTotal: 5, quantityReserved: 1, photos: [], history: [] });
    const res = await request(app)
      .get(`/api/materials/${material._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Material B');
  });

  it('should update material', async () => {
    const material = await Material.create({ name: 'Material C', description: 'Desc', status: 'available', quantityTotal: 7, quantityReserved: 0, photos: [], history: [] });
    const res = await request(app)
      .put(`/api/materials/${material._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Material C Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.material.name).toBe('Material C Updated');
  });

  it('should delete material', async () => {
    const material = await Material.create({ name: 'Material D', description: 'Desc', status: 'available', quantityTotal: 3, quantityReserved: 0, photos: [], history: [] });
    const res = await request(app)
      .delete(`/api/materials/${material._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Material deleted');
    const found = await Material.findById(material._id);
    expect(found).toBeNull();
  });

  it('should return 404 for non-existent material', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/materials/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });
});
