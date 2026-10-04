import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiError } from '@skillverify/shared';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse: any =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message = 'Internal server error';
    let errors: Record<string, string[]> | undefined;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (exceptionResponse && typeof exceptionResponse === 'object') {
      message = exceptionResponse.message || message;
      if (Array.isArray(exceptionResponse.message)) {
        message = exceptionResponse.message[0];
        errors = { validation: exceptionResponse.message };
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorPayload: ApiError = {
      success: false,
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorPayload);
  }
}
