import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GeneralExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const message = Array.isArray(exception?.response?.message)
      ? exception.response.message
      : [exception.response.message];

    const responseBody = {
      statusCode: exception.status || 500,
      message,
    };

    return response.status(exception.status || 500).json(responseBody);
  }
}
