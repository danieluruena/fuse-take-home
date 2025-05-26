import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {
  BcryptEncryptor,
  PinoLogger,
  UsersDynamoDBRepository,
} from '@shared/take-home-core';
import { TOKENS } from '../shared/tokens';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: TOKENS.USERS_REPOSITORY, useClass: UsersDynamoDBRepository },
    { provide: TOKENS.ENCRYPTION_PROVIDER, useClass: BcryptEncryptor },
    { provide: TOKENS.LOGGER, useClass: PinoLogger },
  ],
})
export class UserModule {}
