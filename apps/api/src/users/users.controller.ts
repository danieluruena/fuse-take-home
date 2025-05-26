import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { TOKENS } from 'src/shared/tokens';
import { Logger } from '@shared/take-home-core';

@Controller('user')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(TOKENS.LOGGER)
    private readonly logger: Logger,
  ) {}

  @Post('signup')
  async signup(
    @Req() request: Request,
    @Body() body: { email: string; password: string },
  ) {
    const { email, password } = body;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    this.logger.info(`Creating user with email: ${email}`);

    await this.usersService.createUser(email, password);
  }
}
