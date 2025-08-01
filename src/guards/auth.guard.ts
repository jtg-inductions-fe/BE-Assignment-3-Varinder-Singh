import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const [type, token] = request.headers.authorization?.split(' ');

        if (!token && type !== 'Bearer') return false;

        try {
            const user = this.jwtService.verify(token);
            request.user = user;
            return true;
        } catch {
            return false;
        }
    }
}
