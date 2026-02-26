import { Injectable, Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { SignJWT } from 'jose';
import { randomBytes } from 'node:crypto';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';
import { appConfig } from '../../config/app.config';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private readonly secret: Uint8Array;

    constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {
        this.secret = new TextEncoder().encode(appConfig.JWT_SECRET);
    }

    async generateNonce(walletAddress: string): Promise<string> {
        const nonce = randomBytes(32).toString('hex');
        const key = `nonce:${walletAddress.toLowerCase()}`;
        await this.redis.set(key, nonce, 'EX', 300); // 5 minutes
        this.logger.debug(`Nonce generated for ${walletAddress}`);
        return nonce;
    }

    async verifyAndIssueToken(
        walletAddress: string,
        _signature: string,
        nonce: string,
    ): Promise<string> {
        const key = `nonce:${walletAddress.toLowerCase()}`;
        const storedNonce = await this.redis.get(key);

        if (!storedNonce || storedNonce !== nonce) {
            throw new UnauthorizedException('Invalid or expired nonce');
        }

        // Delete used nonce
        await this.redis.del(key);

        // Issue JWT
        const token = await new SignJWT({ sub: walletAddress.toLowerCase() })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(this.secret);

        this.logger.log(`JWT issued for ${walletAddress}`);
        return token;
    }
}