import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  Client,
  ClientKafka,
  EventPattern,
  Payload,
} from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import {
  BaseController,
  EmailService,
  logger,
  microserviceConfig,
} from '../common';
import { LoginDTO, RegisterDTO } from './dto';
import { UserService } from './user.service';
import { AuthGuard, Authorized } from '../common/guards';

@Throttle({})
@Controller('')
@ApiTags('User')
export class UserController extends BaseController {
  @Inject(UserService) private readonly userService: UserService;
  @Inject(EmailService) private readonly emailService: EmailService;

  @Client(microserviceConfig)
  client: ClientKafka;

  onModuleInit() {
    this.client.subscribeToResponseOf('send-email');
  }

  @Post('register')
  async register(@Body() form: RegisterDTO, @Res() response: Response) {
    const data = await this.userService.register(form);
    return this.response(response, data);
  }

  @Post('login')
  async login(@Body() form: LoginDTO, @Res() response: Response) {
    const data = await this.userService.login(form);
    return this.response(response, data);
  }

  @ApiBearerAuth('jwt')
  @Authorized()
  @UseGuards(AuthGuard)
  @Get('users/:id')
  async getProfile(@Param('id') id: string, @Res() response: Response) {
    const data = await this.userService.getProfile(id);
    return this.response(response, data);
  }

  @EventPattern('send-email')
  async handleEntityCreated(@Payload() payload: any) {
    const { emailData, retryCount } = payload;
    let sent = false;
    const DELAY_TIME = 900_000; // 15mins in milliseconds

    try {
      logger.log('Sending email 📧');
      const mail = await this.emailService.sendEmail(emailData);
      sent = mail.statusCode === HttpStatus.OK;
    } catch (error) {
      logger.error(error);
    }

    if (!sent && retryCount > 0) {
      logger.log('Failed to send email, retrying in 15 minutes');
      setTimeout(() => {
        logger.log('Retrying email...');
        this.client.emit('send-email', {
          emailData,
          retryCount: retryCount - 1,
        });
      }, DELAY_TIME);
    }
  }
}
