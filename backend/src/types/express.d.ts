import { JwtPayload } from './index';
import { ROLES } from '../middleware/roles';

declare namespace Express {
  export interface Request {
    user?: JwtPayload;
    ip: string;
    headers: {
      [key: string]: string | string[] | undefined;
      'user-agent'?: string;
    };
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roles: ROLES[];
        iat: number;
        exp: number;
      };
    }
  }
}
