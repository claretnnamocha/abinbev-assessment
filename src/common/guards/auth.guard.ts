import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserJwtService } from '../../user_jwt/user_jwt.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly useJwtService: UserJwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    try {
      const unauthorized =
        this.reflector.get<boolean>('unauthorized', context.getHandler()) ||
        this.reflector.get<boolean>('unauthorized', context.getClass());

      const requireJWT =
        this.reflector.get<boolean>('requireJWT', context.getHandler()) ||
        this.reflector.get<boolean>('requireJWT', context.getClass());

      let roles =
        this.reflector.get<string[]>('roles', context.getHandler()) ||
        this.reflector.get<string[]>('roles', context.getClass());
      if (!roles || !roles.length) roles = ['user', 'admin'];

      if (unauthorized) return true;

      const req: Request = context.switchToHttp().getRequest();

      const jwt = req.headers['authorization']?.split(' ')[1];

      if (!jwt && requireJWT) throw new UnauthorizedException();

      const user = await this.useJwtService.verifyJWT(jwt, roles);

      if (!user) throw new UnauthorizedException();

      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
