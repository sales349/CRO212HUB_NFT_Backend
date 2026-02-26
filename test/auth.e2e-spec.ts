import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createTestApp, closeTestApp } from './setup';

describe('Auth Endpoints', () => {
    let app: NestFastifyApplication;
    const testWallet = '0x1234567890123456789012345678901234567890';

    beforeAll(async () => {
        app = await createTestApp();
    }, 30000);

    afterAll(async () => {
        await closeTestApp(app);
    });

    describe('POST /auth/nonce', () => {
        it('returns nonce for valid wallet address', async () => {
            const response = await supertest(app.getHttpServer())
                .post('/auth/nonce')
                .send({ walletAddress: testWallet })
                .expect(200);

            expect(response.body.nonce).toBeDefined();
            expect(typeof response.body.nonce).toBe('string');
            expect(response.body.nonce.length).toBe(64);
        });

        it('returns 400 for invalid wallet address', async () => {
            const response = await supertest(app.getHttpServer())
                .post('/auth/nonce')
                .send({ walletAddress: 'invalid' })
                .expect(400);

            expect(response.body.statusCode).toBe(400);
        });

        it('returns 400 for missing wallet address', async () => {
            const response = await supertest(app.getHttpServer())
                .post('/auth/nonce')
                .send({})
                .expect(400);

            expect(response.body.statusCode).toBe(400);
        });
    });

    describe('POST /auth/verify', () => {
        it('returns JWT for valid nonce', async () => {
            const nonceResponse = await supertest(app.getHttpServer())
                .post('/auth/nonce')
                .send({ walletAddress: testWallet })
                .expect(200);

            const nonce = nonceResponse.body.nonce;

            const verifyResponse = await supertest(app.getHttpServer())
                .post('/auth/verify')
                .send({
                    walletAddress: testWallet,
                    signature: 'test-signature',
                    nonce: nonce,
                })
                .expect(200);

            expect(verifyResponse.body.token).toBeDefined();
            expect(typeof verifyResponse.body.token).toBe('string');
            expect(verifyResponse.body.token.split('.')).toHaveLength(3);
        });

        it('returns 401 for invalid nonce', async () => {
            const response = await supertest(app.getHttpServer())
                .post('/auth/verify')
                .send({
                    walletAddress: testWallet,
                    signature: 'test-signature',
                    nonce: 'invalid-nonce',
                })
                .expect(401);

            expect(response.body.statusCode).toBe(401);
        });

        it('returns 401 for reused nonce', async () => {
            const nonceResponse = await supertest(app.getHttpServer())
                .post('/auth/nonce')
                .send({ walletAddress: testWallet })
                .expect(200);

            const nonce = nonceResponse.body.nonce;

            await supertest(app.getHttpServer())
                .post('/auth/verify')
                .send({
                    walletAddress: testWallet,
                    signature: 'test-signature',
                    nonce: nonce,
                })
                .expect(200);

            const response = await supertest(app.getHttpServer())
                .post('/auth/verify')
                .send({
                    walletAddress: testWallet,
                    signature: 'test-signature',
                    nonce: nonce,
                })
                .expect(401);

            expect(response.body.statusCode).toBe(401);
        });

        it('returns 400 for missing fields', async () => {
            const response = await supertest(app.getHttpServer())
                .post('/auth/verify')
                .send({ walletAddress: testWallet })
                .expect(400);

            expect(response.body.statusCode).toBe(400);
        });
    });
});