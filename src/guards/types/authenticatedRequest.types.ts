import { Request } from 'express';

export interface payloadUser {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user: payloadUser;
}
