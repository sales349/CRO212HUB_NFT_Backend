import Redis from 'ioredis';
export declare class AuthService {
    private readonly redis;
    private readonly logger;
    private readonly secret;
    constructor(redis: Redis);
    generateNonce(walletAddress: string): Promise<string>;
    verifyAndIssueToken(walletAddress: string, _signature: string, nonce: string): Promise<string>;
}
