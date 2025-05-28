import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
  Req,
} from '@nestjs/common';
import { Logger } from '@danieluruena/take-home-core';
import { AuthService } from './auth.service';
import { TOKENS } from '../shared/tokens';
import { ApiRequest, LoginData } from '../shared/types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(TOKENS.LOGGER)
    private readonly logger: Logger,
  ) {}

  @Post('login')
  async login(@Req() request: ApiRequest, @Body() body: LoginData) {
    const { email, password } = body;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    this.logger.info(`Authenticating user with email: ${email}`);

    const token = await this.authService.login(email, password);

    this.logger.info('Token generated successfully');

    return { accessToken: token };
  }
}
