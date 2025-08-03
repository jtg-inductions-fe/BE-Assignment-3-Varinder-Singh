import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Roles } from 'decorators/roles.decorator';

import { AuthenticatedRequest } from './types/authenticatedRequest.types';

export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles: string[] = this.reflector.get(Roles, context.getHandler());

    if (!roles.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userRole = request.user.role;

    return roles.includes(userRole);
  }
}
