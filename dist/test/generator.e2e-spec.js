"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const testing_1 = require("@nestjs/testing");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const app_module_1 = require("../src/app.module");
const http_exception_filter_1 = require("../src/common/filters/http-exception.filter");
const ipfs_service_1 = require("../src/modules/generator/ipfs.service");
const rarity_service_1 = require("../src/modules/generator/rarity.service");
(0, vitest_1.describe)('Generator Endpoints', () => {
    let app;
    let authToken;
    const testWallet = '0x1234567890123456789012345678901234567890';
    const mockIpfsService = {
        uploadImage: vitest_1.vi.fn().mockResolvedValue('ipfs://QmTestImageCid123'),
        uploadMetadata: vitest_1.vi.fn().mockResolvedValue('ipfs://QmTestMetadataCid456'),
        getGatewayUrl: vitest_1.vi.fn((uri) => `https://gateway.pinata.cloud/ipfs/${uri.replace('ipfs://', '')}`),
    };
    (0, vitest_1.beforeAll)(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        })
            .overrideProvider(ipfs_service_1.IpfsService)
            .useValue(mockIpfsService)
            .compile();
        app = moduleRef.createNestApplication(new platform_fastify_1.FastifyAdapter());
        app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
        await app.init();
        await app.getHttpAdapter().getInstance().ready();
        const nonceRes = await (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/nonce')
            .send({ walletAddress: testWallet });
        const verifyRes = await (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/verify')
            .send({
            walletAddress: testWallet,
            signature: 'test',
            nonce: nonceRes.body.nonce,
        });
        authToken = verifyRes.body.token;
    }, 30000);
    (0, vitest_1.afterAll)(async () => {
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
    (0, vitest_1.describe)('POST /api/ai/intelligent-layer/v1/generate', () => {
        (0, vitest_1.describe)('Authentication', () => {
            (0, vitest_1.it)('returns 401 without Authorization header', async () => {
                await (0, supertest_1.default)(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .send(validRequest)
                    .expect(401);
            });
            (0, vitest_1.it)('returns 401 with invalid token', async () => {
                await (0, supertest_1.default)(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', 'Bearer invalid-token')
                    .send(validRequest)
                    .expect(401);
            });
            (0, vitest_1.it)('returns 401 with malformed header', async () => {
                await (0, supertest_1.default)(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', 'NotBearer token')
                    .send(validRequest)
                    .expect(401);
            });
        });
        (0, vitest_1.describe)('Validation', () => {
            (0, vitest_1.it)('returns 400 when prompt is missing', async () => {
                const response = await (0, supertest_1.default)(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ traits: validRequest.traits })
                    .expect(400);
                (0, vitest_1.expect)(response.body.statusCode).toBe(400);
            });
            (0, vitest_1.it)('returns 400 when prompt exceeds 500 characters', async () => {
                const response = await (0, supertest_1.default)(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                    prompt: 'x'.repeat(501),
                    traits: validRequest.traits,
                })
                    .expect(400);
                (0, vitest_1.expect)(response.body.statusCode).toBe(400);
            });
            (0, vitest_1.it)('returns 400 when traits object is missing', async () => {
                await (0, supertest_1.default)(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ prompt: 'test prompt' })
                    .expect(400);
            });
            (0, vitest_1.it)('returns 400 when a trait category is missing', async () => {
                const incompleteTraits = { ...validRequest.traits };
                delete incompleteTraits.background;
                await (0, supertest_1.default)(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ prompt: 'test', traits: incompleteTraits })
                    .expect(400);
            });
            (0, vitest_1.it)('returns 400 when trait value is invalid', async () => {
                const invalidTraits = { ...validRequest.traits, background: 'invalid_value' };
                await (0, supertest_1.default)(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ prompt: 'test', traits: invalidTraits })
                    .expect(400);
            });
        });
        (0, vitest_1.describe)('Successful Generation', () => {
            (0, vitest_1.it)('returns 200 with valid request', async () => {
                const response = await (0, supertest_1.default)(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validRequest)
                    .expect(200);
                (0, vitest_1.expect)(response.body.imageUrl).toBeDefined();
                (0, vitest_1.expect)(response.body.metadataUrl).toBeDefined();
                (0, vitest_1.expect)(response.body.gatewayUrl).toBeDefined();
                (0, vitest_1.expect)(response.body.metadata).toBeDefined();
                (0, vitest_1.expect)(response.body.rarity).toBeDefined();
            });
            (0, vitest_1.it)('returns correct IPFS URLs', async () => {
                const response = await (0, supertest_1.default)(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validRequest)
                    .expect(200);
                (0, vitest_1.expect)(response.body.imageUrl).toMatch(/^ipfs:\/\//);
                (0, vitest_1.expect)(response.body.metadataUrl).toMatch(/^ipfs:\/\//);
                (0, vitest_1.expect)(response.body.gatewayUrl).toMatch(/^https:\/\//);
            });
            (0, vitest_1.it)('returns correct metadata structure', async () => {
                const response = await (0, supertest_1.default)(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validRequest)
                    .expect(200);
                const { metadata } = response.body;
                (0, vitest_1.expect)(metadata.name).toContain('CRO212HUB Genesis #');
                (0, vitest_1.expect)(metadata.description).toBe(validRequest.prompt);
                (0, vitest_1.expect)(metadata.image).toMatch(/^ipfs:\/\//);
                (0, vitest_1.expect)(metadata.attributes).toHaveLength(6);
                (0, vitest_1.expect)(metadata.properties.creator).toBe(testWallet.toLowerCase());
                (0, vitest_1.expect)(metadata.properties.collection).toBe('CRO212HUB Genesis');
                (0, vitest_1.expect)(metadata.properties.engine).toBe('Generator V1');
                (0, vitest_1.expect)(metadata.properties.chainId).toBe(338);
            });
            (0, vitest_1.it)('uses custom chainId when provided', async () => {
                const response = await (0, supertest_1.default)(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ ...validRequest, chainId: 25 })
                    .expect(200);
                (0, vitest_1.expect)(response.body.metadata.properties.chainId).toBe(25);
            });
            (0, vitest_1.it)('returns valid rarity object', async () => {
                const response = await (0, supertest_1.default)(app.getHttpServer())
                    .post('/api/ai/intelligent-layer/v1/generate')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validRequest)
                    .expect(200);
                const { rarity } = response.body;
                (0, vitest_1.expect)(rarity.score).toBeGreaterThanOrEqual(0);
                (0, vitest_1.expect)(rarity.score).toBeLessThanOrEqual(100);
                (0, vitest_1.expect)(['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common']).toContain(rarity.rank);
                (0, vitest_1.expect)(Object.keys(rarity.breakdown)).toHaveLength(6);
            });
        });
    });
    (0, vitest_1.describe)('RarityService Unit Tests', () => {
        let rarityService;
        (0, vitest_1.beforeAll)(() => {
            rarityService = new rarity_service_1.RarityService();
        });
        (0, vitest_1.it)('calculates Legendary rank for all rarest traits', () => {
            const traits = {
                background: 'cosmic',
                body: 'diamond',
                eyes: 'laser',
                mouth: 'diamond_grill',
                accessories: 'crown',
                special: 'lightning_aura',
            };
            const result = rarityService.calculateRarity(traits);
            (0, vitest_1.expect)(result.score).toBeGreaterThan(95);
            (0, vitest_1.expect)(result.rank).toBe('Legendary');
        });
        (0, vitest_1.it)('calculates Rare rank for all common traits', () => {
            const traits = {
                background: 'plain_white',
                body: 'basic',
                eyes: 'normal',
                mouth: 'open',
                accessories: 'none',
                special: 'none',
            };
            const result = rarityService.calculateRarity(traits);
            (0, vitest_1.expect)(result.score).toBeGreaterThan(50);
            (0, vitest_1.expect)(result.score).toBeLessThan(75);
            (0, vitest_1.expect)(result.rank).toBe('Rare');
        });
        (0, vitest_1.it)('calculates score in expected range for mixed traits', () => {
            const traits = {
                background: 'midnight',
                body: 'clay',
                eyes: 'amber',
                mouth: 'neutral',
                accessories: 'cap',
                special: 'none',
            };
            const result = rarityService.calculateRarity(traits);
            (0, vitest_1.expect)(result.score).toBeGreaterThanOrEqual(50);
            (0, vitest_1.expect)(result.score).toBeLessThanOrEqual(100);
        });
        (0, vitest_1.it)('returns correct breakdown percentages', () => {
            const traits = {
                background: 'cosmic',
                body: 'basic',
                eyes: 'normal',
                mouth: 'open',
                accessories: 'none',
                special: 'none',
            };
            const result = rarityService.calculateRarity(traits);
            (0, vitest_1.expect)(result.breakdown.background).toBe(97);
        });
        (0, vitest_1.it)('calculates score decrease when traits become more common', () => {
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
            (0, vitest_1.expect)(rareResult.score).toBeGreaterThan(commonResult.score);
        });
    });
});
//# sourceMappingURL=generator.e2e-spec.js.map