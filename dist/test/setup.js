"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestApp = createTestApp;
exports.closeTestApp = closeTestApp;
const testing_1 = require("@nestjs/testing");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const app_module_1 = require("../src/app.module");
const http_exception_filter_1 = require("../src/common/filters/http-exception.filter");
async function createTestApp() {
    const moduleRef = await testing_1.Test.createTestingModule({
        imports: [app_module_1.AppModule],
    }).compile();
    const app = moduleRef.createNestApplication(new platform_fastify_1.FastifyAdapter());
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    return app;
}
async function closeTestApp(app) {
    if (app) {
        await app.close();
    }
}
//# sourceMappingURL=setup.js.map