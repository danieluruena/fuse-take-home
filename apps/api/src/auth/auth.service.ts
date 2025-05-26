import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  EncryptionProvider,
  getJwtSecret,
  isLocalEnv,
  Logger,
  MisconfigurationException,
  SecretsManagerProvider,
  TokenPayload,
  User,
  UsersRepository,
} from '@shared/take-home-core';
import { TOKENS } from 'src/shared/tokens';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(TOKENS.USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
    @Inject(TOKENS.ENCRYPTION_PROVIDER)
    private readonly encryptionProvider: EncryptionProvider,
    @Inject(TOKENS.LOGGER)
    private readonly logger: Logger,
  ) {}

  async validateToken(token: string): Promise<TokenPayload> {
    const jwtSecret = await this.getJwtSecret();
    return this.jwtService.verify<TokenPayload>(token, { secret: jwtSecret });
  }

  private async getJwtSecret(): Promise<string> {
    let jwtSecret = getJwtSecret();
    if (!isLocalEnv()) {
      const secretsManager = new SecretsManagerProvider();
      jwtSecret = await secretsManager.getJwtSecret();
    }

    if (!jwtSecret) {
      throw new MisconfigurationException(
        'JWT secret is not set. Please check your environment variables or secrets manager.',
      );
    }

    return jwtSecret;
  }

  async areValidCredentials(email: string, password: string): Promise<User> {
    this.logger.info('Validating credentials');
    const user = await this.usersRepository.getUserByEmail(email);

    if (!user) {
      this.logger.info('User not found');
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.encryptionProvider.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.info('Invalid password');
      throw new UnauthorizedException('Invalid email or password');
    }
    return user;
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.areValidCredentials(email, password);
    const jwtSecret = await this.getJwtSecret();
    const payload: TokenPayload = { userId: user.userId };

    return this.jwtService.sign(payload, { secret: jwtSecret });
  }
}
