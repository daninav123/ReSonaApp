import mongoose, { Schema, Document, CallbackError } from 'mongoose';
import bcrypt from 'bcrypt';
import { ROLES, Role } from '../middleware/roles';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  roles: Role[];
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: 'es' | 'en';
  };
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email must be valid'],
    validate: {
      validator: async function(value: string) {
        const user = await this.constructor.findOne({ email: value });
        if (user && String(user._id) !== String(this._id)) {
          return false;
        }
        return true;
      },
      message: 'Email already exists'
    }
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [60, 'Password hash must be at least 60 characters']
  },
  roles: {
    type: [{
      type: String,
      enum: Object.values(ROLES)
    }],
    required: [true, 'Roles are required'],
    default: [ROLES.USER]
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      enum: ['es', 'en'],
      default: 'es'
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', userSchema);
