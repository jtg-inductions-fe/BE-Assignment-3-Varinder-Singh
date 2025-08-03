import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserType } from '@modules/user/types/user.types';

import { AuthenticatedRequest } from './types/authenticatedRequest.types';

export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader)
      throw new UnauthorizedException('Missing Authroization header');

    const [type, token] = authHeader.split(' ');

    if (!token && type !== 'Bearer') return false;

    try {
      const user: UserType = this.jwtService.verify(token);
      request.user = user;
      return true;
    } catch {
      return false;
    }
  }
}
