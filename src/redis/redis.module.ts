import { Module, Global, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { appConfig } from '../config/app.config';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
    providers: [
        {
            provide: REDIS_CLIENT,
            useFactory: () => {
                const logger = new Logger('RedisModule');
                const useTls = appConfig.REDIS_URL.startsWith('rediss://');
                const client = new Redis(appConfig.REDIS_URL, {
                    maxRetriesPerRequest: 3,
                    retryStrategy(times: number) {
                        const delay = Math.min(times * 50, 2000);
                        return delay;
                    },
                    ...(useTls ? { tls: {} } : {}),
                });

                client.on('connect', () => logger.log('Redis connected'));
                client.on('error', (err) => logger.error('Redis error', err.message));

                return client;
            },
        },
    ],
    exports: [REDIS_CLIENT],
})
export class RedisModule implements OnModuleDestroy {
    constructor() { }

    async onModuleDestroy() {
        // Redis cleanup handled by NestJS lifecycle
    }
}