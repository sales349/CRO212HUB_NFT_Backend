"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const setup_1 = require("./setup");
(0, vitest_1.describe)('Health Endpoints', () => {
    let app;
    (0, vitest_1.beforeAll)(async () => {
        app = await (0, setup_1.createTestApp)();
    }, 30000);
    (0, vitest_1.afterAll)(async () => {
        await (0, setup_1.closeTestApp)(app);
    });
    (0, vitest_1.describe)('GET /health', () => {
        (0, vitest_1.it)('returns ok status', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/health')
                .expect(200);
            (0, vitest_1.expect)(response.body.status).toBe('ok');
            (0, vitest_1.expect)(response.body.timestamp).toBeDefined();
            (0, vitest_1.expect)(response.body.uptime).toBeGreaterThan(0);
        });
    });
    (0, vitest_1.describe)('GET /health/ready', () => {
        (0, vitest_1.it)('returns ready status with service checks', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/health/ready')
                .expect(200);
            (0, vitest_1.expect)(response.body.status).toBeDefined();
            (0, vitest_1.expect)(response.body.checks).toBeDefined();
            (0, vitest_1.expect)(response.body.checks.mongodb).toBe('connected');
            (0, vitest_1.expect)(response.body.checks.redis).toBe('connected');
        });
    });
});
//# sourceMappingURL=health.e2e-spec.js.map