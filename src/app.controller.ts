import { Controller, Get } from '@nestjs/common';
import { BaseController } from './common';

@Controller('')
export class AppController extends BaseController {
  @Get('health-check')
  async health() {
    return { health: 'API OK' };
  }
}
