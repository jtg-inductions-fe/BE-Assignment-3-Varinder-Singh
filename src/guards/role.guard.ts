import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Roles } from 'decorators/roles.decorator';

import { AuthenticatedRequest } from './types/authenticatedRequest.types';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles: string[] = this.reflector.get(Roles, context.getHandler());

    if (!roles.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (
      ['buyer', 'seller'].includes(user.role) &&
      (!user.address || !user.phoneNo)
    ) {
      throw new UnauthorizedException('Phone no. and address are required');
    }

    return roles.includes(user.role);
  }
}
