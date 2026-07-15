import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ServerResponse } from 'http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startedAt = Date.now();
    const { method, originalUrl, url } = request;

    const log = (statusCode?: number) => {
      const durationMs = Date.now() - startedAt;
      this.logger.log({
        method,
        url: originalUrl ?? url,
        statusCode,
        responseTime: `${durationMs}ms`,
      });
    };

    return next.handle().pipe(
      tap(() => log(response?.statusCode)),
      catchError((err: HttpException | ServerResponse) => {
        log(err instanceof HttpException ? err?.getStatus() : err?.statusCode);
        return throwError(() => err);
      }),
    );
  }
}
