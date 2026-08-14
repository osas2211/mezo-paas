import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const adminKey = this.extractAdminKey(request);

    const expectedKey = this.configService.get<string>('ADMIN_KEY');

    if (!expectedKey) {
      throw new UnauthorizedException('Admin access is not configured');
    }

    if (!adminKey) {
      throw new UnauthorizedException('Admin key is required');
    }

    if (adminKey !== expectedKey) {
      throw new UnauthorizedException('Invalid admin key');
    }

    return true;
  }

  private extractAdminKey(request: Request): string | undefined {
    // Check header first (x-admin-key)
    const headerKey = request.headers['x-admin-key'] as string;
    if (headerKey) return headerKey;

    // Also check query param as fallback
    const queryKey = request.query['adminKey'] as string;
    return queryKey;
  }
}
