import { HttpStatus, Injectable } from '@nestjs/common';
import { logger } from '.';
import { ServiceResponse } from './interfaces';

@Injectable()
export class BaseService {
  async handleError(error: Error): Promise<ServiceResponse> {
    logger.error('Server error', error.message);
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: [
        'An unexpected error occurred on the server. Please try again later',
      ],
    };
  }
}
