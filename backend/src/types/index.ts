export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string[];
  };
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: string[];
}

import { Role } from '../middleware/roles';

export interface JwtPayload {
  id: string;
  email: string;
  roles: Role[];
  iat: number;
  exp: number;
}

export interface RefreshToken {
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AuditLog {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  changes: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}
