import { NestFactory } from '@nestjs/core';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import { AppModule } from '@/app.module';
import { appConfig } from '@/config/app.config';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({
            logger: {
                level: appConfig.NODE_ENV === 'production' ? 'info' : 'debug',
                transport:
                    appConfig.NODE_ENV !== 'production'
                        ? { target: 'pino-pretty', options: { colorize: true } }
                        : undefined,
            },
        }),
    );

    // Security: Helmet headers
    await app.register(fastifyHelmet, {
        contentSecurityPolicy: appConfig.NODE_ENV === 'production',
    });

    // Security: Rate limiting
    await app.register(fastifyRateLimit, {
        max: 100,
        timeWindow: '1 minute',
        errorResponseBuilder: () => ({
            statusCode: 429,
            message: ['Too many requests'],
            error: 'Too Many Requests',
        }),
    });

    // CORS
    app.enableCors({
        origin: appConfig.CORS_ORIGIN.split(','),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
    });

    // Global exception filter
    app.useGlobalFilters(new HttpExceptionFilter());

    // Swagger documentation
    const swaggerConfig = new DocumentBuilder()
        .setTitle('CRO212HUB API')
        .setDescription('CRO212HUB NFT Platform - Phase 3 Backend API')
        .setVersion('3.0.0')
        .addBearerAuth()
        .build();

    const documentFactory = () => SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, documentFactory);

    await app.listen(appConfig.PORT, '0.0.0.0');
    console.log(`🚀 CRO212HUB API running on http://localhost:${appConfig.PORT}`);
    console.log(`📚 Swagger docs: http://localhost:${appConfig.PORT}/docs`);
}

bootstrap();