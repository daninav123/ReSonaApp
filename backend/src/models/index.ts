import mongoose, { Schema, model, Document, Types } from 'mongoose';

// ---------------- User ----------------
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  roles: string[];
  avatar?: string;
  preferences?: { notifications: { email: boolean; sms: boolean; push: boolean }; theme: 'light' | 'dark' };
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    roles: { type: [String], default: [] },
    lastLogin: { type: Date },
    avatar: { type: String },
    preferences: {
      notifications: { email: Boolean, sms: Boolean, push: Boolean },
      theme: { type: String, enum: ['light','dark'], default: 'light' }
    },
  },
  { timestamps: true }
);
export const User = model<IUser>('User', UserSchema);

// ---------------- Client ----------------
export interface IClient extends Document {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  assignedCommercial?: Types.ObjectId;
  dni?: string;
  tags: string[];
  status?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true },
    phone: String,
    email: String,
    address: String,
    assignedCommercial: { type: Schema.Types.ObjectId, ref: 'User' },
    dni: String,
    tags: { type: [String], default: [] },
    status: String,
    notes: String,
  },
  { timestamps: true }
);
ClientSchema.index({ name: 'text', email: 1, status: 1 });
export const Client = model<IClient>('Client', ClientSchema);

// ---------------- Budget ----------------
export interface IBudget extends Document {
  client: Types.ObjectId;
  title: string;
  amount: number;
  notes?: string;
  createdBy: Types.ObjectId;
  assignedCommercial: Types.ObjectId;
  date: Date;
  items: { description: string; qty: number; unitPrice: number }[];
  packs: { packId: Types.ObjectId; name: string; price: number }[];
  discount: { amount: number; isPercent: boolean };
  taxRate: number;
  total: number;
  status: string;
  history: { status: string; date: Date; byUser: Types.ObjectId }[];
  openedAt?: Date;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedCommercial: { type: Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
    items: [
      {
        description: String,
        qty: Number,
        unitPrice: Number,
      },
    ],
    packs: [
      {
        packId: Types.ObjectId,
        name: String,
        price: Number,
      },
    ],
    discount: {
      amount: { type: Number, default: 0 },
      isPercent: { type: Boolean, default: false },
    },
    taxRate: { type: Number, default: 21 },
    total: { type: Number, default: 0 },
    status: { type: String, default: 'enviado' },
    history: [
      {
        status: String,
        date: Date,
        byUser: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    openedAt: Date,
    acceptedAt: Date,
  },
  { timestamps: true }
);
export const Budget = model<IBudget>('Budget', BudgetSchema);

// ---------------- Event ----------------
export interface IEvent extends Document {
  budget?: Types.ObjectId;
  client: Types.ObjectId;
  date?: Date;
  type?: string;
  location?: string;
  assignedStaff: Types.ObjectId[];
  status?: string;
  checklist: {
    phase: string;
    items: {
      title: string;
      responsible: Types.ObjectId;
      status: string;
      comments?: string;
      photo?: string;
      signedBy?: string;
    }[];
  }[];
  documents: { name: string; url: string; type: string }[];
  googleCalendarId?: string;
  timeline: { start: Date; end: Date; label: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    budget: { type: Schema.Types.ObjectId, ref: 'Budget' },
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    date: Date,
    type: String,
    location: String,
    assignedStaff: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: String,
    checklist: [
      {
        phase: String,
        items: [
          {
            title: String,
            responsible: Types.ObjectId,
            status: String,
            comments: String,
            photo: String,
            signedBy: String,
          },
        ],
      },
    ],
    documents: [
      {
        name: String,
        url: String,
        type: String,
      },
    ],
    googleCalendarId: String,
    timeline: [
      {
        start: Date,
        end: Date,
        label: String,
      },
    ],
  },
  { timestamps: true }
);
export const Event = model<IEvent>('Event', EventSchema);

// ---------------- Material ----------------
export interface IMaterial extends Document {
  name: string;
  description?: string;
  status?: string;
  quantityTotal: number;
  quantityReserved: number;
  photos: string[];
  history: {
    type: string;
    date: Date;
    byUser: Types.ObjectId;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema = new Schema<IMaterial>(
  {
    name: { type: String, required: true },
    description: String,
    status: String,
    quantityTotal: { type: Number, default: 0 },
    quantityReserved: { type: Number, default: 0 },
    photos: { type: [String], default: [] },
    history: [
      {
        type: { type: String, enum: ['in', 'out', 'repair', 'damage'] },
        date: Date,
        byUser: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  { timestamps: true }
);
export const Material = (mongoose.models.Material as mongoose.Model<IMaterial>) || model<IMaterial>('Material', MaterialSchema);

// ---------------- Task ----------------
export interface ITask extends Document {
  title: string;
  description?: string;
  assignedTo?: Types.ObjectId;
  relatedTo?: { kind: string; item: Types.ObjectId };
  dueDate?: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: String,
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    relatedTo: { kind: String, item: Types.ObjectId },
    dueDate: Date,
    status: { type: String, default: 'pendiente' },
  },
  { timestamps: true }
);
export const Task = model<ITask>('Task', TaskSchema);

// ---------------- Notification ----------------
export interface INotification extends Document {
  user: Types.ObjectId;
  category?: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: String,
    message: { type: String, required: true },
    link: String,
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export const Notification = model<INotification>('Notification', NotificationSchema);

// ---------------- Provider ----------------
export interface IProvider extends Document {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  taxId: string;
  category: string[];
  rating: number;
  status: 'active' | 'inactive' | 'pending';
  paymentTerms: string;
  notes: string;
  products: Array<{
    _id?: Types.ObjectId;
    name: string;
    code: string;
    price: number;
    description?: string;
    category?: string;
  }>;
  documents: Array<{
    _id?: Types.ObjectId;
    name: string;
    type: string;
    url: string;
    uploadDate: Date;
  }>;
  history: Array<{
    _id?: Types.ObjectId;
    date: Date;
    action: string;
    description: string;
    user: Types.ObjectId;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ProviderSchema = new Schema<IProvider>(
  {
    name: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    website: String,
    taxId: { type: String, required: true },
    category: [{ type: String }],
    rating: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['active', 'inactive', 'pending'], 
      default: 'pending' 
    },
    paymentTerms: { type: String, default: '' },
    notes: { type: String, default: '' },
    products: [{
      name: { type: String, required: true },
      code: { type: String, required: true },
      price: { type: Number, required: true },
      description: String,
      category: String
    }],
    documents: [{
      name: { type: String, required: true },
      type: { type: String, required: true },
      url: { type: String, required: true },
      uploadDate: { type: Date, default: Date.now }
    }],
    history: [{
      date: { type: Date, default: Date.now },
      action: { type: String, required: true },
      description: { type: String, required: true },
      user: { type: Schema.Types.ObjectId, ref: 'User' }
    }]
  },
  { timestamps: true }
);

export const Provider = model<IProvider>('Provider', ProviderSchema);
