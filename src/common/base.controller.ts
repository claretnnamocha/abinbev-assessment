import { Controller } from '@nestjs/common';
import { Response } from 'express';
import { ServiceResponse } from './interfaces';

@Controller()
export class BaseController {
  async response(response: Response, data: ServiceResponse) {
    if (data?.data?.accessToken) {
      response.cookie('accessToken', data?.data?.accessToken, {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
      });
    }
    return response.status(data.statusCode).json(data);
  }
}
