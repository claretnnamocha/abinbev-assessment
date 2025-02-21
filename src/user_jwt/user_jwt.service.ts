import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Op } from 'sequelize';
import { BaseService } from '../common';
import { ServiceResponse } from '../common/interfaces';
import { User } from '../database/models';

@Injectable()
export class UserJwtService extends BaseService {
  @Inject(JwtService) private readonly jwtService: JwtService;

  signJWT(payload: any): ServiceResponse {
    try {
      const accessToken = this.jwtService.sign(payload);
      return {
        statusCode: HttpStatus.OK,
        message: [],
        data: accessToken,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: [error.message],
      };
    }
  }

  async verifyJWT(jwt: string, roles = ['user', 'admin']) {
    try {
      const user = this.jwtService.verify(jwt);

      const account = await User.findOne({
        where: {
          email: user.email,
          status: 'active',
          role: { [Op.in]: roles },
        },
      });

      if (
        !user ||
        !account ||
        !user.lastLoggedInAt ||
        user.lastLoggedInAt < account.lastLoggedInAt
      )
        return null;

      return user;
    } catch (error) {
      return null;
    }
  }
}
