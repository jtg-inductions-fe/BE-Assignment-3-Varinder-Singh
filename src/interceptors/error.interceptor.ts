import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';

import { Request } from 'express';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept<T>(context: ExecutionContext, next: CallHandler<T>): Observable<T> {
    return next.handle().pipe(
      catchError((err: unknown) => {
        const request: Request = context.switchToHttp().getRequest();

        if (err instanceof Error) {
          Logger.error(
            `Error occurred during request to ${request.method} ${request.url}: ${err.message}`,
            err.stack,
          );
        } else {
          Logger.error(
            `Error occurred during request to ${request.method} ${request.url}`,
            JSON.stringify(err),
          );
        }

        return throwError(() => err);
      }),
    );
  }
}
