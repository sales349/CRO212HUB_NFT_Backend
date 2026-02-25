import { appConfig } from './app.config';

export const redisConfig = {
    url: appConfig.REDIS_URL,
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
};