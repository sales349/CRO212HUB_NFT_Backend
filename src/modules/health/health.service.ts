import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';

@Injectable()
export class HealthService {
    private readonly logger = new Logger(HealthService.name);

    constructor(
        @InjectConnection() private readonly mongoConnection: Connection,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
    ) { }

    async checkReadiness() {
        const checks: Record<string, string> = {};

        // MongoDB check
        try {
            const state = this.mongoConnection.readyState;
            checks.mongodb = state === 1 ? 'connected' : 'disconnected';
        } catch {
            checks.mongodb = 'error';
        }

        // Redis check
        try {
            await this.redis.ping();
            checks.redis = 'connected';
        } catch {
            checks.redis = 'error';
        }

        const allHealthy = Object.values(checks).every((v) => v === 'connected');

        return {
            status: allHealthy ? 'ready' : 'degraded',
            checks,
            timestamp: new Date().toISOString(),
        };
    }
}