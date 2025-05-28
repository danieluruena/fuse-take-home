import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ApiRequest } from '../../shared/types';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<ApiRequest>();
      const { authorization } = request.headers;

      if (!authorization || authorization.trim() === '') {
        throw new UnauthorizedException('Token is required');
      }

      const authToken = authorization.replace('Bearer', '').trim();
      const payload = await this.authService.validateToken(authToken);
      request.user = payload;
      return true;
    } catch (error) {
      Logger.error(error);
      return false;
    }
  }
}
