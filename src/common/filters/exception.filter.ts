import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError, TypeORMError } from 'typeorm';
import { MysqlError } from 'mysql';
@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    switch (true) {
      case exception instanceof HttpException: {
        const res = exception?.getResponse();
        this.logger.error({
          ...(typeof res === 'string' ? { message: res } : res),
          stack: exception?.stack,
        });
        const statusCode = exception.getStatus();
        const payload = exception.getResponse();
        response
          .status(statusCode)
          .json(this.formatResponse(statusCode, payload));
        return;
      }
      case exception instanceof TypeORMError: {
        this.logger.error({
          error: exception.name,
          message: exception.message,
          stack: exception?.stack,
        });
        const { statusCode, message } = this.handleTypeOrmException(exception);
        response
          .status(statusCode)
          .json(this.formatResponse(statusCode, message));
        return;
      }
      default: {
        const { name, message, stack } = (exception ?? {}) as Error;
        this.logger.error({ error: name, message, stack });
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
          this.formatResponse(HttpStatus.INTERNAL_SERVER_ERROR, {
            message: 'Internal server error',
            error: 'Internal Server Error',
          }),
        );
        return;
      }
    }
  }

  private handleTypeOrmException(exception = {} as TypeORMError) {
    const { driverError: { code, errno } = {} } =
      exception as QueryFailedError<MysqlError>;
    switch (errno ?? code) {
      case 404:
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not found',
        };
      case 'ER_NO_REFERENCED_ROW_2':
      case 1452:
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Related entity missing',
        };
      case 'ER_ROW_IS_REFERENCED_2':
      case 1451:
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Cannot delete entity with related entities',
        };
      case 'ER_BAD_FIELD_ERROR':
      case 1054:
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid field in request',
        };
      case 'ER_DUP_ENTRY':
      case 1062:
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'Temporary conflict. Please retry.',
        };
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database error',
        };
    }
  }
  private formatResponse(
    statusCode: number,
    payload: string | { message?: unknown; error?: unknown },
  ) {
    if (typeof payload === 'string')
      return {
        statusCode,
        message: payload,
        error: HttpStatus[statusCode] ?? 'HttpException',
        isSuccess: false,
      };

    const { message, error } = payload;
    const resMsg =
      typeof message === 'string' || Array.isArray(message)
        ? message
        : 'Request failed';

    const resErrorMsg =
      typeof error === 'string'
        ? error
        : (HttpStatus[statusCode] ?? 'HttpException');

    return {
      statusCode,
      message: resMsg,
      error: resErrorMsg,
      isSuccess: false,
    };
  }
}
