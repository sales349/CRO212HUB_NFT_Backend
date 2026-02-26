import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { jwtVerify } from 'jose';
import { appConfig } from '../../config/app.config';

interface JwtPayload {
    sub: string;
    iat: number;
    exp: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
    private readonly logger = new Logger(AuthGuard.name);
    private readonly secret: Uint8Array;

    constructor() {
        this.secret = new TextEncoder().encode(appConfig.JWT_SECRET);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<FastifyRequest>();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('Missing authorization header');
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw new UnauthorizedException('Invalid authorization format');
        }

        const token = parts[1];

        try {
            const { payload } = await jwtVerify(token, this.secret);
            (request as FastifyRequest & { user: JwtPayload }).user = payload as unknown as JwtPayload;
            return true;
        } catch (error) {
            this.logger.debug(`JWT verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}