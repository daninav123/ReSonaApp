// Definiciones de tipos para el módulo de calendario

export interface CalendarEvent {
  _id?: string;
  title: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  allDay: boolean;
  location?: string;
  eventType: string;
  color?: string;
  tags?: string[];
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'draft';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  visibility: 'public' | 'private' | 'team';
  attendees?: {
    userId: string;
    role: 'organizer' | 'required' | 'optional';
    responseStatus: 'accepted' | 'tentative' | 'declined' | 'needsAction';
  }[];
  resources?: {
    resourceId: string;
    resourceType: 'equipment' | 'room' | 'vehicle' | 'personnel';
    quantity: number;
  }[];
  reminders?: {
    reminderType: 'notification' | 'email' | 'sms';
    minutesBefore: number;
    sent: boolean;
  }[];
  attachments?: {
    name: string;
    fileUrl: string;
    fileType: string;
    uploadDate: Date | string;
  }[];
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endAfterOccurrences?: number;
    endDate?: Date | string;
    daysOfWeek?: number[];
    monthDay?: number;
    monthWeek?: number;
    excludeDates?: (Date | string)[];
  };
  budget?: {
    estimated: number;
    actual: number;
    currency: string;
  };
  relatedEventIds?: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  customFields?: Record<string, any>;
}

export interface CalendarEventFilters {
  startAfter?: string;
  startBefore?: string;
  endAfter?: string;
  endBefore?: string;
  eventType?: string;
  status?: string;
  visibility?: string;
  priority?: string;
  createdBy?: string;
  attendeeId?: string;
  tags?: string[];
  searchText?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  allDay?: boolean;
}

export interface ResourceAvailabilityRequest {
  resourceIds: string[];
  startDate: string;
  endDate: string;
}

export interface BatchStatusUpdateRequest {
  eventIds: string[];
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'draft';
}
