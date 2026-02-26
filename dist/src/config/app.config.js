"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
const zod_1 = require("zod");
require("dotenv/config");
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().default(3002),
    MONGODB_URI: zod_1.z.string().min(1),
    REDIS_URL: zod_1.z.string().min(1),
    JWT_SECRET: zod_1.z.string().min(32),
    CORS_ORIGIN: zod_1.z.string().default('http://localhost:3001'),
    ADMIN_WALLETS: zod_1.z.string().default(''),
    CRONOS_RPC_URL: zod_1.z.string().default('https://evm-t3.cronos.org'),
    CRONOS_CHAIN_ID: zod_1.z.coerce.number().default(338),
    PINATA_JWT: zod_1.z.string().min(1),
    PINATA_GATEWAY: zod_1.z.string().default('gateway.pinata.cloud'),
    TREASURY_WALLET: zod_1.z.string().default('0x0000000000000000000000000000000000000000'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
}
exports.appConfig = parsed.data;
//# sourceMappingURL=app.config.js.map