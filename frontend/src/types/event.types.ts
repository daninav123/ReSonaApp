export interface IChecklistItem {
  _id?: string;
  text: string;
  checked: boolean;
  createdAt?: string;
}

export interface IFileItem {
  _id?: string;
  name: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  path?: string;
  url?: string;
  uploadedAt?: string;
}

export interface IExternalCalendar {
  provider: 'google' | 'microsoft' | 'apple';
  externalId: string;
  externalUrl?: string;
  lastSynced?: string;
}

export interface IEvent {
  _id?: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  client?: string; // ID del cliente
  createdBy?: string; // ID del usuario
  assignedTo?: string[]; // Array de IDs de usuarios
  status: 'draft' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  checklist?: IChecklistItem[];
  files?: IFileItem[];
  externalCalendars?: IExternalCalendar[];
  isAllDay: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IEventWithPopulated extends Omit<IEvent, 'client' | 'createdBy' | 'assignedTo'> {
  client?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  assignedTo?: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
}

export interface IEventFilters {
  start?: string;
  end?: string;
  client?: string;
  status?: string | string[];
  assignedTo?: string | string[];
  createdBy?: string;
  page?: number;
  limit?: number;
}

export interface ICalendarIntegration {
  accessToken?: string;
  refreshToken?: string;
  expiryDate?: number;
  connected: boolean;
  lastSynced?: string;
}
