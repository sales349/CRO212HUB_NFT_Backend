import { AuthService } from './auth.service';
import { z } from 'zod';
declare const nonceSchema: z.ZodObject<{
    walletAddress: z.ZodString;
}, "strip", z.ZodTypeAny, {
    walletAddress: string;
}, {
    walletAddress: string;
}>;
declare const verifySchema: z.ZodObject<{
    walletAddress: z.ZodString;
    signature: z.ZodString;
    nonce: z.ZodString;
}, "strip", z.ZodTypeAny, {
    walletAddress: string;
    signature: string;
    nonce: string;
}, {
    walletAddress: string;
    signature: string;
    nonce: string;
}>;
type NonceDto = z.infer<typeof nonceSchema>;
type VerifyDto = z.infer<typeof verifySchema>;
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    nonce(body: NonceDto): Promise<{
        nonce: string;
    }>;
    verify(body: VerifyDto): Promise<{
        token: string;
    }>;
}
export {};
