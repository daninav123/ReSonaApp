import mongoose, { Schema, model, Document, Types, models } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: Date;
  assignedTo: Types.ObjectId;
  createdBy: Types.ObjectId;
  project?: Types.ObjectId;
  comments: { body: string; author: Types.ObjectId; date: Date }[];
  updateStatus(status: 'PENDING' | 'IN_PROGRESS' | 'DONE'): Promise<void>;
  updatePriority(priority: 'LOW' | 'MEDIUM' | 'HIGH'): Promise<void>;
  addComment(body: string, author: Types.ObjectId): Promise<void>;
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'DONE', 'ACTIVE'], default: 'PENDING' },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
  dueDate: { type: Date },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Task' },
  comments: [
    {
      body: String,
      author: { type: Schema.Types.ObjectId, ref: 'User' },
      date: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

// ----- Instance methods -----
TaskSchema.methods.updateStatus = async function(this: ITask, newStatus: ITask['status']) {
  if (!['PENDING', 'IN_PROGRESS', 'DONE', 'ACTIVE'].includes(newStatus)) {
    throw new Error('Invalid status');
  }
  this.status = newStatus;
  await this.save();
};

TaskSchema.methods.updatePriority = async function(this: ITask, newPriority: ITask['priority']) {
  if (!['LOW', 'MEDIUM', 'HIGH'].includes(newPriority)) {
    throw new Error('Invalid priority');
  }
  this.priority = newPriority;
  await this.save();
};

TaskSchema.methods.addComment = async function(this: ITask, body: string, author: Types.ObjectId) {
  this.comments.push({ body, author, date: new Date() });
  await this.save();
};

const TaskModel = (models.Task as mongoose.Model<ITask>) || model<ITask>('Task', TaskSchema);
export default TaskModel;
export { TaskModel as Task };
