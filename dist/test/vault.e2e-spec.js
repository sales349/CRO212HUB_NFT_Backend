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
(0, vitest_1.describe)('Vault Endpoints', () => {
    let app;
    let authToken;
    let otherAuthToken;
    let savedPresetId;
    const testWallet = '0x1234567890123456789012345678901234567890';
    const otherWallet = '0xABCDABCDABCDABCDABCDABCDABCDABCDABCDABCD';
    const mockIpfsService = {
        uploadImage: vitest_1.vi.fn().mockResolvedValue('ipfs://QmTestImageCid123'),
        uploadMetadata: vitest_1.vi.fn().mockResolvedValue('ipfs://QmTestMetadataCid456'),
        getGatewayUrl: vitest_1.vi.fn((uri) => `https://gateway.pinata.cloud/ipfs/${uri.replace('ipfs://', '')}`),
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
    async function getToken(wallet) {
        const nonceRes = await (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/nonce')
            .send({ walletAddress: wallet });
        const verifyRes = await (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/verify')
            .send({
            walletAddress: wallet,
            signature: 'test',
            nonce: nonceRes.body.nonce,
        });
        return verifyRes.body.token;
    }
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
        authToken = await getToken(testWallet);
        otherAuthToken = await getToken(otherWallet);
    }, 30000);
    (0, vitest_1.afterAll)(async () => {
        if (app) {
            await app.close();
        }
    });
    (0, vitest_1.describe)('POST /vault/save-preset', () => {
        (0, vitest_1.it)('returns 401 without auth', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/vault/save-preset')
                .send(validPreset)
                .expect(401);
        });
        (0, vitest_1.it)('returns 400 with missing name', async () => {
            const { name: _, ...noName } = validPreset;
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/vault/save-preset')
                .set('Authorization', `Bearer ${authToken}`)
                .send(noName)
                .expect(400);
        });
        (0, vitest_1.it)('saves preset successfully', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/vault/save-preset')
                .set('Authorization', `Bearer ${authToken}`)
                .send(validPreset)
                .expect(201);
            (0, vitest_1.expect)(response.body.success).toBe(true);
            (0, vitest_1.expect)(response.body.preset).toBeDefined();
            (0, vitest_1.expect)(response.body.preset.name).toBe(validPreset.name);
            (0, vitest_1.expect)(response.body.preset.walletAddress).toBe(testWallet.toLowerCase());
            (0, vitest_1.expect)(response.body.preset.rarity.rank).toBe('Legendary');
            savedPresetId = response.body.preset._id;
        });
        (0, vitest_1.it)('saves a second preset', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/vault/save-preset')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ...validPreset, name: 'Second Preset' })
                .expect(201);
            (0, vitest_1.expect)(response.body.success).toBe(true);
        });
    });
    (0, vitest_1.describe)('GET /vault/presets', () => {
        (0, vitest_1.it)('returns 401 without auth', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .get('/vault/presets')
                .expect(401);
        });
        (0, vitest_1.it)('lists user presets only', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/vault/presets')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            (0, vitest_1.expect)(response.body.success).toBe(true);
            (0, vitest_1.expect)(response.body.presets.length).toBeGreaterThanOrEqual(2);
            (0, vitest_1.expect)(response.body.total).toBeGreaterThanOrEqual(2);
            (0, vitest_1.expect)(response.body.page).toBe(1);
            (0, vitest_1.expect)(response.body.limit).toBe(20);
            for (const preset of response.body.presets) {
                (0, vitest_1.expect)(preset.walletAddress).toBe(testWallet.toLowerCase());
            }
        });
        (0, vitest_1.it)('returns empty array for user with no presets', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/vault/presets')
                .set('Authorization', `Bearer ${otherAuthToken}`)
                .expect(200);
            (0, vitest_1.expect)(response.body.success).toBe(true);
            (0, vitest_1.expect)(response.body.presets).toHaveLength(0);
            (0, vitest_1.expect)(response.body.total).toBe(0);
        });
        (0, vitest_1.it)('pagination works', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/vault/presets?page=1&limit=1')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            (0, vitest_1.expect)(response.body.presets).toHaveLength(1);
            (0, vitest_1.expect)(response.body.total).toBeGreaterThanOrEqual(2);
        });
        (0, vitest_1.it)('sort by rarity works', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/vault/presets?sort=rarity')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            (0, vitest_1.expect)(response.body.presets.length).toBeGreaterThanOrEqual(1);
        });
    });
    (0, vitest_1.describe)('GET /vault/presets/:id', () => {
        (0, vitest_1.it)('returns preset by id', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get(`/vault/presets/${savedPresetId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            (0, vitest_1.expect)(response.body.success).toBe(true);
            (0, vitest_1.expect)(response.body.preset.name).toBe(validPreset.name);
        });
        (0, vitest_1.it)('returns 404 for non-existent preset', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .get('/vault/presets/67890abcdef1234567890abc')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });
    });
    (0, vitest_1.describe)('GET /vault/presets/:id/avatar', () => {
        (0, vitest_1.it)('returns avatar data', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get(`/vault/presets/${savedPresetId}/avatar`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            (0, vitest_1.expect)(response.body.success).toBe(true);
            (0, vitest_1.expect)(response.body.avatarConfig.width).toBe(512);
            (0, vitest_1.expect)(response.body.avatarConfig.height).toBe(512);
            (0, vitest_1.expect)(response.body.avatarConfig.format).toBe('png');
        });
    });
    (0, vitest_1.describe)('POST /vault/remix', () => {
        (0, vitest_1.it)('returns 401 without auth', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/vault/remix')
                .send({
                sourcePresetId: savedPresetId,
                newTraits: { background: 'midnight' },
            })
                .expect(401);
        });
        (0, vitest_1.it)('returns 400 when no traits changed', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/vault/remix')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                sourcePresetId: savedPresetId,
                newTraits: {},
            })
                .expect(400);
        });
        (0, vitest_1.it)('returns 404 for non-existent source preset', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/vault/remix')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                sourcePresetId: '67890abcdef1234567890abc',
                newTraits: { background: 'midnight' },
            })
                .expect(404);
        });
        (0, vitest_1.it)('remixes preset successfully', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/vault/remix')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                sourcePresetId: savedPresetId,
                newTraits: { background: 'midnight' },
            })
                .expect(200);
            (0, vitest_1.expect)(response.body.success).toBe(true);
            (0, vitest_1.expect)(response.body.isRemix).toBe(true);
            (0, vitest_1.expect)(response.body.sourcePresetId).toBe(savedPresetId);
            (0, vitest_1.expect)(response.body.imageUrl).toBeDefined();
            (0, vitest_1.expect)(response.body.rarity).toBeDefined();
        });
    });
    (0, vitest_1.describe)('DELETE /vault/presets/:id', () => {
        (0, vitest_1.it)('returns 403 for non-owner', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .delete(`/vault/presets/${savedPresetId}`)
                .set('Authorization', `Bearer ${otherAuthToken}`)
                .expect(403);
        });
        (0, vitest_1.it)('returns 404 for non-existent preset', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .delete('/vault/presets/67890abcdef1234567890abc')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });
        (0, vitest_1.it)('deletes preset for owner', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .delete(`/vault/presets/${savedPresetId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            await (0, supertest_1.default)(app.getHttpServer())
                .get(`/vault/presets/${savedPresetId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });
    });
});
//# sourceMappingURL=vault.e2e-spec.js.map