import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';

// Increase default timeout for slow database operations
jest.setTimeout(30000);
import { Task } from '../../src/models/Task';
import { User } from '../../src/models/User';
import { ROLES } from '../../src/middleware/roles';

const mockTask = {
  title: 'Test Task',
  description: 'Test description',
  status: 'PENDING',
  priority: 'MEDIUM',
  dueDate: new Date(),
  assignedTo: new mongoose.Types.ObjectId(),
  createdBy: new mongoose.Types.ObjectId(),
  project: new mongoose.Types.ObjectId()
};

describe('Task Model', () => {
  let task: any;
  let user: any;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Create a test user
    const passwordHash = await bcrypt.hash('password', 10);
    user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash,
      roles: [ROLES.USER]
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Task.deleteMany({});
  });

  describe('Validation', () => {
    it('should create a valid task', async () => {
      task = await Task.create({ ...mockTask, assignedTo: user._id, createdBy: user._id });
      expect(task).toBeDefined();
      expect(task.title).toBe(mockTask.title);
      expect(task.status).toBe(mockTask.status);
      expect(task.priority).toBe(mockTask.priority);
    });

    it('should fail with invalid status', async () => {
      const invalidTask = { ...mockTask, status: 'INVALID_STATUS' };
      await expect(Task.create(invalidTask)).rejects.toThrow();
    });

    it('should fail with invalid priority', async () => {
      const invalidTask = { ...mockTask, priority: 'INVALID_PRIORITY' };
      await expect(Task.create(invalidTask)).rejects.toThrow();
    });

    it('should require assignedTo and createdBy', async () => {
      const invalidTask = { ...mockTask, assignedTo: null, createdBy: null };
      await expect(Task.create(invalidTask)).rejects.toThrow();
    });
  });

  describe('Methods', () => {
    it('should update status correctly', async () => {
      task = await Task.create({ ...mockTask, assignedTo: user._id, createdBy: user._id });
      await task.updateStatus('IN_PROGRESS');
      expect(task.status).toBe('IN_PROGRESS');
    });

    it('should update priority correctly', async () => {
      task = await Task.create({ ...mockTask, assignedTo: user._id, createdBy: user._id });
      await task.updatePriority('HIGH');
      expect(task.priority).toBe('HIGH');
    });

    it('should add comment correctly', async () => {
      task = await Task.create({ ...mockTask, assignedTo: user._id, createdBy: user._id });
      await task.addComment('Test comment', user._id);
      expect(task.comments.length).toBe(1);
    });
  });

  describe('Associations', () => {
    it('should reference user correctly', async () => {
      task = await Task.create({ ...mockTask, assignedTo: user._id, createdBy: user._id });
      const populatedTask: any = await Task.findById(task._id).populate('assignedTo', 'name');
      expect((populatedTask!.assignedTo as any).name).toBe(user.name);
    });

    it('should reference project correctly', async () => {
      const project = await Task.create({
        title: 'Test Project',
        description: 'Project description',
        status: 'ACTIVE',
        createdBy: user._id
      });
      
      task = await Task.create({ ...mockTask, assignedTo: user._id, createdBy: user._id, project: project._id });
      const populatedTask: any = await Task.findById(task._id).populate('project', 'title');
      expect((populatedTask!.project as any).title).toBe('Test Project');
    });
  });
});
