import dotenv from 'dotenv';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { Client } from '../src/models';

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
  await Client.deleteMany({});
});

describe('Client PUT /api/clients/:id', () => {
  it('should update an existing client', async () => {
    const client = await Client.create({ name: 'Original' });
    const res = await request(app)
      .put(`/api/clients/${client._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.client.name).toBe('Updated');
  });

  it('should return 404 if client not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/clients/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'X' });
    expect(res.statusCode).toBe(404);
  });
});

describe('Client DELETE /api/clients/:id', () => {
  it('should delete an existing client', async () => {
    const client = await Client.create({ name: 'ToDelete' });
    const res = await request(app)
      .delete(`/api/clients/${client._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Client deleted');
    const found = await Client.findById(client._id);
    expect(found).toBeNull();
  });

  it('should return 404 if client not found', async () => {
    const res = await request(app)
      .delete(`/api/clients/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });
});
