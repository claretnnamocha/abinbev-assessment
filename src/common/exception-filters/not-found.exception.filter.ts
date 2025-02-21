import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (
      exception instanceof HttpException &&
      exception.getStatus() === HttpStatus.NOT_FOUND
    ) {
      const message = 'Not Found';

      return response.status(HttpStatus.NOT_FOUND).json({
        message: [message],
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return response.status(exception.status).json(exception.response);
  }
}
