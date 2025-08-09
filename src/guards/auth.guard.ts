import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {
  AuthenticatedRequest,
  payloadUser,
} from '@app-types/authenticatedRequest.types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authroization header');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) return false;

    try {
      const user: payloadUser = this.jwtService.verify(token);
      request.user = user;
      throw new Error('artificial eror');
      return true;
    } catch (err) {
      Logger.error(err, '[AuthGuard]');
      return false;
    }
  }
}
