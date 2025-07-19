import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICalendarEvent extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  location: string;
  eventType: string;
  color: string;
  tags: string[];
  relatedEventIds: Types.ObjectId[];
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endAfterOccurrences?: number;
    endDate?: Date;
    daysOfWeek?: number[];
    monthDay?: number;
    monthWeek?: number;
    excludeDates?: Date[];
  };
  attendees: {
    userId: Types.ObjectId;
    role: 'organizer' | 'required' | 'optional';
    responseStatus: 'accepted' | 'tentative' | 'declined' | 'needsAction';
  }[];
  resources: {
    resourceId: Types.ObjectId;
    resourceType: 'equipment' | 'room' | 'vehicle' | 'personnel';
    quantity: number;
  }[];
  reminders: {
    reminderType: 'notification' | 'email' | 'sms';
    minutesBefore: number;
    sent: boolean;
  }[];
  attachments: {
    name: string;
    fileUrl: string;
    fileType: string;
    uploadDate: Date;
  }[];
  visibility: 'public' | 'private' | 'team';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'draft';
  budget: {
    allocated: number;
    spent: number;
    currency: string;
  };
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  customFields: Map<string, any>;
}

const CalendarEventSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(this: ICalendarEvent, value: Date) {
        return this.startDate <= value;
      },
      message: 'End date must be equal to or after start date'
    }
  },
  allDay: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    trim: true
  },
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    trim: true
  },
  color: {
    type: String,
    default: '#3498db'
  },
  tags: [{
    type: String,
    trim: true
  }],
  relatedEventIds: [{
    type: Schema.Types.ObjectId,
    ref: 'CalendarEvent'
  }],
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    interval: {
      type: Number,
      min: [1, 'Interval must be at least 1']
    },
    endAfterOccurrences: {
      type: Number,
      min: [1, 'End after occurrences must be at least 1']
    },
    endDate: {
      type: Date
    },
    daysOfWeek: [{
      type: Number,
      min: [0, 'Day must be between 0 (Sunday) and 6 (Saturday)'],
      max: [6, 'Day must be between 0 (Sunday) and 6 (Saturday)']
    }],
    monthDay: {
      type: Number,
      min: [1, 'Month day must be between 1 and 31'],
      max: [31, 'Month day must be between 1 and 31']
    },
    monthWeek: {
      type: Number,
      min: [-1, 'Month week must be between -1 (last week) and 4'],
      max: [4, 'Month week must be between -1 (last week) and 4']
    },
    excludeDates: [{
      type: Date
    }]
  },
  attendees: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    role: {
      type: String,
      enum: ['organizer', 'required', 'optional'],
      default: 'required'
    },
    responseStatus: {
      type: String,
      enum: ['accepted', 'tentative', 'declined', 'needsAction'],
      default: 'needsAction'
    }
  }],
  resources: [{
    resourceId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Resource ID is required']
    },
    resourceType: {
      type: String,
      enum: ['equipment', 'room', 'vehicle', 'personnel'],
      required: [true, 'Resource type is required']
    },
    quantity: {
      type: Number,
      min: [1, 'Quantity must be at least 1'],
      default: 1
    }
  }],
  reminders: [{
    reminderType: {
      type: String,
      enum: ['notification', 'email', 'sms'],
      default: 'notification'
    },
    minutesBefore: {
      type: Number,
      min: [0, 'Minutes before must be at least 0']
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  attachments: [{
    name: {
      type: String,
      required: [true, 'Attachment name is required']
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required']
    },
    fileType: {
      type: String
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  visibility: {
    type: String,
    enum: ['public', 'private', 'team'],
    default: 'team'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'cancelled', 'completed', 'draft'],
    default: 'scheduled'
  },
  budget: {
    allocated: {
      type: Number,
      min: [0, 'Budget cannot be negative']
    },
    spent: {
      type: Number,
      min: [0, 'Spent amount cannot be negative'],
      default: 0
    },
    currency: {
      type: String,
      default: 'EUR'
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user ID is required']
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  customFields: {
    type: Map,
    of: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
CalendarEventSchema.index({ startDate: 1, endDate: 1 });
CalendarEventSchema.index({ createdBy: 1 });
CalendarEventSchema.index({ status: 1 });
CalendarEventSchema.index({ 'attendees.userId': 1 });
CalendarEventSchema.index({ eventType: 1 });
CalendarEventSchema.index({ tags: 1 });

const CalendarEvent = mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);

export default CalendarEvent;
