import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { appConfig } from '../../config/app.config';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<FastifyRequest & { user: { sub: string } }>();
        const user = request.user;

        if (!user?.sub) {
            throw new ForbiddenException('Authentication required');
        }

        const adminWallets = appConfig.ADMIN_WALLETS
            .split(',')
            .map((w) => w.trim().toLowerCase())
            .filter(Boolean);

        if (!adminWallets.includes(user.sub.toLowerCase())) {
            throw new ForbiddenException('Admin access required');
        }

        return true;
    }
}