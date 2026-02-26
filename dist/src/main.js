"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("@fastify/helmet"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const app_module_1 = require("./app.module");
const app_config_1 = require("./config/app.config");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter({
        logger: {
            level: app_config_1.appConfig.NODE_ENV === 'production' ? 'info' : 'debug',
            transport: app_config_1.appConfig.NODE_ENV !== 'production'
                ? { target: 'pino-pretty', options: { colorize: true } }
                : undefined,
        },
    }));
    await app.register(helmet_1.default, {
        contentSecurityPolicy: app_config_1.appConfig.NODE_ENV === 'production',
    });
    await app.register(rate_limit_1.default, {
        max: 100,
        timeWindow: '1 minute',
        errorResponseBuilder: () => ({
            statusCode: 429,
            message: ['Too many requests'],
            error: 'Too Many Requests',
        }),
    });
    app.enableCors({
        origin: app_config_1.appConfig.CORS_ORIGIN.split(','),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
    });
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('CRO212HUB API')
        .setDescription('CRO212HUB NFT Platform - Phase 3 Backend API')
        .setVersion('3.0.0')
        .addBearerAuth()
        .build();
    const documentFactory = () => swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, documentFactory);
    await app.listen(app_config_1.appConfig.PORT, '0.0.0.0');
    console.log(`🚀 CRO212HUB API running on http://localhost:${app_config_1.appConfig.PORT}`);
    console.log(`📚 Swagger docs: http://localhost:${app_config_1.appConfig.PORT}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map