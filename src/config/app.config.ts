import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3002),
    MONGODB_URI: z.string().min(1),
    REDIS_URL: z.string().min(1),
    JWT_SECRET: z.string().min(32),
    CORS_ORIGIN: z.string().default('http://localhost:3001'),
    ADMIN_WALLETS: z.string().default(''),
    CRONOS_RPC_URL: z.string().default('https://evm-t3.cronos.org'),
    CRONOS_CHAIN_ID: z.coerce.number().default(338),
    PINATA_JWT: z.string().min(1),
    PINATA_GATEWAY: z.string().default('gateway.pinata.cloud'),
    TREASURY_WALLET: z.string().default('0x0000000000000000000000000000000000000000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
}

export const appConfig = parsed.data;
export type AppConfig = z.infer<typeof envSchema>;