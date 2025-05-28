import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
  Req,
} from '@nestjs/common';
import { Logger } from '@danieluruena/take-home-core';
import { UsersService } from './users.service';
import { TOKENS } from '../shared/tokens';
import { ApiRequest, NewUserData } from '../shared/types';

@Controller('user')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(TOKENS.LOGGER)
    private readonly logger: Logger,
  ) {}

  @Post('signup')
  async signup(@Req() request: ApiRequest, @Body() body: NewUserData) {
    const { email, password } = body;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    this.logger.info(`Creating user with email: ${email}`);

    await this.usersService.createUser(email, password);
  }
}
