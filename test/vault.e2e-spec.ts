import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import supertest from 'supertest';
import { Test } from '@nestjs/testing';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { IpfsService } from '../src/modules/generator/ipfs.service';

describe('Vault Endpoints', () => {
    let app: NestFastifyApplication;
    let authToken: string;
    let otherAuthToken: string;
    let savedPresetId: string;
    const testWallet = '0x1234567890123456789012345678901234567890';
    const otherWallet = '0xABCDABCDABCDABCDABCDABCDABCDABCDABCDABCD';

    const mockIpfsService = {
        uploadImage: vi.fn().mockResolvedValue('ipfs://QmTestImageCid123'),
        uploadMetadata: vi.fn().mockResolvedValue('ipfs://QmTestMetadataCid456'),
        getGatewayUrl: vi.fn((uri: string) =>
            `https://gateway.pinata.cloud/ipfs/${uri.replace('ipfs://', '')}`,
        ),
    };

    const validPreset = {
        name: 'My Legendary Preset',
        prompt: 'A cosmic warrior with diamond armor',
        traits: {
            background: 'cosmic',
            body: 'diamond',
            eyes: 'laser',
            mouth: 'diamond_grill',
            accessories: 'crown',
            special: 'lightning_aura',
        },
        rarity: {
            score: 97.5,
            rank: 'Legendary',
            breakdown: {
                background: 97,
                body: 98,
                eyes: 96,
                mouth: 99,
                accessories: 95,
                special: 97,
            },
        },
        imageUrl: 'ipfs://QmTestImage123',
        metadataUrl: 'ipfs://QmTestMeta456',
        gatewayUrl: 'https://gateway.pinata.cloud/ipfs/QmTestImage123',
    };

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
        })
            .overrideProvider(IpfsService)
            .useValue(mockIpfsService)
            .compile();

        app = moduleRef.createNestApplication<NestFastifyApplication>(
            new FastifyAdapter(),
        );
        app.useGlobalFilters(new HttpExceptionFilter());

        await app.init();
        await app.getHttpAdapter().getInstance().ready();

        authToken = await getToken(testWallet);
        otherAuthToken = await getToken(otherWallet);
    }, 30000);

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    describe('POST /vault/save-preset', () => {
        it('returns 401 without auth', async () => {
            await supertest(app.getHttpServer())
                .post('/vault/save-preset')
                .send(validPreset)
                .expect(401);
        });

        it('returns 400 with missing name', async () => {
            const { name: _, ...noName } = validPreset;
            await supertest(app.getHttpServer())
                .post('/vault/save-preset')
                .set('Authorization', `Bearer ${authToken}`)
                .send(noName)
                .expect(400);
        });

        it('saves preset successfully', async () => {
            const response = await supertest(app.getHttpServer())
                .post('/vault/save-preset')
                .set('Authorization', `Bearer ${authToken}`)
                .send(validPreset)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.preset).toBeDefined();
            expect(response.body.preset.name).toBe(validPreset.name);
            expect(response.body.preset.walletAddress).toBe(testWallet.toLowerCase());
            expect(response.body.preset.rarity.rank).toBe('Legendary');

            savedPresetId = response.body.preset._id;
        });

        it('saves a second preset', async () => {
            const response = await supertest(app.getHttpServer())
                .post('/vault/save-preset')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ...validPreset, name: 'Second Preset' })
                .expect(201);

            expect(response.body.success).toBe(true);
        });
    });

    describe('GET /vault/presets', () => {
        it('returns 401 without auth', async () => {
            await supertest(app.getHttpServer())
                .get('/vault/presets')
                .expect(401);
        });

        it('lists user presets only', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/vault/presets')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.presets.length).toBeGreaterThanOrEqual(2);
            expect(response.body.total).toBeGreaterThanOrEqual(2);
            expect(response.body.page).toBe(1);
            expect(response.body.limit).toBe(20);

            // All presets belong to this wallet
            for (const preset of response.body.presets) {
                expect(preset.walletAddress).toBe(testWallet.toLowerCase());
            }
        });

        it('returns empty array for user with no presets', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/vault/presets')
                .set('Authorization', `Bearer ${otherAuthToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.presets).toHaveLength(0);
            expect(response.body.total).toBe(0);
        });

        it('pagination works', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/vault/presets?page=1&limit=1')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.presets).toHaveLength(1);
            expect(response.body.total).toBeGreaterThanOrEqual(2);
        });

        it('sort by rarity works', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/vault/presets?sort=rarity')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.presets.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('GET /vault/presets/:id', () => {
        it('returns preset by id', async () => {
            const response = await supertest(app.getHttpServer())
                .get(`/vault/presets/${savedPresetId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.preset.name).toBe(validPreset.name);
        });

        it('returns 404 for non-existent preset', async () => {
            await supertest(app.getHttpServer())
                .get('/vault/presets/67890abcdef1234567890abc')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });
    });

    describe('GET /vault/presets/:id/avatar', () => {
        it('returns avatar data', async () => {
            const response = await supertest(app.getHttpServer())
                .get(`/vault/presets/${savedPresetId}/avatar`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.avatarConfig.width).toBe(512);
            expect(response.body.avatarConfig.height).toBe(512);
            expect(response.body.avatarConfig.format).toBe('png');
        });
    });

    describe('POST /vault/remix', () => {
        it('returns 401 without auth', async () => {
            await supertest(app.getHttpServer())
                .post('/vault/remix')
                .send({
                    sourcePresetId: savedPresetId,
                    newTraits: { background: 'midnight' },
                })
                .expect(401);
        });

        it('returns 400 when no traits changed', async () => {
            await supertest(app.getHttpServer())
                .post('/vault/remix')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    sourcePresetId: savedPresetId,
                    newTraits: {},
                })
                .expect(400);
        });

        it('returns 404 for non-existent source preset', async () => {
            await supertest(app.getHttpServer())
                .post('/vault/remix')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    sourcePresetId: '67890abcdef1234567890abc',
                    newTraits: { background: 'midnight' },
                })
                .expect(404);
        });

        it('remixes preset successfully', async () => {
            const response = await supertest(app.getHttpServer())
                .post('/vault/remix')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    sourcePresetId: savedPresetId,
                    newTraits: { background: 'midnight' },
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.isRemix).toBe(true);
            expect(response.body.sourcePresetId).toBe(savedPresetId);
            expect(response.body.imageUrl).toBeDefined();
            expect(response.body.rarity).toBeDefined();
        });
    });

    describe('DELETE /vault/presets/:id', () => {
        it('returns 403 for non-owner', async () => {
            await supertest(app.getHttpServer())
                .delete(`/vault/presets/${savedPresetId}`)
                .set('Authorization', `Bearer ${otherAuthToken}`)
                .expect(403);
        });

        it('returns 404 for non-existent preset', async () => {
            await supertest(app.getHttpServer())
                .delete('/vault/presets/67890abcdef1234567890abc')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });

        it('deletes preset for owner', async () => {
            await supertest(app.getHttpServer())
                .delete(`/vault/presets/${savedPresetId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            // Verify deleted
            await supertest(app.getHttpServer())
                .get(`/vault/presets/${savedPresetId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });
    });
});