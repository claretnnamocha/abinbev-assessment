import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { config } from '../common/config';
import { UserJwtService } from './user_jwt.service';

@Module({
  providers: [UserJwtService],
  imports: [
    JwtModule.registerAsync({
      async useFactory() {
        return { secret: config.JWT_SECRET };
      },
    }),
  ],
  exports: [UserJwtService],
})
export class UserJwtModule {}
