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
import { RarityService } from '../src/modules/generator/rarity.service';

describe('Generator Endpoints', () => {
    let app: NestFastifyApplication;
    let authToken: string;
    const testWallet = '0x1234567890123456789012345678901234567890';

    const mockIpfsService = {
        uploadImage: vi.fn().mockResolvedValue('ipfs://QmTestImageCid123'),
        uploadMetadata: vi.fn().mockResolvedValue('ipfs://QmTestMetadataCid456'),
        getGatewayUrl: vi.fn((uri: string) =>
            `https://gateway.pinata.cloud/ipfs/${uri.replace('ipfs://', '')}`
        ),
    };

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

        // Get auth token
        const nonceRes = await supertest(app.getHttpServer())
            .post('/auth/nonce')
            .send({ walletAddress: testWallet });

        const verifyRes = await supertest(app.getHttpServer())
            .post('/auth/verify')
            .send({
                walletAddress: testWallet,
                signature: 'test',
                nonce: nonceRes.body.nonce,
            });

        authToken = verifyRes.body.token;
    }, 30000);

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    const validRequest = {
        prompt: 'A cosmic warrior with diamond armor',
        traits: {
            background: 'cosmic',
            body: 'diamond',
            eyes: 'laser',
            mouth: 'diamond_grill',
            accessories: 'crown',
            special: 'lightning_aura',
        },
    };

    describe('POST /api/ai/intelligent-layer/v1/generate', () => {
        describe('Authentication', () => {
            it('returns 401 without Authorization header', async () => {
                await supertest(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .send(validRequest)
                    .expect(401);
            });

            it('returns 401 with invalid token', async () => {
                await supertest(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', 'Bearer invalid-token')
                    .send(validRequest)
                    .expect(401);
            });

            it('returns 401 with malformed header', async () => {
                await supertest(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', 'NotBearer token')
                    .send(validRequest)
                    .expect(401);
            });
        });

        describe('Validation', () => {
            it('returns 400 when prompt is missing', async () => {
                const response = await supertest(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ traits: validRequest.traits })
                    .expect(400);

                expect(response.body.statusCode).toBe(400);
            });

            it('returns 400 when prompt exceeds 500 characters', async () => {
                const response = await supertest(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        prompt: 'x'.repeat(501),
                        traits: validRequest.traits,
                    })
                    .expect(400);

                expect(response.body.statusCode).toBe(400);
            });

            it('returns 400 when traits object is missing', async () => {
                await supertest(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ prompt: 'test prompt' })
                    .expect(400);
            });

            it('returns 400 when a trait category is missing', async () => {
                const incompleteTraits = { ...validRequest.traits };
                delete (incompleteTraits as Record<string, string>).background;

                await supertest(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ prompt: 'test', traits: incompleteTraits })
                    .expect(400);
            });

            it('returns 400 when trait value is invalid', async () => {
                const invalidTraits = { ...validRequest.traits, background: 'invalid_value' };

                await supertest(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ prompt: 'test', traits: invalidTraits })
                    .expect(400);
            });
        });

        describe('Successful Generation', () => {
            it('returns 200 with valid request', async () => {
                const response = await supertest(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validRequest)
                    .expect(200);

                expect(response.body.imageUrl).toBeDefined();
                expect(response.body.metadataUrl).toBeDefined();
                expect(response.body.gatewayUrl).toBeDefined();
                expect(response.body.metadata).toBeDefined();
                expect(response.body.rarity).toBeDefined();
            });

            it('returns correct IPFS URLs', async () => {
                const response = await supertest(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validRequest)
                    .expect(200);

                expect(response.body.imageUrl).toMatch(/^ipfs:\/\//);
                expect(response.body.metadataUrl).toMatch(/^ipfs:\/\//);
                expect(response.body.gatewayUrl).toMatch(/^https:\/\//);
            });

            it('returns correct metadata structure', async () => {
                const response = await supertest(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validRequest)
                    .expect(200);

                const { metadata } = response.body;
                expect(metadata.name).toContain('CRO212HUB Genesis #');
                expect(metadata.description).toBe(validRequest.prompt);
                expect(metadata.image).toMatch(/^ipfs:\/\//);
                expect(metadata.attributes).toHaveLength(6);
                expect(metadata.properties.creator).toBe(testWallet.toLowerCase());
                expect(metadata.properties.collection).toBe('CRO212HUB Genesis');
                expect(metadata.properties.engine).toBe('Generator V1');
                expect(metadata.properties.chainId).toBe(338);
            });

            it('uses custom chainId when provided', async () => {
                const response = await supertest(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ ...validRequest, chainId: 25 })
                    .expect(200);

                expect(response.body.metadata.properties.chainId).toBe(25);
            });

            it('returns valid rarity object', async () => {
                const response = await supertest(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validRequest)
                    .expect(200);

                const { rarity } = response.body;
                expect(rarity.score).toBeGreaterThanOrEqual(0);
                expect(rarity.score).toBeLessThanOrEqual(100);
                expect(['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common']).toContain(rarity.rank);
                expect(Object.keys(rarity.breakdown)).toHaveLength(6);
            });
        });
    });

    describe('RarityService Unit Tests', () => {
        let rarityService: RarityService;

        beforeAll(() => {
            rarityService = new RarityService();
        });

        it('calculates Legendary rank for all rarest traits', () => {
            const traits = {
                background: 'cosmic',
                body: 'diamond',
                eyes: 'laser',
                mouth: 'diamond_grill',
                accessories: 'crown',
                special: 'lightning_aura',
            };

            const result = rarityService.calculateRarity(traits);
            expect(result.score).toBeGreaterThan(95);
            expect(result.rank).toBe('Legendary');
        });

        it('calculates Rare rank for all common traits', () => {
            const traits = {
                background: 'plain_white',
                body: 'basic',
                eyes: 'normal',
                mouth: 'open',
                accessories: 'none',
                special: 'none',
            };

            const result = rarityService.calculateRarity(traits);
            expect(result.score).toBeGreaterThan(50);
            expect(result.score).toBeLessThan(75);
            expect(result.rank).toBe('Rare');
        });

        it('calculates score in expected range for mixed traits', () => {
            const traits = {
                background: 'midnight',
                body: 'clay',
                eyes: 'amber',
                mouth: 'neutral',
                accessories: 'cap',
                special: 'none',
            };

            const result = rarityService.calculateRarity(traits);
            expect(result.score).toBeGreaterThanOrEqual(50);
            expect(result.score).toBeLessThanOrEqual(100);
        });

        it('returns correct breakdown percentages', () => {
            const traits = {
                background: 'cosmic',
                body: 'basic',
                eyes: 'normal',
                mouth: 'open',
                accessories: 'none',
                special: 'none',
            };

            const result = rarityService.calculateRarity(traits);
            expect(result.breakdown.background).toBe(97);
        });

        it('calculates score decrease when traits become more common', () => {
            const rareTraits = {
                background: 'cosmic',
                body: 'diamond',
                eyes: 'laser',
                mouth: 'diamond_grill',
                accessories: 'crown',
                special: 'lightning_aura',
            };

            const commonTraits = {
                background: 'plain_white',
                body: 'diamond',
                eyes: 'laser',
                mouth: 'diamond_grill',
                accessories: 'crown',
                special: 'lightning_aura',
            };

            const rareResult = rarityService.calculateRarity(rareTraits);
            const commonResult = rarityService.calculateRarity(commonTraits);

            expect(rareResult.score).toBeGreaterThan(commonResult.score);
        });
    });
});