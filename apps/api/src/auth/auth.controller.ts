import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { TOKENS } from 'src/shared/tokens';
import { Logger } from '@shared/take-home-core';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(TOKENS.LOGGER)
    private readonly logger: Logger,
  ) {}

  @Post('login')
  async login(
    @Req() request: Request,
    @Body() body: { email: string; password: string },
  ) {
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
