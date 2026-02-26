import { OnModuleDestroy } from '@nestjs/common';
export declare const REDIS_CLIENT = "REDIS_CLIENT";
export declare class RedisModule implements OnModuleDestroy {
    constructor();
    onModuleDestroy(): Promise<void>;
}
