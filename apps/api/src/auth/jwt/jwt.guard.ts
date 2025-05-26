import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { TokenPayload } from '@shared/take-home-core';

interface HttpRequest {
  headers: Record<string, string>;
  contextData: TokenPayload;
}

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: HttpRequest = context.switchToHttp().getRequest();
      const { authorization } = request.headers;

      if (!authorization || authorization.trim() === '') {
        throw new UnauthorizedException('Token is required');
      }

      const authToken = authorization.replace('Bearer', '').trim();
      const payload = await this.authService.validateToken(authToken);
      request.contextData = payload;
      return true;
    } catch (error) {
      Logger.error(error);
      return false;
    }
  }
}
