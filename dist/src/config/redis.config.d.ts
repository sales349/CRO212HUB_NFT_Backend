export declare const redisConfig: {
    url: string;
    maxRetriesPerRequest: number;
    retryStrategy(times: number): number;
};
