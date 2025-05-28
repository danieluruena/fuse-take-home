import { Module } from '@nestjs/common';
import {
  BcryptEncryptor,
  PinoLogger,
  UsersDynamoDBRepository,
} from '@danieluruena/take-home-core';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { TOKENS } from '../shared/tokens';

@Module({
  imports: [
    JwtModule.register({
      signOptions: {
        expiresIn: '1h',
      },
    }),
  ],
  providers: [
    AuthService,
    JwtService,
    { provide: TOKENS.USERS_REPOSITORY, useClass: UsersDynamoDBRepository },
    { provide: TOKENS.ENCRYPTION_PROVIDER, useClass: BcryptEncryptor },
    { provide: TOKENS.LOGGER, useClass: PinoLogger },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
