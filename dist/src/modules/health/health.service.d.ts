import { Connection } from 'mongoose';
import Redis from 'ioredis';
export declare class HealthService {
    private readonly mongoConnection;
    private readonly redis;
    private readonly logger;
    constructor(mongoConnection: Connection, redis: Redis);
    checkReadiness(): Promise<{
        status: string;
        checks: Record<string, string>;
        timestamp: string;
    }>;
}
