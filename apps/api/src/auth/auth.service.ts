import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  getJwtSecret,
  isLocalEnv,
  MisconfigurationException,
  SecretsManagerProvider,
  TokenPayload,
} from '@shared/take-home-core';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

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
}
