import { Request } from 'express';

export interface payloadUser {
  userId: string;
  name: string;
  email: string;
  role: string;
  phoneNo: number;
  address: string;
}

export interface AuthenticatedRequest extends Request {
  user: payloadUser;
}
