import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';
import { User } from '../../src/models/User';
import { ROLES } from '../../src/middleware/roles';

let mockUser: any = {
  name: 'Test User',
  email: 'test@example.com',
  'passwordHash': '$2b$10$N9qo8uLOickgx2ZMRZo5e.PuahTeNobPOJrF8d.q0SP5oEKPj2eW',
  roles: [ROLES.USER]
};

describe('User Model', () => {
  let user: any;

  jest.setTimeout(30000);

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  const hashed = await bcrypt.hash('password', 10);
  mockUser.passwordHash = hashed;
  });

  afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('Validation', () => {
    it('should create a valid user', async () => {
      user = await User.create(mockUser);
      expect(user).toBeDefined();
      expect(user.name).toBe(mockUser.name);
      expect(user.email).toBe(mockUser.email);
      expect(user.roles).toEqual(mockUser.roles);
    });

    it('should fail with invalid email', async () => {
      const invalidUser = { ...mockUser, email: 'invalid-email' };
      await expect(User.create(invalidUser)).rejects.toThrow('Email must be valid');
    });

    it('should fail with duplicate email', async () => {
      await User.create(mockUser);
      await expect(User.create(mockUser)).rejects.toThrow('Email already exists');
    });

    it('should fail with invalid role', async () => {
      const invalidUser = { ...mockUser, roles: ['INVALID_ROLE'] };
      await expect(User.create(invalidUser)).rejects.toThrow();
    });
  });

  describe('Password Methods', () => {
    it('should hash password before saving', async () => {
      user = await User.create(mockUser);
      expect(user.passwordHash.length).toBeGreaterThanOrEqual(60);
    });

    it('should compare password correctly', async () => {
      user = await User.create(mockUser);
      const password = 'test123';
      const hashed = await bcrypt.hash(password, 10);
      const [userWithHash] = await User.insertMany([{ ...mockUser, email: 'unique@example.com', passwordHash: hashed }]);
      expect(await userWithHash.comparePassword(password)).toBe(true);
    });
  });

  describe('Preferences', () => {
    it('should set default preferences', async () => {
      user = await User.create({ ...mockUser });
      expect(user.preferences).toBeDefined();
      expect(user.preferences.theme).toBe('light');
      expect(user.preferences.notifications).toBe(true);
      expect(user.preferences.language).toBe('es');
    });

    it('should validate preferences', async () => {
      const invalidUser = { ...mockUser, preferences: { theme: 'invalid' } };
      await expect(User.create(invalidUser)).rejects.toThrow();
    });
  });
});
