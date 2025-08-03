import { Request } from 'express';

import { UserType } from '@modules/user/types/user.types';

export interface AuthenticatedRequest extends Request {
  user: UserType;
}
