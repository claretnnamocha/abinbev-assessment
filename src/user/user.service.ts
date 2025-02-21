import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Client, ClientKafka } from '@nestjs/microservices';
import { BaseService, MESSAGES, microserviceConfig } from '../common';
import { ServiceResponse } from '../common/interfaces';
import { User } from '../database/models';
import { UserJwtService } from '../user_jwt/user_jwt.service';
import { LoginDTO, RegisterDTO } from './dto';

@Injectable()
export class UserService extends BaseService {
  @Client(microserviceConfig)
  client: ClientKafka;

  @Inject(UserJwtService) private readonly userJwtService: UserJwtService;

  onModuleInit() {
    this.client.subscribeToResponseOf('send-email');
  }

  async getProfile(id: string): Promise<ServiceResponse> {
    try {
      const user = await User.findOne({ where: { id } });

      if (!user) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: [MESSAGES.RECORD_NOT_FOUND('profile')],
        };
      }

      return { statusCode: HttpStatus.OK, data: user, message: [] };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async register(payload: RegisterDTO): Promise<ServiceResponse> {
    try {
      const { email } = payload;
      const exists = await User.findOne({ where: { email } });

      if (exists)
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: [MESSAGES.USER_WITH_EMAIL_EXIST],
        };

      await User.create({ ...payload });

      this.client.emit('send-email', {
        emailData: {
          to: [{ email }],
          subject: 'Welcome',
          template: 'welcome',
        },
        retryCount: 5,
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: [MESSAGES.REGISTRATION_SUCCESS],
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: [error.message],
      };
    }
  }

  async login(payload: LoginDTO): Promise<ServiceResponse> {
    try {
      const { email, password } = payload;
      const user = await User.findOne({ where: { email } });

      if (!user || !user.validatePassword(password))
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: [MESSAGES.LOGIN_CREDENTIALS_INVALID],
        };

      if (user.status.toLowerCase() !== 'active') {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['account is not active'],
        };
      }

      let { lastLoggedInAt } = user;
      if (lastLoggedInAt) {
        lastLoggedInAt = new Date(Number(lastLoggedInAt)).toJSON();
      }

      const loggedInAt = Date.now();
      const accessToken = this.userJwtService.signJWT({
        email,
        lastLoggedInAt: loggedInAt,
      });

      if (accessToken.statusCode !== HttpStatus.OK) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: [MESSAGES.LOGIN_FAILURE],
        };
      }

      await user.update({ lastLoggedInAt: loggedInAt });

      return {
        statusCode: HttpStatus.OK,
        message: [MESSAGES.LOGIN_SUCCESS],
        data: {
          accessToken: accessToken.data,
          ...user.toJSON(),
          lastLoggedInAt,
        },
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: [error.message],
      };
    }
  }
}
