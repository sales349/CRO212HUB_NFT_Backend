"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const setup_1 = require("./setup");
(0, vitest_1.describe)('Auth Endpoints', () => {
    let app;
    const testWallet = '0x1234567890123456789012345678901234567890';
    (0, vitest_1.beforeAll)(async () => {
        app = await (0, setup_1.createTestApp)();
    }, 30000);
    (0, vitest_1.afterAll)(async () => {
        await (0, setup_1.closeTestApp)(app);
    });
    (0, vitest_1.describe)('POST /auth/nonce', () => {
        (0, vitest_1.it)('returns nonce for valid wallet address', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/nonce')
                .send({ walletAddress: testWallet })
                .expect(200);
            (0, vitest_1.expect)(response.body.nonce).toBeDefined();
            (0, vitest_1.expect)(typeof response.body.nonce).toBe('string');
            (0, vitest_1.expect)(response.body.nonce.length).toBe(64);
        });
        (0, vitest_1.it)('returns 400 for invalid wallet address', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/nonce')
                .send({ walletAddress: 'invalid' })
                .expect(400);
            (0, vitest_1.expect)(response.body.statusCode).toBe(400);
        });
        (0, vitest_1.it)('returns 400 for missing wallet address', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/nonce')
                .send({})
                .expect(400);
            (0, vitest_1.expect)(response.body.statusCode).toBe(400);
        });
    });
    (0, vitest_1.describe)('POST /auth/verify', () => {
        (0, vitest_1.it)('returns JWT for valid nonce', async () => {
            const nonceResponse = await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/nonce')
                .send({ walletAddress: testWallet })
                .expect(200);
            const nonce = nonceResponse.body.nonce;
            const verifyResponse = await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/verify')
                .send({
                walletAddress: testWallet,
                signature: 'test-signature',
                nonce: nonce,
            })
                .expect(200);
            (0, vitest_1.expect)(verifyResponse.body.token).toBeDefined();
            (0, vitest_1.expect)(typeof verifyResponse.body.token).toBe('string');
            (0, vitest_1.expect)(verifyResponse.body.token.split('.')).toHaveLength(3);
        });
        (0, vitest_1.it)('returns 401 for invalid nonce', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/verify')
                .send({
                walletAddress: testWallet,
                signature: 'test-signature',
                nonce: 'invalid-nonce',
            })
                .expect(401);
            (0, vitest_1.expect)(response.body.statusCode).toBe(401);
        });
        (0, vitest_1.it)('returns 401 for reused nonce', async () => {
            const nonceResponse = await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/nonce')
                .send({ walletAddress: testWallet })
                .expect(200);
            const nonce = nonceResponse.body.nonce;
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/verify')
                .send({
                walletAddress: testWallet,
                signature: 'test-signature',
                nonce: nonce,
            })
                .expect(200);
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/verify')
                .send({
                walletAddress: testWallet,
                signature: 'test-signature',
                nonce: nonce,
            })
                .expect(401);
            (0, vitest_1.expect)(response.body.statusCode).toBe(401);
        });
        (0, vitest_1.it)('returns 400 for missing fields', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/verify')
                .send({ walletAddress: testWallet })
                .expect(400);
            (0, vitest_1.expect)(response.body.statusCode).toBe(400);
        });
    });
});
//# sourceMappingURL=auth.e2e-spec.js.map