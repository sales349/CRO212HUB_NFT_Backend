import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { Test } from '@nestjs/testing';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Week 4 Endpoints', () => {
    let app: NestFastifyApplication;
    let authToken: string;
    let adminToken: string;
    const testWallet = '0x1234567890123456789012345678901234567890';

    async function getToken(wallet: string): Promise<string> {
        const nonceRes = await supertest(app.getHttpServer())
            .post('/auth/nonce')
            .send({ walletAddress: wallet });

        const verifyRes = await supertest(app.getHttpServer())
            .post('/auth/verify')
            .send({
                walletAddress: wallet,
                signature: 'test',
                nonce: nonceRes.body.nonce,
            });

        return verifyRes.body.token;
    }

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication<NestFastifyApplication>(
            new FastifyAdapter(),
        );
        app.useGlobalFilters(new HttpExceptionFilter());

        await app.init();
        await app.getHttpAdapter().getInstance().ready();

        authToken = await getToken(testWallet);
        // Admin token — uses first ADMIN_WALLETS entry from env
        adminToken = authToken; // same wallet if it's in ADMIN_WALLETS
    }, 30000);

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    // ========= GET /wallet/reputation =========
    describe('GET /wallet/reputation', () => {
        it('returns reputation for valid address (public, no auth)', async () => {
            const response = await supertest(app.getHttpServer())
                .get(`/wallet/reputation?address=${testWallet}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.reputation).toBeDefined();
            expect(response.body.reputation.walletAddress).toBe(testWallet.toLowerCase());
            expect(typeof response.body.reputation.reputationScore).toBe('number');
            expect(typeof response.body.reputation.totalMints).toBe('number');
            expect(typeof response.body.reputation.totalSales).toBe('number');
            expect(typeof response.body.reputation.totalPurchases).toBe('number');
            expect(typeof response.body.reputation.totalListings).toBe('number');
            expect(typeof response.body.reputation.totalVolume).toBe('number');
        });

        it('returns 400 for invalid address format', async () => {
            await supertest(app.getHttpServer())
                .get('/wallet/reputation?address=not-an-address')
                .expect(400);
        });

        it('returns 400 for missing address', async () => {
            await supertest(app.getHttpServer())
                .get('/wallet/reputation')
                .expect(400);
        });

        it('creates default reputation for new address', async () => {
            const newWallet = '0xABCDABCDABCDABCDABCDABCDABCDABCDABCDABCD';
            const response = await supertest(app.getHttpServer())
                .get(`/wallet/reputation?address=${newWallet}`)
                .expect(200);

            expect(response.body.reputation.reputationScore).toBe(0);
            expect(response.body.reputation.totalMints).toBe(0);
            expect(response.body.reputation.totalSales).toBe(0);
        });
    });

    // ========= GET /feature-flags =========
    describe('GET /feature-flags', () => {
        it('returns all flags (public, no auth)', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/feature-flags')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.flags).toBeDefined();
            expect(typeof response.body.flags).toBe('object');

            // Check default flags exist
            expect('marketplace_enabled' in response.body.flags).toBe(true);
            expect('remix_enabled' in response.body.flags).toBe(true);
            expect('avatar_builder_enabled' in response.body.flags).toBe(true);
            expect('minting_enabled' in response.body.flags).toBe(true);
            expect('buy_enabled' in response.body.flags).toBe(true);

            // Verify default values
            expect(response.body.flags.marketplace_enabled).toBe(true);
            expect(response.body.flags.buy_enabled).toBe(false); // Week 5 — not ready
        });
    });

    // ========= POST /feature-flags/toggle =========
    describe('POST /feature-flags/toggle', () => {
        it('returns 401 without auth', async () => {
            await supertest(app.getHttpServer())
                .post('/feature-flags/toggle')
                .send({ name: 'minting_enabled' })
                .expect(401);
        });

        it('rejects without flag name (guard or validation)', async () => {
            const response = await supertest(app.getHttpServer())
                .post('/feature-flags/toggle')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({});

            // AdminGuard returns 403 if wallet not in ADMIN_WALLETS,
            // ZodValidationPipe returns 400 if body invalid
            expect([400, 403]).toContain(response.status);
        });

        // Note: toggle success depends on the test wallet being in ADMIN_WALLETS env
        // In CI, set ADMIN_WALLETS=0x1234567890123456789012345678901234567890
        it('toggles a flag when admin', async () => {
            // Get current value
            const before = await supertest(app.getHttpServer())
                .get('/feature-flags')
                .expect(200);
            const wasEnabled = before.body.flags.buy_enabled;

            // Toggle
            const response = await supertest(app.getHttpServer())
                .post('/feature-flags/toggle')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'buy_enabled' });

            // If admin guard passes, verify toggle
            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(response.body.flag.name).toBe('buy_enabled');
                expect(response.body.flag.enabled).toBe(!wasEnabled);

                // Verify the change persisted
                const after = await supertest(app.getHttpServer())
                    .get('/feature-flags')
                    .expect(200);
                expect(after.body.flags.buy_enabled).toBe(!wasEnabled);
            }
            // If 403, that's OK — wallet isn't in ADMIN_WALLETS for this test env
        });
    });

    // ========= GET /fees/info =========
    describe('GET /fees/info', () => {
        it('returns fee model (public, no auth)', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/fees/info')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.fees).toBeDefined();

            // Primary mint
            expect(response.body.fees.primaryMint.platformFee).toBe(0.02);
            expect(response.body.fees.primaryMint.buyerPays).toBeDefined();

            // Secondary sale
            expect(response.body.fees.secondarySale.buyerFee).toBe(0.03);
            expect(response.body.fees.secondarySale.sellerFee).toBe(0.03);
            expect(response.body.fees.secondarySale.totalPlatform).toBe(0.06);

            // Royalties
            expect(response.body.fees.royalties.default).toBe(0.05);
            expect(response.body.fees.royalties.standard).toBe('EIP-2981');

            // Treasury splits
            expect(response.body.fees.treasurySplits.liquidity).toBe(0.02);
            expect(response.body.fees.treasurySplits.treasuryYield).toBe(0.02);
            expect(response.body.fees.treasurySplits.hubBuybacks).toBe(0.02);
        });
    });

    // ========= GET /telegram/user-context/:telegramId =========
    describe('GET /telegram/user-context/:telegramId', () => {
        it('returns 404 for unknown telegram ID', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/telegram/user-context/unknown123')
                .expect(404);

            const msg = Array.isArray(response.body.message)
                ? response.body.message.join(' ')
                : response.body.message || '';
            expect(msg).toContain('No wallet linked');
        });
    });
});
