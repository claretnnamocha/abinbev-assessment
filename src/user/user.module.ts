import { Module } from '@nestjs/common';
import { EmailService } from '../common';
import { UserJwtModule } from '../user_jwt/user_jwt.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [UserJwtModule],
  controllers: [UserController],
  providers: [UserService, EmailService],
  exports: [UserService],
})
export class UserModule {}
